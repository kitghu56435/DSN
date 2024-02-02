const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,checkData,NextID} = require('../function');
const moment = require('moment-timezone');




router.get('/',(req,res)=>{
    let ID = req.query.ID;    //可能是
})









module.exports = router;