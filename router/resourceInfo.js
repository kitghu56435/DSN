const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,checkData,NextID} = require('../function');
const moment = require('moment-timezone');



//先搞定頁首頁尾的切換語言。
router.get('/',(req,res)=>{
    let R_ID = req.query.ID;
    let T_Path = '';
    let L_ID = req.cookies.leng;

    db.execute(`SELECT T_Path FROM Resources,Template WHERE Resources.R_ID = ? AND Resources.T_ID = Template.T_ID AND R_Delete = 0 AND R_Shelf = 1;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.end();
        }else{
            if(results.length == 0){  //資源已下架或刪除
                let html = readFileSync('./public/html/notfound.html','utf-8');
                res.end(html);
            }else{
                T_Path = results[0].T_Path;
                let html = readFileSync('./public/html/template/' + T_Path,'utf-8');
                

                  
                db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE R_ID = ? AND L_ID = ? AND RD_Type = 1`,[R_ID,L_ID],(err,results)=>{
                    if(err){
                        console.log(err);
                        res.end('資料庫錯誤');
                    }else{
                        html += `<script>
                            setResourceInfo_data(${JSON.stringify(results)},'${L_ID}');
                        </script>`;
                        res.end(html);
                    }
                })
            }
        }   
    })
})









module.exports = router;