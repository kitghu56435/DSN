const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const db = require('../db');
const {Required_Resource,NextID,find} = require('../function');
const moment = require('moment-timezone');
const monitor = require('../model/monitor');


//這個API是為了開發測試header語言切換而再的
router.get('/header',(req,res)=>{
    let html = readFileSync('./public/html/front_end/header.html');
    res.end(html);
})
router.post('/header_data',(req,res)=>{
    let Page = req.body.Page;
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    let data = {
        "Page" : Page,
        "L_Name" : "",
        "lang" : [],
        "data" : [],
        "static_data" : []
    }
    db.execute(`SELECT L_ID,L_Name FROM Languages`,(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            data.lang = results
            for(i = 0;i<results.length;i++){
                if(results[i].L_ID == L_ID){
                    data.L_Name = results[i].L_Name;
                }
            }
        }
    })
    db.execute(`SELECT * FROM Demand,Resources,Resource_data WHERE Demand.D_ID = Resources.D_ID AND Resources.R_ID = Resource_data.R_ID AND RD_Type = 2 
    AND Resource_data.L_ID = ? AND Demand.L_ID = ? AND R_Delete = 0 AND R_Shelf = 1 ORDER BY Demand.D_ID,Resources.R_ID;
    `,[L_ID,L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            if(results.length != 0){
                let D_data = {};
                let now = results[0].D_ID;
                let resource = [];
    
                D_data.D_ID = results[0].D_ID;
                D_data.D_Name = results[0].D_Name;
                for(i = 0;i<results.length;i++){
                    resource.push({
                        "R_ID" : results[i].R_ID,
                        "R_Name" : results[i].RD_Content,
                    });
                    if(i != results.length - 1){
                        if(results[i+1].D_ID != now){
                            D_data.resource = resource;
                            data.data.push(D_data);
        
                            D_data = {};
                            resource = [];
                            D_data.D_ID = results[i+1].D_ID;
                            D_data.D_Name = results[i+1].D_Name;
                            now = results[i+1].D_ID;
                        }
                    }else{
                        D_data.resource = resource;
                        data.data.push(D_data);
                    }
                    
                }
            }
        }
    })
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000003';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            data.static_data = results;
            res.json(data);
        }
    })
    
})


router.post('/index_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000001';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
    
})


router.get('/search',(req,res)=>{
    let html = readFileSync('./public/html/front_end/search.html','utf-8');
    monitor.Flow('search',req.cookies.utoken);



    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})
router.post('/search_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000014';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.post('/search_results',(req,res)=>{
    let html = readFileSync('./public/html/front_end/search_r.html','utf-8');
    monitor.Flow('search_results',req.cookies.utoken);
    let L_ID = req.cookies.leng;
    let demand = req.body.demand;
    let identity = req.body.identity;
    let school = req.body.school;
    let condition = req.body.condition;
    let R_City = req.body.R_City;
    let R_District = req.body.R_District;
    let temp_R_List = [];    //暫時存放的列表1
    let temp_R_List2 = [];    //暫時存放的列表2
    let data = {
        "Search_data" : {
            "demand" : demand,
            "identity" : identity,
            "condition" : condition,
            "school" : school,
            "R_City" : R_City,
            "R_District" : R_District,
        },
        "R_List" : [],
    }


    
    
    
    //申請者身分過濾(適合資料)
    new Promise((resolve,reject)=>{
        resolve(searchResource_identity(identity,L_ID));
    }).then((results)=>{
        let match = false;
        let add_num = 0;
        for(i = 0;i<results.length;i++){
            for(j = 0;j<temp_R_List.length-add_num;j++){
                if(temp_R_List[j].R_ID == results[i].R_ID){
                    temp_R_List[j].R_Label.push(getR_Label_leng(getMultiple_IdentityText(identity,results[i].R_Identity),L_ID));
                    match = true;
                    break;
                }
            }
            if(!match){
                add_num++;
                temp_R_List.push({
                    "D_ID" : results[i].D_ID,
                    "D_Name" : results[i].D_Name,
                    "R_ID" : results[i].R_ID,
                    "R_Name" : results[i].R_Name,
                    "R_Depiction" : results[i].R_Depiction,
                    "R_Label" : [getR_Label_leng(getMultiple_IdentityText(identity,results[i].R_Identity),L_ID)],
                    "R_Img" : results[i].R_Img,
                    "Search_Type" : "search"
                })
            }
            match = false;
        }
        //console.log(temp_R_List)
    })

    

    //申請者狀況過濾(適合資料)(不符合需要刪掉，如果申請狀況沒有提供，就保留符合資源需求的資源)
    new Promise((resolve,reject)=>{
        resolve(searchResource_condition(condition,L_ID));
    }).then((results)=>{
        for(i = 0;i<results.length;i++){
            for(j = 0;j<temp_R_List.length;j++){
                if(temp_R_List[j].R_ID == results[i].R_ID){
                    temp_R_List[j].R_Label.push(getR_Label_leng(getMultiple_ConditionText(condition,results[i].R_Condition),L_ID));
                    temp_R_List2.push(temp_R_List[j]); 
                    break;
                }
            }
        }
        //如果申請狀況沒有提供，就保留符合資源需求的資源
        if(!condition){
            for(j = 0;j<temp_R_List.length;j++){
                if(checkDemand(demand,temp_R_List[j].D_ID)){
                    //temp_R_List[j].R_Label.push(getR_Label_leng(getMultiple_ConditionText(condition,results[i].R_Condition),L_ID));
                    temp_R_List2.push(temp_R_List[j]); 
                }
            }
        }
        
        
        temp_R_List = temp_R_List2;
        temp_R_List2 = [];
        //console.log(temp_R_List);
    })



    //申請者在學狀況過濾(適合資料)(不符合需要刪掉)
    if(school){
        new Promise((resolve,reject)=>{
            resolve(searchResource_school(school,L_ID));
        }).then((results)=>{
            
            //如果沒有提供在校狀況，則跳過
            for(i = 0;i<results.length;i++){
                for(j = 0;j<temp_R_List.length;j++){
                    if(temp_R_List[j].R_ID == results[i].R_ID){
                        temp_R_List[j].R_Label.push(getR_Label_leng(getMultiple_SchoolText(school,results[i].R_School),L_ID));
                        temp_R_List2.push(temp_R_List[j]); 
                        break;
                    }
                }
            }
            temp_R_List = temp_R_List2;
            temp_R_List2 = [];
            
        })
    }


    

    //申請者地區過濾(適合資料)(不符合需要刪掉)
    if(R_City){
        new Promise((resolve,reject)=>{
            resolve(searchResource_location(R_City));
        }).then((results)=>{
            
            for(i = 0;i<results.length;i++){
                for(j = 0;j<temp_R_List.length;j++){
                    if(temp_R_List[j].R_ID == results[i].R_ID){
                        temp_R_List[j].R_Label.push(getR_Label_leng(getMultiple_LocationText(R_City,results[i].R_City),L_ID));
                        data.R_List.push(temp_R_List[j])
                        break;
                    }
                }
            }
            //console.log(data.R_List);
        })
    }
    

    if(condition){
        //加入強制資源(強制資料)
        new Promise((resolve,reject)=>{
            resolve(searchResource_requestData(condition,L_ID));
        }).then((results)=>{
            let match = false;
            let add_num = 0;
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.R_List.length-add_num;j++){
                    if(data.R_List[j].R_ID == results[i].R_ID){
                        data.R_List[j].R_Label.push(getR_Label_leng('強烈建議',L_ID));
                        data.R_List[j].Search_Type = 'required';
                        match = true;
                        break;
                    }
                }
                if(!match){
                    add_num++;
                    data.R_List.push({
                        "D_ID" : results[i].D_ID,
                        "D_Name" : results[i].D_Name,
                        "R_ID" : results[i].R_ID,
                        "R_Name" : results[i].R_Name,
                        "R_Depiction" : results[i].R_Depiction,
                        "R_Label" : [getR_Label_leng('強烈建議',L_ID)],
                        "R_Img" : results[i].R_Img,
                        "Search_Type" : "required"
                    })
                }
                match = false;
            }
        })        
    }


    
    
    //使用需求序號，尋找全部適合資源
    //如果有match到，就成為適合資源，沒有就成為建議資源
    new Promise((resolve,reject)=>{
        resolve(searchResource_suitable(demand));
    }).then((results)=>{
        let match = false;
        for(i = 0;i<data.R_List.length;i++){
            for(j = 0;j<results.length;j++){
                if(data.R_List[i].R_ID == results[j].R_ID){
                    match = true;
                    break;
                }
            }
            if(!match){
                if(data.R_List[i].Search_Type == 'search'){  //略過強制資源
                    data.R_List[i].Search_Type = 'suggestion';
                }
                
            }
            match = false;
        }

        html += `<script>
        setSearch_window_L_ID('${req.cookies.leng}');
        setSearch_results(${JSON.stringify(data)});
        </script>
        `;
        if(req.cookies.accept == 'null'){
            html +=  `<script>cookie_msg()</script>`;
        }
        res.end(html);
    })

    
    //尚未開發
    //加入其他資源
    // new Promise((resolve,reject)=>{
        
    // }).then((results)=>{
        
    // })

    
})
router.post('/search_results_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000015';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})


router.get('/notfound',(req,res)=>{
    let html = readFileSync('./public/html/front_end/notfound.html','utf-8');
    monitor.Flow('notfound',req.cookies.utoken);



    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})
router.post('/notfound_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000016';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
            
        }
    })
})



router.get('/guideline',(req,res)=>{
    let html = readFileSync('./public/html/front_end/guideline.html','utf-8');
    monitor.Flow('guideline',req.cookies.utoken);




    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})
router.post('/guideline_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000004';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
            
        }
    })
})



router.get('/about_us',(req,res)=>{
    let html = readFileSync('./public/html/front_end/about_us.html','utf-8');
    monitor.Flow('about_us',req.cookies.utoken);




    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})
router.post('/about_us_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000002';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/cookie_policy',(req,res)=>{
    let html = readFileSync('./public/html/front_end/cookie_policy.html','utf-8');
    monitor.Flow('cookie_policy',req.cookies.utoken);

    
    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})
router.post('/cookie_policy_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000005';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})




router.get('/economy',(req,res)=>{
    let html = readFileSync('./public/html/front_end/finance.html','utf-8');
    monitor.Flow('economy',req.cookies.utoken);


    
    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getEconomy_data();</script>';
    res.end(html);
})
router.post('/economy_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000006';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})




router.get('/emergency',(req,res)=>{
    let html = readFileSync('./public/html/front_end/emergency.html','utf-8');
    monitor.Flow('emergency',req.cookies.utoken);




    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getEmergency_data();</script>';
    res.end(html);
})
router.post('/emergency_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000007';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/law',(req,res)=>{
    let html = readFileSync('./public/html/front_end/law.html','utf-8');
    monitor.Flow('law',req.cookies.utoken);



    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getLaw_data();</script>';
    res.end(html);
})
router.post('/law_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000008';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})




router.get('/application',(req,res)=>{
    let html = readFileSync('./public/html/front_end/application.html','utf-8');
    monitor.Flow('application',req.cookies.utoken);



    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getApplication_data();</script>';
    res.end(html);
})
router.post('/application_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000009';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/psychology',(req,res)=>{
    let html = readFileSync('./public/html/front_end/psychology.html','utf-8');
    monitor.Flow('psychology',req.cookies.utoken);



    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getPsychology_data();</script>';
    res.end(html);
})
router.post('/psychology_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000010';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/education',(req,res)=>{
    let html = readFileSync('./public/html/front_end/education.html','utf-8');
    monitor.Flow('education',req.cookies.utoken);


    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getEducation_data();</script>';
    res.end(html);
})
router.post('/education_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000012';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/career',(req,res)=>{
    let html = readFileSync('./public/html/front_end/career.html','utf-8');
    monitor.Flow('career',req.cookies.utoken);


    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getCareer_data();</script>';
    res.end(html);
})
router.post('/career_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000011';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



router.get('/medical',(req,res)=>{
    let html = readFileSync('./public/html/front_end/medical.html','utf-8');
    monitor.Flow('medical',req.cookies.utoken);


    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    html += '<script>getMedical_data();</script>';
    res.end(html);
})
router.post('/medical_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000013';`,[L_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.json({"msg":"dberr"});
        }else{
            res.json({
                "msg" : "success",
                "L_ID" : L_ID,
                "data" : results
            })
        }
    })
})



//傳入留言API
router.post('/msg',(req,res)=>{
    let utoken = req.cookies.utoken;
    let msg = req.body.msg;
    let R_ID = req.body.R_ID;

    
    new Promise((resolve,reject)=>{
        resolve(createResource_feedback(msg,utoken,R_ID))
    }).then(()=>{
        res.json({'msg':'done'});
    }).catch(()=>{
        res.json({'msg':'dberr'});
    })
})


//傳入Like API
router.post('/like',(req,res)=>{
    let utoken = req.cookies.utoken;
    let R_ID = req.body.R_ID;
    
    new Promise((resolve,reject)=>{
        resolve(setResource_Like(R_ID,utoken))
    }).then((R_Like)=>{
        res.json({'msg':'done','R_Like':R_Like});
    }).catch(()=>{
        res.json({'msg':'dberr'});
    })
})



function getR_Label_leng(str,L_ID){
    if(L_ID == 'L000000002'){
        switch(str){
            case '強烈建議' : return 'Recommend';
            //IdentityText
            case '所有身分' : return 'All Identity';
            case '新住民' : return 'New resident';
            case '新住民子女' : return 'Children of new residents';
            case '原住民' : return 'Aboriginal people';
            case '以上皆否' : return 'None of the above';
            //Condition
            case '身心障礙' : return 'Disability';
            case '經濟弱勢' : return 'Economically disadvantaged';
            case '就職青年' : return 'Job-seeking youth';
            case '單親家庭' : return 'One-parent family';
            case '家事糾紛' : return 'Family dispute';
            case '暴力/霸凌受害者' : return 'Victims of Violence/Bullying';
            case '心理患者' : return 'Psychological patient';
            case '醫院患者' : return 'hospital patient';
            case '懷孕少女' : return 'pregnant girl';
            case '租屋者' : return 'renter';
            //SchoolText
            case '不限就學' : return 'All Study status';
            case '未就學' : return 'Not in school';
            case '國小' : return 'Elementary school';
            case '國中' : return 'junior high school';
            case '高中' : return 'high school';
            case '五專' : return 'junior college';
            case '大學' : return 'college';
            case '研究所' : return 'university';
            case '畢業就學' : return 'Study after graduation';
            //CityText
            case '所有縣市' : return 'All City';
            case '臺北市' : return 'Taipei';
            case '新北市' : return 'New Taipei';
            case '桃園市' : return 'Taoyuan';
            case '台中市' : return 'Taichung';
            case '台南市' : return 'Tainan';
            case '高雄市' : return 'Kaohsiung';
            case '基隆市' : return 'Keelung';
            case '新竹市' : return 'Hsinchu';
            case '新竹縣' : return 'Hsinchu County';
            case '苗栗縣' : return 'Miaoli';
            case '彰化縣' : return 'Changhua';
            case '南投縣' : return 'Nantou';
            case '雲林縣' : return 'Yunlin';
            case '嘉義市' : return 'Chiayi';
            case '嘉義縣' : return 'Chiayi County';
            case '屏東縣' : return 'Pingtung';
            case '宜蘭縣' : return 'Yilan';
            case '花蓮縣' : return 'Hualien';
            case '台東縣' : return 'Taitung';
            case '澎湖縣' : return 'Penghu';
            case '金門縣' : return 'Kinmen';
            case '連江縣' : return 'Lianjiang';
            default : return '';
        }
    }else{
        //預設中文
        return str;
    }
}
function getDemandID(code){
    switch(code){
        case 'A1' : return `D000000001`  //經濟需求
        case 'A2' : return `D000000003`  //法律需求
        case 'A3' : return `D000000002`  //緊急需求
        case 'A4' : return `D000000004`  //教育需求
        case 'A5' : return `D000000005`  //職涯資訊
        case 'A6' : return `D000000006`  //醫療資訊
        case 'A7' : return `D000000007`  //心理資訊
        default : return '';
    }
}
function getIdentityText(code){
    switch(code){
        case 'A0' : return '';  //所有身分回傳空字串
        case 'A1' : return '新住民';
        case 'A2' : return '新住民子女';
        case 'A3' : return '原住民';
        case 'A4' : return '以上皆否';
    }
}
function getSchoolText(code){
    switch(code){
        case 'A0' : return '';  //所有就學回傳空字串
        case 'A1' : return '未就學';
        case 'A2' : return '國小';
        case 'A3' : return '國中';
        case 'A4' : return '高中';
        case 'A5' : return '五專';
        case 'A6' : return '大學';
        case 'A7' : return '研究所';
        case 'A8' : return '畢業就學';
    }
}
function getConditionText(code){
    switch(code){
        case 'A0' : return '';  //所有狀況回傳空字串
        case 'A1' : return '身心障礙';
        case 'A2' : return '經濟弱勢';
        case 'A3' : return '就職青年';
        case 'A4' : return '單親家庭';
        case 'A5' : return '家事糾紛';
        case 'A6' : return '暴力/霸凌受害者';
        case 'A7' : return '心理患者';
        case 'A8' : return '醫院患者';
        case 'A9' : return '懷孕少女';
        case 'B1' : return '租屋者';
    }
}
function getCityText(code){
    switch(code){
        case 'A0' : return '';  //所有縣市回傳空字串
        case 'A1' : return '臺北市';
        case 'A2' : return '新北市';
        case 'A3' : return '桃園市';
        case 'A4' : return '台中市';
        case 'A5' : return '台南市';
        case 'A6' : return '高雄市';
        case 'A7' : return '基隆市';
        case 'A8' : return '新竹市';
        case 'A9' : return '新竹縣';
        case 'B1' : return '苗栗縣';
        case 'B2' : return '彰化縣';
        case 'B3' : return '南投縣';
        case 'B4' : return '雲林縣';
        case 'B5' : return '嘉義市';
        case 'B6' : return '嘉義縣';
        case 'B7' : return '屏東縣';
        case 'B8' : return '宜蘭縣';
        case 'B9' : return '花蓮縣';
        case 'C1' : return '台東縣';
        case 'C2' : return '澎湖縣';
        case 'C3' : return '金門縣';
        case 'C4' : return '連江縣';
    }
}
function getMultiple_IdentityText(identity,R_Identity){
    //identity   使用者搜尋的序號
    //R_Identity 資源的身分序號
    if(R_Identity == 'A0'){
        return getIdentityText(R_Identity);
    }else{
        if(typeof identity == 'string'){
            if(find(identity,R_Identity)){
                //console.log(identity,R_Identity);
                return getIdentityText(identity);
            }
        }else if(typeof identity == 'object'){
            let str = '';
            for(h = 0;h<identity.length;h++){
                if(find(identity[h],R_Identity)){
                    str +=  getIdentityText(identity[h]) + "、";
                }
            }
            return str.substring(0,(str.length - 1));
        }
    }
    
}
function getMultiple_ConditionText(condition,R_Condition){
    //condition   使用者搜尋的序號
    //R_Condition 資源的狀況序號
    if(R_Condition == 'A0'){
        return getConditionText(R_Condition);
    }else{
        if(typeof condition == 'string'){
            if(find(condition,R_Condition)){
                //console.log(condition,R_Condition);
                return getConditionText(condition);
            }
        }else if(typeof condition == 'object'){
            let str = '';
            for(h = 0;h<condition.length;h++){
                if(find(condition[h],R_Condition)){
                    str +=  getConditionText(condition[h]) + "、";
                }
            }
            return str.substring(0,(str.length - 1));
        }
    }
}
function getMultiple_SchoolText(school,R_School){
    if(R_School == 'A0'){
        return getSchoolText(R_School);
    }else{
        if(find(school,R_School)){
            return getSchoolText(school);
        }
    }
}
function getMultiple_LocationText(City,R_City){
    if(R_City == 'A0' || City == 'A0'){
        return getCityText(R_City);
    }else{
        if(find(City,R_City)){
            return getCityText(City);
        }
    }
}
function checkDemand(demand,D_ID){
    let found = false;

    if(typeof demand == 'string'){
        if(getDemandID(demand) == D_ID){
            found = true;
        }
    }else if(typeof demand == 'object'){
        let str = '';
        for(h = 0;h<demand.length;h++){
            if(getDemandID(demand[i]) == D_ID){
                found = true;
                break;
            }
        }
    }

    return found;
}
async function searchResource_location(R_City){
    return new Promise((resolve,reject)=>{
        if(R_City == 'A0'){
            db.execute(`SELECT R_ID,R_City FROM Resources WHERE R_Delete = 0 AND Resources.R_Shelf = 1`,(err,results)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    resolve(results)
                }
            })
        }else{
            db.execute(`SELECT R_ID,R_City FROM Resources WHERE R_Delete = 0 AND Resources.R_Shelf = 1 AND (R_City LIKE ? OR R_City LIKE '%A0%')`,['%' + R_City + '%'],(err,results)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    resolve(results)
                }
            })
        }
        
    })
}
async function searchResource_identity(identity,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Identity,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_Identity LIKE '%A0%' `;


    if(typeof identity == 'string'){
        str += 'OR R_Identity LIKE ? ';
        parameter.push(`%${identity}%`);
    }else if(typeof identity == 'object'){
        for(i = 0;i<identity.length;i++){
            str += 'OR R_Identity LIKE ? ';
            parameter.push(`%${identity[i]}%`);
        }
    }

    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_Identity LIKE '%A0%' `;

    parameter.push(L_ID);
    parameter.push(L_ID);

    if(typeof identity == 'string'){
        str += 'OR R_Identity LIKE ? ';
        parameter.push(`%${identity}%`);
    }else if(typeof identity == 'object'){
        for(i = 0;i<identity.length;i++){
            str += 'OR R_Identity LIKE ? ';
            parameter.push(`%${identity[i]}%`);
        }
    }
    str += ')';
    //console.log(str);
    //console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_school(school,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_School,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_School LIKE '%A0%' `

    if(typeof school == 'string'){
        str += 'OR R_School LIKE ? ';
        parameter.push(`%${school}%`);
    }else if(typeof school == 'object'){
        for(i = 0;i<school.length;i++){
            str += 'OR R_School LIKE ? ';
            parameter.push(`%${school[i]}%`);
        }
    }


    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_School LIKE '%A0%' `;


    parameter.push(L_ID);
    parameter.push(L_ID);


    if(typeof school == 'string'){
        str += 'OR R_School LIKE ? ';
        parameter.push(`%${school}%`);
    }else if(typeof school == 'object'){
        for(i = 0;i<school.length;i++){
            str += 'OR R_School LIKE ? ';
            parameter.push(`%${school[i]}%`);
        }
    }
    str += ')';
    // console.log(str);
    // console.log(parameter);
    

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_condition(condition,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Condition,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_Condition LIKE '%A0%' `

    if(typeof condition == 'string'){
        str += 'OR R_Condition LIKE ? ';
        parameter.push(`%${condition}%`);
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){
            str += 'OR R_Condition LIKE ? ';
            parameter.push(`%${condition[i]}%`);
        }
    }


    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_Condition LIKE '%A0%' `;


    parameter.push(L_ID);
    parameter.push(L_ID);


    if(typeof condition == 'string'){
        str += 'OR R_Condition LIKE ? ';
        parameter.push(`%${condition}%`);
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){
            str += 'OR R_Condition LIKE ? ';
            parameter.push(`%${condition[i]}%`);
        }
    }
    str += ')';
    // console.log(str);
    // console.log(parameter);
    

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_suitable(demand){
    let parameter = [];
    str = `SELECT R_ID,Resources.D_ID FROM Resources,Demand WHERE  R_Delete = 0 AND Resources.R_Shelf = 1 AND Demand.D_ID = Resources.D_ID AND L_ID = 'L000000001' AND ( FALSE `;

    if(typeof demand == 'string'){
        str += 'OR Demand.D_ID = ? ';
        parameter.push(`${getDemandID(demand)}`);
    }else if(typeof demand == 'object'){
        for(i = 0;i<demand.length;i++){
            if(demand[i] != 'A8'){  //避開申請需求
                str += 'OR Demand.D_ID = ? ';
                parameter.push(`${getDemandID(demand[i])}`);
            }   
        }
    }
    str += ')';
    
    // console.log(str);
    // console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
    
}
async function searchResource_requestData(condition,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Identity,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT R_ID,RD_Content R_Depiction FROM Resource_data WHERE L_ID = ? `

    if(typeof condition == 'string'){
        if(Required_Resource[condition]){

            for(i = 0;i<Required_Resource[condition].length;i++){
                str += 'AND R_ID = ? ';
                parameter.push(Required_Resource[condition][i]);
            }
            
        }
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){

            if(Required_Resource[condition[i]]){
                for(j = 0;j<Required_Resource[condition[i]].length;j++){
                    str += 'AND R_ID = ? ';
                    parameter.push(Required_Resource[condition[i]][j]);
                }
            }

        }
    }


    str += ` AND RD_Type = 3) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( FALSE `;

    parameter.push(L_ID);
    parameter.push(L_ID);

    if(typeof condition == 'string'){
        if(Required_Resource[condition]){

            for(i = 0;i<Required_Resource[condition].length;i++){
                str += 'OR Resources.R_ID LIKE ? ';
                parameter.push(`%${Required_Resource[condition][i]}%`);
            }
            
        }
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){

            if(Required_Resource[condition[i]]){
                for(j = 0;j<Required_Resource[condition[i]].length;j++){
                    str += 'OR Resources.R_ID LIKE ? ';
                    parameter.push(`%${Required_Resource[condition[i]][j]}%`);
                }
            }

        }
    }
    str += ')';
    //console.log(str);
    //console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function createResource_feedback(msg,utoken,R_ID){
    let RF_ID = await NextID('Resource_feedback','RF_ID','RF');
    let RF_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    if(R_ID == undefined || R_ID == 'undefined'){
        R_ID = null;
    }

    return new Promise((resolve,reject)=>{


        db.execute(`INSERT INTO Resource_feedback VALUES(?,?,?,?,?);`,[RF_ID,R_ID,msg,RF_Date,utoken],(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve()
            }
        })
    })
}
async function setResource_Like(R_ID,utoken){
    let RL_ID = await NextID('Resources_like','RL_ID','RL');
    let RL_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    

    return new Promise((resolve,reject)=>{

        db.execute('SELECT COUNT(*) Num FROM Resources_like WHERE R_ID = ? AND RL_Cookie = ?',[R_ID,utoken],(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                let sql = '';
                let parameter = [];
                if(results[0].Num == 0){  //沒有案讚，這次是要按讚
                    sql = `INSERT INTO Resources_like VALUES(?,?,?,?);`;
                    parameter = [RL_ID,utoken,R_ID,RL_Date];
                }else{ //有案讚，取消按讚
                    sql = `DELETE FROM Resources_like WHERE R_ID = ? AND RL_Cookie = ?`;
                    parameter = [R_ID,utoken];
                }

                db.execute(sql,parameter,(err,results)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{

                        db.execute('SELECT COUNT(*) Num FROM Resources_like WHERE R_ID = ?',[R_ID],(err,results)=>{
                            if(err){
                                console.log(err);
                                reject();
                            }else{
                                resolve(results[0].Num);
                            }
                        })


                    }
                })
                
            }
        })
    })
}


module.exports = router;