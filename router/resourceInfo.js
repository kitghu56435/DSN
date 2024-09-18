const express = require('express');
const router = express.Router();
const monitor = require('../model/monitor');
const {readFileSync} = require('fs');
const db = require('../db');





router.get('/',(req,res)=>{
    let R_ID = req.query.ID;
    let T_Path = '';
    
    

    db.execute(`SELECT DATE_FORMAT(R_Update,'%Y年%m月%d日') R_Update,T_Path FROM Resources,Template WHERE Resources.R_ID = ? AND Resources.T_ID = Template.T_ID AND R_Delete = 0 AND R_Shelf = 1;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.end();
        }else{
            if(results.length == 0){  //資源已下架或刪除
                let html = readFileSync('./public/html/front_end/notfound.html','utf-8');
                res.end(html);
            }else{
                T_Path = results[0].T_Path;
                let html = readFileSync('./public/html/template/' + T_Path,'utf-8');
                html += `
                <script>
                    getHeader_data('${R_ID}');
                    getTemplate_data('${R_ID}');
                </script>`;
                res.end(html);              
            }
        }   
    })
})



router.post('/data',(req,res)=>{
    let R_ID = req.body.R_ID;
    monitor.Flow(R_ID,req.cookies.utoken);
    let L_ID = req.cookies.leng;
    let utoken = req.cookies.utoken;
    let R_Img_Sync = '';
    let data = {
        "RD_Data" : undefined,
        "R_ID" : R_ID,
        "R_Like_Num" : 0,
        "R_Like" : false,
        "R_Update" : undefined,
        "L_ID" : L_ID,
        "msg" : ""
    }
    

    db.execute(`SELECT DATE_FORMAT(R_Update,'%Y-%m-%d') R_Update,R_Img_Sync,T_Path FROM Resources,Template WHERE Resources.R_ID = ? AND Resources.T_ID = Template.T_ID AND R_Delete = 0 AND R_Shelf = 1;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            res.end();
        }else{
            if(results.length == 0){  //資源已下架或刪除
                let html = readFileSync('./public/html/front_end/notfound.html','utf-8');
                res.end(html);
            }else{
                R_Img_Sync = results[0].R_Img_Sync;
                T_Path = results[0].T_Path;
                data.R_Update = results[0].R_Update;
                
                

                db.execute('SELECT COUNT(*) Num FROM Resources_like WHERE R_ID = ?',[R_ID],(err,results)=>{
                    if(err){
                        console.log(err);
                    }else{
                        data.R_Like_Num = results[0].Num;
                    }
                })
                db.execute('SELECT COUNT(*) Num FROM Resources_like WHERE R_ID = ? AND RL_Cookie = ?',[R_ID,utoken],(err,results)=>{
                    if(err){
                        console.log(err);
                    }else{
                        if(results[0].Num != 0){
                            data.R_Like = true; 
                        }
                    }
                })

                
                db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE R_ID = ? AND L_ID = ? AND RD_Type = 1`,[R_ID,L_ID],(err,results)=>{
                    if(err){
                        console.log(err);
                        res.end('資料庫錯誤');
                    }else{
                        if(R_Img_Sync){ //圖片集同步
                            
                            data.RD_Data = results;

                            db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE R_ID = ? AND L_ID = 'L000000001' AND RD_Type = 1 AND RD_Content LIKE '%.png'`,[R_ID],(err,results)=>{
                                if(err){
                                    console.log(err);
                                    res.end('資料庫錯誤');
                                }else{
                                    
                                    for(i = 0;i < results.length;i++){
                                        let found = false;
                                        for(j = 0;j < data.RD_Data.length; j++){
                                            
                                            if(data.RD_Data[j].RD_Template_ID == results[i].RD_Template_ID){
                                                found = true;
                                                data.RD_Data[j].RD_Content = results[i].RD_Content;
                                                break;
                                            }

                                            

                                        }

                                        if(!found){
                                            data.RD_Data.push(results[i]);
                                        }
                                        
                                    }
                                }

                                res.json(data);
                            })

                        }else{ //圖片集異步
                            data.RD_Data = results;
                            res.json(data);
                        }
                        
                    }
                })
            }
        }   
    })
})









module.exports = router;