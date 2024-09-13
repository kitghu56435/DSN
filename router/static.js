const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const db = require('../db');
const monitor = require('../model/monitor');
const search = require('../model/search');
const resource = require('../model/resource');
const message = require('../model/message');

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
    search.Record(req.body,req.cookies.utoken,L_ID);
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

    search.searchResource_identity(identity,L_ID).then((results)=>{
        let match = false;
        let add_num = 0;
        for(i = 0;i<results.length;i++){
            for(j = 0;j<temp_R_List.length-add_num;j++){
                if(temp_R_List[j].R_ID == results[i].R_ID){
                    temp_R_List[j].R_Label.push(getR_Label_leng(search.getMultiple_IdentityText(identity,results[i].R_Identity),L_ID));
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
                    "R_Label" : [getR_Label_leng(search.getMultiple_IdentityText(identity,results[i].R_Identity),L_ID)],
                    "R_Img" : results[i].R_Img,
                    "Search_Type" : "search"
                })
            }
            match = false;
        }
        //console.log(temp_R_List)
    })

    

    //申請者狀況過濾(適合資料)(不符合需要刪掉，如果申請狀況沒有提供，就保留符合資源需求的資源)
    search.searchResource_condition(condition,L_ID).then((results)=>{
        for(i = 0;i<results.length;i++){
            for(j = 0;j<temp_R_List.length;j++){
                if(temp_R_List[j].R_ID == results[i].R_ID){
                    temp_R_List[j].R_Label.push(getR_Label_leng(search.getMultiple_ConditionText(condition,results[i].R_Condition),L_ID));
                    temp_R_List2.push(temp_R_List[j]); 
                    break;
                }
            }
        }
        //如果申請狀況沒有提供，就保留符合資源需求的資源
        if(!condition){
            for(j = 0;j<temp_R_List.length;j++){
                if(search.checkDemand(demand,temp_R_List[j].D_ID)){
                    //temp_R_List[j].R_Label.push(getR_Label_leng(search.getMultiple_ConditionText(condition,results[i].R_Condition),L_ID));
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
        search.searchResource_school(school,L_ID).then((results)=>{
            //如果沒有提供在校狀況，則跳過
            for(i = 0;i<results.length;i++){
                for(j = 0;j<temp_R_List.length;j++){
                    if(temp_R_List[j].R_ID == results[i].R_ID){
                        temp_R_List[j].R_Label.push(getR_Label_leng(search.getMultiple_SchoolText(school,results[i].R_School),L_ID));
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
        search.searchResource_location(R_City).then((results)=>{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<temp_R_List.length;j++){
                    if(temp_R_List[j].R_ID == results[i].R_ID){
                        temp_R_List[j].R_Label.push(getR_Label_leng(search.getMultiple_LocationText(R_City,results[i].R_City),L_ID));
                        data.R_List.push(temp_R_List[j])
                        break;
                    }
                }
            }
        })
    }
    

    if(condition){
        //加入強制資源(強制資料)
        search.searchResource_requestData(condition,L_ID).then((results)=>{
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
    search.searchResource_suitable(demand).then((results)=>{
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

    message.createResource_feedback(msg,utoken,R_ID).then(()=>{
        res.json({'msg':'done'});
    }).catch(()=>{
        res.json({'msg':'dberr'});
    })
})


//傳入Like API
router.post('/like',(req,res)=>{
    let utoken = req.cookies.utoken;
    let R_ID = req.body.R_ID;
    
    resource.setResource_Like(R_ID,utoken).then((data)=>{
        res.json({'msg':'done','Num':data.Num,'state':data.state});
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





module.exports = router;