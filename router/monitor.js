const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const monitor = require('../model/message');
const db = require('../db');
const {Administrator_verafication,add0,setMsgbox,SOM,EOM} = require('../function');
const moment = require('moment-timezone');


router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/monitor/monitor.html','utf-8');
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let today_start = moment().tz('Asia/Taipei').format('YYYY-MM-DD 00:00:00');
    let today_end = moment().tz('Asia/Taipei').format('YYYY-MM-DD 23:59:59');
    let Now_obj = new Date(Now);
    let online_customer = 0;   //在線訪客
    let today_customer = 0;    //今日訪客
    let month_customer = 0;    //本月訪客
    let data = {
        "PV":[],
        "":""
    }
    let msgbox = '';



    //在線訪客
    db.execute(`SELECT COUNT(FL_Cookie) FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[Minutes_ago(30),Now],(err,result)=>{
        if(err){
            console.log(err);
            online_customer = -1;
            msgbox += '資料查詢錯誤';
        }else{
            online_customer = result.length;
        }
    })
    //本日訪客
    db.execute(`SELECT COUNT(FL_Cookie) FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[today_start,today_end],(err,result)=>{
        if(err){
            console.log(err);
            today_customer = -1;
            msgbox += '資料查詢錯誤';
        }else{
            today_customer = result.length;
        }
    })
    //本月訪客
    db.execute(`SELECT COUNT(FL_Cookie) FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[SOM(Now_obj.getFullYear(),Now_obj.getMonth()+1),EOM(Now_obj.getFullYear(),Now_obj.getMonth()+1)],(err,result)=>{
        if(err){
            console.log(err);
            month_customer = -1;
            msgbox += '資料查詢錯誤';
        }else{
            month_customer = result.length;
        }
    })
    //累計顧客數量(1天)
    db.execute(`SELECT DATE_FORMAT(FL_Time,'%H') Time_class,COUNT(DATE_FORMAT(FL_Time,'%H')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY Time_class;`,[today_start,today_end],(err,result)=>{
        if(err){
            console.log(err);
            msgbox += '資料查詢錯誤';
        }else{
            for(i = 0;i <= 23;i++){
                let count = 0;
                let label = i;
                for(j = 0;j < result.length;j++){
                    if(i == parseInt(result[j].Time_class)){
                        count = parseInt(result[j].Count)
                    };
                }
                if(i < 12){
                    label = i + 'am'
                }else{
                    label = i + 'pm'
                }
                data.PV.push({
                    "label" : label,
                    "count" : count,
                })
            }

            html += `<script>
            ${setMsgbox(msgbox)}
            setData_block(0,${online_customer});
            setData_block(1,${today_customer});
            setData_block(2,${month_customer});
            setData_monitor(${JSON.stringify(data)});
            </script>
            `;
            res.end(html)
        }
    })


    //寫到要抓資源流量排行


})

router.post('/data',(req,res)=>{
    console.log(req.body);
    res.json({});
})


function Minutes_ago(min){  //產出幾分鐘以前
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let time1 = new Date(Now).getTime();
    let time2 = time1 - (min * 1000 * 60);
    
    let dateobj = new Date(time2);

    return dateobj.getFullYear() + '-' + add0((dateobj.getMonth() + 1)) + '-' + add0(dateobj.getDate()) + ' ' + add0(dateobj.getHours()) + ':' + add0(dateobj.getMinutes()) + ":" + add0(dateobj.getSeconds());
}



module.exports = router;