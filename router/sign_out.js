const express = require('express');
const router = express.Router();



router.get('/',(req,res)=>{
    if(req.session == null || req.session.Session_ID == undefined){
        res.writeHead(303,{Location:'/'});   
        res.end();
    }else{
        req.session = null;   //登出
        res.writeHead(303,{Location:'/'});   
        res.end();
    }
})












module.exports = router;