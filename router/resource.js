const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const db = require('../db');
const {Administrator_verafication} = require('../function');


router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource.html','utf-8');
    
    res.end(html)
})












module.exports = router;