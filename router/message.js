const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,EOM,SOM,Proportion} = require('../function');
const moment = require('moment-timezone');



router.use(Administrator_verafication);



router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/message.html','utf-8');
    let DateString = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let DateString2 = moment().tz('Asia/Taipei').format('YYYY-MM-DD');
    let today = new Date(DateString);
    let msgbox = '';
    let RF_Num = 0; //資源留言數量
    let RF_Mon_Num = 0; //本月資源新增數量
    let Page_Num = 0; //頁面留言數量
    let Page_Mon_Num = 0; //本月頁面新增數量
    let data = {
        "R_Message":[],
        "Page_Message":[]
    }

    db.execute(`SELECT Resources.R_ID,RD_Content R_Name FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND RD_Type = 2  AND L_ID = 'L000000001'AND R_Delete = 0;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.R_Message.push({
                    "R_ID" : results[i].R_ID,
                    "R_Name" : results[i].R_Name,
                    "RF_Num" : 0,
                    "RF_Day_Num" : 0,
                    "RF_Mon_Num" : 0,
                    "RF_Proportion" : 0
                });
            }
        }
    })
    //總資源留言量
    db.execute(`SELECT R_ID,COUNT(R_ID) RF_Num FROM Resource_feedback WHERE R_ID IS NOT null;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.R_Message.length;j++){
                    if(results[i].R_ID == data.R_Message[j].R_ID){
                        data.R_Message[j].RF_Num = results[i].RF_Num;
                        RF_Num += Number(results[i].RF_Num);
                    }
                    if(results[i].R_ID == data.R_Message[j].R_ID){
                        data.R_Message[j].RF_Proportion = Proportion(RF_Num,data.R_Message[j].RF_Num);
                    }
                }
            }
        }
    })
    //今日資源留言量
    db.execute(`SELECT R_ID,COUNT(R_ID) RF_Num FROM Resource_feedback WHERE R_ID IS NOT null AND RF_Date BETWEEN '${DateString2} 00:00:00' AND '${DateString2} 23:59:59';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.R_Message.length;j++){
                    if(results[i].R_ID == data.R_Message[j].R_ID){
                        data.R_Message[j].RF_Day_Num = results[i].RF_Num;
                    }
                }
            }
        }
    })
    //本月資源留言量
    db.execute(`SELECT R_ID,COUNT(R_ID) RF_Num FROM Resource_feedback WHERE R_ID IS NOT null AND RF_Date BETWEEN '${SOM(today.getFullYear(),today.getMonth()+1)}' AND '${EOM(today.getFullYear(),today.getMonth()+1)}';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.R_Message.length;j++){
                    if(results[i].R_ID == data.R_Message[j].R_ID){
                        data.R_Message[j].RF_Mon_Num = results[i].RF_Num;
                        RF_Mon_Num += Number(results[i].RF_Num);
                    }
                }
            }
        }           
    })    
    //頁面留言
    db.execute(`SELECT DATE_FORMAT(RF_Date,'%Y年%m月%d日') RF_Date,RF_Content FROM resource_feedback WHERE R_ID IS NULL;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            Page_Num = results.length;
            for(i = 0;i<results.length;i++){
                data.Page_Message.push({
                    "RF_Date" : results[i].RF_Date,
                    "RF_Content" : results[i].RF_Content
                });
            }
        }

                 
    }) 
    //本月頁面留言量
    db.execute(`SELECT R_ID FROM Resource_feedback WHERE R_ID IS null AND RF_Date BETWEEN '${SOM(today.getFullYear(),today.getMonth()+1)}' AND '${EOM(today.getFullYear(),today.getMonth()+1)}';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            Page_Mon_Num = results.length;
        }       
        
        
        html += `<script>
        setData_block(0,${RF_Num});
        setData_block(1,${RF_Mon_Num});
        setData_block(2,${Page_Num});
        setData_block(3,${Page_Mon_Num});
        setMessage(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)           
    }) 
})




router.get('/record/resource',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/message_record_r.html','utf-8');
    let msgbox = '';
    let data = {
        "feedback":[]
    }

    db.execute(`SELECT D_Name,RD_Content,RF_ID,RF_Content,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date FROM Resource_feedback,Resource_data,Demand,Resources WHERE Resource_feedback.R_ID IS NOT NULL 
    AND Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Resources.R_ID = Resource_feedback.R_ID AND Resource_data.L_ID = 'L000000001' 
    AND Resource_data.RD_Type = 2 AND Demand.L_ID = 'L000000001';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.feedback.push({
                    "D_Name" : results[i].D_Name,
                    "R_Name" : results[i].RD_Content,
                    "RF_ID" : results[i].RF_ID,
                    "RF_Content" : results[i].RF_Content,
                    "RF_Date" : results[i].RF_Date
                });
            }
        }

        html += `<script>
        setMessage_record_r(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)         
    })
})


router.get('/record/page',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/message_record_p.html','utf-8');
    let msgbox = '';
    let data = {
        "feedback":[]
    }

    db.execute(`SELECT RF_ID,RF_Content,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date FROM Resource_feedback WHERE R_ID IS NULL;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.feedback.push({
                    "RF_ID" : results[i].RF_ID,
                    "RF_Content" : results[i].RF_Content,
                    "RF_Date" : results[i].RF_Date
                });
            }
        }

        html += `<script>
        setMessage_record_p(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)         
    })
})




router.post('/record/delete',(req,res)=>{
    let RF_ID = req.body.RF_ID;
    let page = req.body.page;
    let R_ID = req.body.R_ID;

    let data = {
        "msgbox" : "",
        "page" : page,
        "feedback":[],
        "resource" :{
            "R_ID" : R_ID,
        }
    }
    
    new Promise((resolve,reject)=>{
        resolve(delete_Resource_feedback(RF_ID));
    }).then(()=>{
        if(page == 'page'){
            db.execute(`SELECT RF_ID,RF_Content,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date FROM Resource_feedback WHERE R_ID IS NULL;`,(err,results)=>{
                if(err){
                    console.log(err);
                    msgbox += '資料庫錯誤<br>';
                }else{
                    for(i = 0;i<results.length;i++){
                        data.feedback.push({
                            "RF_ID" : results[i].RF_ID,
                            "RF_Content" : results[i].RF_Content,
                            "RF_Date" : results[i].RF_Date
                        });
                    }
                }
        
                res.json(data);     
            })
        }else if(page == 'resource'){
            db.execute(`SELECT D_Name,RD_Content,RF_ID,RF_Content,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date FROM Resource_feedback,Resource_data,Demand,Resources WHERE Resource_feedback.R_ID IS NOT NULL 
            AND Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Resources.R_ID = Resource_feedback.R_ID AND Resource_data.L_ID = 'L000000001' 
            AND Resource_data.RD_Type = 2 AND Demand.L_ID = 'L000000001';`,(err,results)=>{
                if(err){
                    console.log(err);
                    msgbox += '資料庫錯誤<br>';
                }else{
                    for(i = 0;i<results.length;i++){
                        data.feedback.push({
                            "D_Name" : results[i].D_Name,
                            "R_Name" : results[i].RD_Content,
                            "RF_ID" : results[i].RF_ID,
                            "RF_Content" : results[i].RF_Content,
                            "RF_Date" : results[i].RF_Date
                        });
                    }
                }
        
                res.json(data);   
            })
        }else if(page == 'resource_feedback'){
            
            db.execute(`SELECT *,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date_f FROM Resource_feedback WHERE R_ID = ?;`,[R_ID],(err,results)=>{
                if(err){
                    console.log(err);
                    msgbox += '資料庫錯誤<br>';
                }else{
                    for(i = 0;i<results.length;i++){
                        data.feedback.push({
                            "RF_ID" : results[i].RF_ID,
                            "RF_Content" : results[i].RF_Content,
                            "RF_Date" : results[i].RF_Date_f
                        })                
                    }
                }
                
                res.json(data);
            })
        }
    }).catch((result)=>{
        data.msgbox = result;
        res.json(data);
    })
})





async function delete_Resource_feedback(RF_ID){
    return new Promise((resolve,reject)=>{
        db.execute(`DELETE FROM Resource_feedback WHERE RF_ID = ?`,[RF_ID],(err,results)=>{
            if(err){
                console.log(err);
                reject('dberr');
            }else if(results.affectedRows == 0){
                reject('nodata');
            }else{
                resolve();
            }
            
        })
    })
}


module.exports = router;