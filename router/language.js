const express = require('express');
const router = express.Router();
const {readFileSync,readFile} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox} = require('../function');


router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/language.html','utf-8');
    let msgbox = '';
    let all_l = 0; //語言數量
    let all_s = 0; //靜態數量
    let data = {
        "Language":[],
        "Static":[]
    }
    
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
    db.execute(`SELECT SP_ID,SP_Name,L_Name,Languages.L_ID,COUNT(L_Name) L_Name_Count FROM Static_page LEFT JOIN Resource_data 
    ON Static_page.SP_ID = Resource_data.R_ID LEFT JOIN Languages ON Resource_data.L_ID = Languages.L_ID 
    GROUP BY Languages.L_ID,SP_ID  ORDER BY Languages.L_ID,SP_ID;`,(err,results)=>{
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
    let html = readFileSync('./public/html/back_end/language_add.html','utf-8');
    res.end(html)
})

//這邊繼續
router.get('/static/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/language_edit.html','utf-8');
    res.end(html)
})






module.exports = router;