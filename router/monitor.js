const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const monitor = require('../model/monitor');
const db = require('../db');
const {Administrator_verafication,setMsgbox,SOM,EOM} = require('../function');
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
        "Visits" : [],
        "UV" : [],
        "Resource_ranking":[]
    }
    let msgbox = '';


    //在線訪客
    db.execute(`SELECT COUNT(FL_Cookie) FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[monitor.Minutes_ago(30),Now],(err,result)=>{
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

    monitor.getCustomer_data('PV','1d').then((result)=>{
        data.PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })


    monitor.getResource_Rank('5','1d').then((result)=>{
        data.Resource_ranking = result;
        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${online_customer});
        setData_block(1,${today_customer});
        setData_block(2,${month_customer});
        setData_monitor(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    }).catch(()=>{
        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${online_customer});
        setData_block(1,${today_customer});
        setData_block(2,${month_customer});
        setData_monitor(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    })
})


router.post('/data',(req,res)=>{
    let PV = req.body.PV;
    let Visits = req.body.Visits;
    let UV = req.body.UV;
    let range = req.body.time_range;
    let count = 0;
    let data = {
        "PV":[],
        "Visits" : [],
        "UV" : [],
        "msgbox" : ""
    }
    
    

    if(PV == 'true'){
        count += 1;
        monitor.getCustomer_data('PV',range).then((result)=>{
            data.PV = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
    if(Visits == 'true'){
        count += 1;
        monitor.getCustomer_data('Visits',range).then((result)=>{
            data.Visits = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
    if(UV == 'true'){
        count += 1;
        monitor.getCustomer_data('UV',range).then((result)=>{
            data.UV = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }

})


router.get('/costomer',(req,res)=>{
    let html = readFileSync('./public/html/back_end/monitor/monitor_costomer.html','utf-8');
    let today_end = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let today_start = monitor.Hours_ago(23);
    data = {
        "PV":[],
        "Visits" : [],
        "UV" : [],
        "PV_Count":-1,
        "PV_Count_percentage":-1,
        "PV_Average":-1,
        "PV_Average_percentage":-1,
        "Visits_Count":-1,
        "Visits_Count_percentage":-1,
        "Visits_Average":-1,
        "Visits_Average_percentage":-1,
        "UV_Count":-1,
        "UV_Count_percentage":-1,
        "UV_Average":-1,
        "UV_Average_percentage":-1,
        "msgbox": ""
    }

    monitor.getCustomer_data('PV','1d').then((result)=>{
        data.PV = result;
    }).catch(()=>{
        data.msgbox += '資料查詢錯誤';
    })

    monitor.getCustomer_count('PV','1d',today_start,today_end).then((num)=>{
        data.PV_Count = num.count;
        data.PV_Average = num.average;
    }).catch(()=>{
        data.msgbox += '資料查詢錯誤';
    })

    monitor.getCustomer_last_data_percentage('PV','1d',today_start,today_end).then((num)=>{
        data.PV_Count_percentage = num.count;
        data.PV_Average_percentage = num.average;
        html += `<script>
            setData_monitor_costomer(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    }).catch(()=>{
        data.msgbox += '資料查詢錯誤';
        html += `<script>
            setData_monitor_costomer(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
        
    })    
})

router.post('/costomer/data',(req,res)=>{
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let PV = req.body.PV;
    let Visits = req.body.Visits;
    let UV = req.body.UV;
    let range = req.body.time_range;
    let count = 0;
    let date_start = '';
    let date_end = Now;
    switch(range){
        case '1h' : date_start = monitor.Minutes_ago(60); break;
        case '1d' : date_start = monitor.Hours_ago(23); break;
        case '1w' : date_start = monitor.Day_ago(7); break;
        case '1m' : date_start = monitor.Day_ago(31); break;
        case '3m' : date_start = monitor.Day_ago(93); break;
        case '6m' : date_start = monitor.Day_ago(182); break;
        default : 
    }

    data = {
        "PV":[],
        "Visits" : [],
        "UV" : [],
        "PV_Count":-1,
        "PV_Count_percentage":-1,
        "PV_Average":-1,
        "PV_Average_percentage":-1,
        "Visits_Count":-1,
        "Visits_Count_percentage":-1,
        "Visits_Average":-1,
        "Visits_Average_percentage":-1,
        "UV_Count":-1,
        "UV_Count_percentage":-1,
        "UV_Average":-1,
        "UV_Average_percentage":-1,
        "msgbox": ""
    }

    if(PV == 'true'){
        count += 1;

        
        monitor.getCustomer_count('PV',range,date_start,date_end).then((num)=>{
            data.PV_Count = num.count;
            data.PV_Average = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })

        monitor.getCustomer_last_data_percentage('PV',range,date_start,date_end).then((num)=>{
            data.PV_Count_percentage = num.count;
            data.PV_Average_percentage = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })   

        monitor.getCustomer_data('PV',range).then((result)=>{
            data.PV = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
    if(Visits == 'true'){
        count += 1;

        monitor.getCustomer_count('Visits',range,date_start,date_end).then((num)=>{
            data.Visits_Count = num.count;
            data.Visits_Average = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })

        monitor.getCustomer_last_data_percentage('Visits',range,date_start,date_end).then((num)=>{
            data.Visits_Count_percentage = num.count;
            data.Visits_Average_percentage = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })


        monitor.getCustomer_data('Visits',range).then((result)=>{
            data.Visits = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
    if(UV == 'true'){
        count += 1;

        monitor.getCustomer_count('UV',range,date_start,date_end).then((num)=>{
            data.UV_Count = num.count;
            data.UV_Average = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })

        monitor.getCustomer_last_data_percentage('UV',range,date_start,date_end).then((num)=>{
            data.UV_Count_percentage = num.count;
            data.UV_Average_percentage = num.average;
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
        })


        monitor.getCustomer_data('UV',range).then((result)=>{
            data.UV = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
})



router.get('/resource',(req,res)=>{
    let html = readFileSync('./public/html/back_end/monitor/monitor_resource.html','utf-8');
    let msgbox = '';
    let selectR_data = [];
    let R_ID = [];


    db.execute(`SELECT Resource_data.R_ID,RD_Content FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID AND RD_Type = 2 AND L_ID = 'L000000001' AND R_Delete = 0;`,(err,result)=>{
        if(err){
            console.log(err);
            msgbox = '資料庫錯誤'
        }else{
            for(i = 0;i < result.length;i++){
                selectR_data.push({
                    "R_ID" : result[i].R_ID,
                    "R_Name" : result[i].RD_Content,
                    "Check" : false
                })
                R_ID.push(result[i].R_ID);
            }
            monitor.getResource_data('PV','1d',R_ID).then((result)=>{
                for(i = 0;i < result.length;i++){
                    if(i < 10){
                        for(j = 0;j < selectR_data.length;j++){
                            if(selectR_data[j].R_ID == result[i].R_ID){
                                selectR_data[j].Check = true;
                            }
                        }
                    }else{
                        break;
                    }
                }
                html += `<script>
                ${setMsgbox(msgbox)}
                setselectR_data(${JSON.stringify(selectR_data)});
                </script>
                `;
                res.end(html);
            })
        }
    })
})


router.post('/resource/data',(req,res)=>{
    let R_ID = req.body.R_ID;
    let range = req.body.range;
    let PV = req.body.PV;
    let Visits = req.body.Visits;
    let UV = req.body.UV;
    let count = 0;


    data = {
        "PV":[],
        "Visits" : [],
        "UV" : [],
        "Rank" : [],
        "msgbox": ""
    }
    monitor.getResource_Rank(10,range,R_ID).then((result)=>{
        data.Rank = result;
    }).catch(()=>{
        data.msgbox = '資料庫錯誤'
    })
    if(PV){
        count++;
        monitor.getResource_data('PV',range,R_ID).then((result)=>{
            data.PV = result;
            count -= 1;
            if(count == 0){
                res.json(data)
            }
        })
    }
    if(Visits){
        count++;
        monitor.getResource_data('Visits',range,R_ID).then((result)=>{
            data.Visits = result;
            count -= 1;
            if(count == 0){
                res.json(data)
            }
        })
    }
    if(UV){
        count++;
        monitor.getResource_data('UV',range,R_ID).then((result)=>{
            data.UV = result;
            count -= 1;
            if(count == 0){
                res.json(data)
            }
        })
    }
    
})


module.exports = router;
