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
                    }
                }else{
                    D_data.resource = resource;
                    data.data.push(D_data);
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




router.get('/economy',(req,res)=>{
    let html = readFileSync('./public/html/finance.html','utf-8');
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
    let html = readFileSync('./public/html/emergency.html','utf-8');
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
    let html = readFileSync('./public/html/law.html','utf-8');
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
    let html = readFileSync('./public/html/application.html','utf-8');
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






module.exports = router;