const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const {create_Sessionid,delete_Sessionid} = require('../function');
const db = require('../db');
const cookie_time = 1000 * 60 * 60 * 4 //四小時


const check_sign_in = (req,res,next) => {
    
    if(req.session == null || req.session.Session_ID == undefined){
        next();
    }else{
        db.execute(`SELECT AD_Session_ID FROM Administrator WHERE AD_Session_ID = ?;`,[req.session.Session_ID],(err,result)=>{
            if(err){
                console.log(err);
                next();
            }else{
                if(result.length != 0){
                    if(result[0].AD_Session_ID == req.session.Session_ID){
                        res.writeHead(303,{Location:'/backend/resource/'});
                        res.end();
                    }else{
                        next();
                    }
                }else{
                    next();
                }
            }
        })
    }
}


router.use(check_sign_in);

router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/sign_in.html','utf-8');
    if(req.query.info != undefined){
        html += `
        <script>
            setMsg('${req.query.info}')
        </script>
        `;
    }
    res.end(html)
})

router.post('/data',(req,res)=>{  
    let Userid = req.body.Userid;
    let pw = req.body.Password;


    if(Userid == undefined || pw == undefined || typeof Userid != 'string' || typeof pw != 'string'){
        res.writeHead(303,{Location:'/sign_in?info=err'});
        res.end();
    }else{
        db.execute(`SELECT * FROM Administrator WHERE AD_ID = ? AND AD_Pw = ?;`,[Userid,pw],(err,results)=>{
            if(err){
                res.writeHead(303,{Location:'/sign_in?info=err'});
                res.end();
            }else if(results.length == 0){
                res.writeHead(303,{Location:'/sign_in?info=nodata'});
                res.end();
            }else if(results.length != 0){   
                new Promise((resolve)=>{
                    resolve(create_Sessionid());
                }).then((Sessionid)=>{
                    if(Sessionid == 'dberr'){   //session 錯誤
                        res.writeHead(303,{Location:'/sign_in?info=err'});
                        res.end();
                    }else{
                        db.execute(`UPDATE Administrator SET AD_Session_ID = ? WHERE AD_ID = ?;`,[Sessionid,Userid],(err)=>{
                            if(err){
                                console.log(err);
                                res.writeHead(303,{Location:'/sign_in?info=err'});
                                res.end();
                            }else{
                                req.session.Session_ID = Sessionid;
                                setTimeout(()=>{    //自動刪除資料庫session
                                    delete_Sessionid(Userid,Sessionid)
                                },cookie_time)



                                res.writeHead(303,{Location:'/backend/resource/'});
                                res.end();
                            }
                        })
                    }
                })
            }
        })
    }
})











module.exports = router;