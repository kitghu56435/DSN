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
    console.log(req.cookies);

    res.end();
    // db.execute(`SELECT T_Path FROM Resources,Template WHERE Resources.R_ID = ? AND Resources.T_ID = Template.T_ID AND R_Delete = 0 AND R_Shelf = 1;`,[R_ID],(err,results)=>{
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(results.length == 0){
    //             //顯示下架或刪除
    //             res.end('資源以下架或刪除');
    //         }else{
    //             T_Path = results[0].T_Path;
    //             let html = readFileSync('./public/html/template/' + T_Path,'utf-8');


    //             //這邊要先解決cookie的語言序號   
    //             db.execute(``,[],(err,results=>{

    //             }))
    //         }
    //     }   
    // })

    res.end();
})









module.exports = router;