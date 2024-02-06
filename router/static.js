const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,checkData,NextID} = require('../function');
const moment = require('moment-timezone');



//這個API是為了開發測試header語言切換而再的
router.get('/header',(req,res)=>{
    let html = readFileSync('./public/html/header.html');
    res.end(html);
})


router.post('/header_data',(req,res)=>{
    let L_ID = req.cookies.leng;
    if(L_ID == undefined) L_ID = 'L000000001';
    
    db.execute(`SELECT RD_Template_ID,RD_Content FROM Resource_data WHERE L_ID = ? AND R_ID = 'SP00000003';`,[L_ID],(err,results)=>{
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



router.get('/guideline',(req,res)=>{
    let html = readFileSync('./public/html/guideline.html','utf-8');
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
    let html = readFileSync('./public/html/about_us.html','utf-8');
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
    let html = readFileSync('./public/html/cookie_policy.html','utf-8');
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





module.exports = router;