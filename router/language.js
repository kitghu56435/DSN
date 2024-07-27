const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const language = require('../model/language');
const db = require('../db');
const {Administrator_verafication,setMsgbox} = require('../function');

router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/language/language.html','utf-8');
    let msgbox = '';
    let all_l = 0; //語言數量
    let all_s = 0; //靜態數量
    let data = {
        "Language":[],
        "Static":[]
    }




    //語言列表
    db.execute(`SELECT Languages.L_ID,L_Name,(COUNT(Languages.L_ID)-1) L_Use,DATE_FORMAT(L_Date,'%Y年%m月%d日 %H:%i:%s') L_Date_f FROM Languages 
    LEFT JOIN Resource_data ON Resource_data.L_ID = Languages.L_ID GROUP BY Languages.L_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            all_l = results.length;
            for(i = 0;i<results.length;i++){
                data.Language.push({
                    "L_ID" : results[i].L_ID,
                    "L_Name" : results[i].L_Name,
                    "L_Use" : results[i].L_Use,
                    "L_Date" : results[i].L_Date_f
                });
            }
        }
    })
    //靜態頁面資料
    db.execute(`SELECT SP_ID,SP_Name,L_Name,Languages.L_ID,COUNT(L_Name) L_Name_Count FROM Static_page LEFT JOIN Resource_data 
    ON Static_page.SP_ID = Resource_data.R_ID LEFT JOIN Languages ON Resource_data.L_ID = Languages.L_ID 
    GROUP BY SP_ID,Languages.L_ID  ORDER BY SP_ID,Languages.L_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            if(results.length != 0){
                let now_sp = results[0].SP_ID;
                all_s = 1;

                data.Static.push({
                    "SP_ID" : results[0].SP_ID,
                    "Static_Name" : results[0].SP_Name,
                    "Static_Use" : [results[0].L_Name],
                })

                for(i = 1;i<results.length;i++){
                    if(results[i].SP_ID != now_sp){
                        now_sp = results[i].SP_ID;
                        all_s += 1; 
                        data.Static.push({
                            "SP_ID" : results[i].SP_ID,
                            "Static_Name" : results[i].SP_Name,
                            "Static_Use" : [results[i].L_Name],
                        })
                    }else{
                        data.Static[data.Static.length-1].Static_Use.push(results[i].L_Name);
                    }
                }
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${all_l});
        setData_block(1,${all_s});
        setLanguage(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
    
})



router.get('/add',(req,res)=>{
    let html = readFileSync('./public/html/back_end/language/language_add.html','utf-8');
    let data = req.query.data;
    let msgbox = '';
    switch(data){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }
    
    html += `<script>
    ${setMsgbox(msgbox)}
    </script>
    `;
    res.end(html)
})


router.post('/add/data',(req,res)=>{
    let L_Name = req.body.L_Name;

    language.Create_Language(L_Name).then(()=>{
        res.writeHead(303,{Location:'/backend/language'});
        res.end();
    }).catch((info)=>{
        if(info == 'dataerr'){
            res.writeHead(303,{Location:'/backend/language/add?data=err'});
        }else{
            res.writeHead(303,{Location:'/backend/language/add?data=create_err'});
        }
        res.end();
    })
})


router.post('/delete',(req,res)=>{
    let L_ID = req.body.L_ID;
    
    

    language.Delete_Language(L_ID).then((data)=>{
        res.json(data)
    }).catch((info)=>{
        res.json({"msg":info})
    })

    
})




router.get('/static',(req,res)=>{
    let html = readFileSync('./public/html/back_end/static/static.html','utf-8');
    let all_s = 0;
    let msgbox = '';
    let data = {  
        "Static":[]
    }


    db.execute(`SELECT SP_ID,SP_Name,SP_File,L_Name,Languages.L_ID,COUNT(L_Name) L_Name_Count FROM Static_page LEFT JOIN Resource_data 
    ON Static_page.SP_ID = Resource_data.R_ID LEFT JOIN Languages ON Resource_data.L_ID = Languages.L_ID 
    GROUP BY SP_ID,Languages.L_ID  ORDER BY SP_ID,Languages.L_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            if(results.length != 0){
                let now_sp = results[0].SP_ID;
                all_s = 1;

                data.Static.push({
                    "SP_ID" : results[0].SP_ID,
                    "Static_Name" : results[0].SP_Name,
                    "SP_File" : results[0].SP_File,
                    "Static_Use" : [results[0].L_Name],
                })

                for(i = 1;i<results.length;i++){
                    if(results[i].SP_ID != now_sp){
                        now_sp = results[i].SP_ID;
                        all_s += 1; 
                        data.Static.push({
                            "SP_ID" : results[i].SP_ID,
                            "Static_Name" : results[i].SP_Name,
                            "SP_File" : results[i].SP_File,
                            "Static_Use" : [results[i].L_Name],
                        })
                    }else{
                        data.Static[data.Static.length-1].Static_Use.push(results[i].L_Name);
                    }
                }
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${all_s});
        setStatic(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})


router.get('/static/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/static/static_edit.html','utf-8');
    let SP_ID = req.query.SP_ID;
    let L_ID = req.query.L_ID;

    if(L_ID == undefined) L_ID = 'L000000001';

    html += `
    <script>
    getStatic_data('${SP_ID}','${L_ID}');
    </script>`
    res.end(html);
})



router.post('/static/edit/data',(req,res)=>{
    let L_ID = req.body.L_ID;
    let SP_ID = req.body.SP_ID;
    
    language.getStatic_data(L_ID,SP_ID).then((data)=>{
        res.json(data)
    })

})



router.post('/static/edit/save',(req,res)=>{
    
    language.saveStatic_data(req.body).then((msg)=>{
        res.json({"msg":msg})
    })
})










module.exports = router;