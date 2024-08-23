const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const search = require('../model/search');
const resource = require('../model/resource');
const db = require('../db');
const {Administrator_verafication,setMsgbox,SOM,EOM} = require('../function');
const moment = require('moment-timezone');


router.use(Administrator_verafication);



router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/search/search.html','utf-8');
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let today_start = moment().tz('Asia/Taipei').format('YYYY-MM-DD 00:00:00');
    let today_end = moment().tz('Asia/Taipei').format('YYYY-MM-DD 23:59:59');
    let Now_obj = new Date(Now);
    let msgbox = '';
    let today_search_num = 0;    //今日搜尋量
    let month_search_num = 0;    //本月搜尋量

    let data = {
        "PV":[],
        "UVisits" : [],         //重複搜尋量
        "UV" : [],
        "Record":[],
        "pie" : [],
    }


    
    //今日搜尋量
    db.execute(`SELECT COUNT(SR_ID) today_search_num FROM Search_record WHERE SR_Time BETWEEN ? AND ?`,[today_start,today_end],(err,result)=>{
        if(err){
            console.log(err);
            today_search_num = -1;
            msgbox += '資料查詢錯誤';
        }else{
            today_search_num = result[0].today_search_num;
        }
    })
    //本月搜尋量
    db.execute(`SELECT COUNT(SR_ID) month_search_num FROM Search_record WHERE SR_Time BETWEEN ? AND ?`,[SOM(Now_obj.getFullYear(),Now_obj.getMonth()+1),EOM(Now_obj.getFullYear(),Now_obj.getMonth()+1)],(err,result)=>{
        if(err){
            console.log(err);
            month_search_num = -1;
            msgbox += '資料查詢錯誤';
        }else{
            month_search_num = result[0].month_search_num;
        }

    })


    search.getSearch_data('PV','1d').then((result)=>{
        data.PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })

    search.getSearch_Proportion('PV','1d','Demand').then((result)=>{
        data.pie = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })

    //搜尋紀錄表
    db.execute(`SELECT DATE_FORMAT(SR_Time,'%Y年%m月%d日') SR_Time,SR_Demand,SR_Condition FROM Search_record ORDER BY SR_ID DESC LIMIT 5;`,(err,result)=>{
        if(err){
            console.log(err);
            today_search_num = -1;
            msgbox += '資料查詢錯誤';
        }else{
            for(i=0;i<result.length;i++){
                data.Record.push({
                    "SR_Time" : result[i].SR_Time,
                    "SR_Demand" : resource.setCode_to_Array(result[i].SR_Demand).map((value)=>search.getDemandText(value)),
                    "SR_Condition" : resource.setCode_to_Array(result[i].SR_Condition).map((value)=>search.getConditionText(value)),
                })
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${today_search_num});
        setData_block(1,${month_search_num});
        setSearch_data(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    })


    
    
    
})

router.post('/data',(req,res)=>{
    let PV = req.body.PV;
    let UVisits = req.body.UVisits;
    let UV = req.body.UV;
    let range = req.body.time_range;
    let count = 0;
    let data = {
        "PV":[],
        "UVisits" : [],         //重複搜尋量
        "UV" : [],
        "msgbox" : ""
    }
    
    

    if(PV == 'true'){
        count += 1;
        search.getSearch_data('PV',range).then((result)=>{
            data.PV = result;
            count--;
            if(count == 0)res.json(data);
        }).catch(()=>{
            data.msgbox += '資料查詢錯誤';
            count--;
            if(count == 0)res.json(data);
        })
    }
    if(UVisits == 'true'){
        count += 1;
        search.getSearch_data('UVisits',range).then((result)=>{
            data.UVisits = result;
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
        search.getSearch_data('UV',range).then((result)=>{
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



router.get('/record',(req,res)=>{
    let html = readFileSync('./public/html/back_end/search/search_record.html','utf-8');
    let today_start = moment().tz('Asia/Taipei').format('YYYY-MM-DD 00:00:00');
    let today_end = moment().tz('Asia/Taipei').format('YYYY-MM-DD 23:59:59');
    let today = moment().tz('Asia/Taipei').format('YYYY-MM-DD');
    let msgbox = '';
    let data = {
        "record" : [],
        "today_start" : today,
        "today_end" : today,
    }

    db.execute(`SELECT SR_Demand,SR_Identity,SR_Condition,SR_School,SR_City,SR_District,DATE_FORMAT(SR_Time,'%Y-%m-%d') SR_Date, 
        DATE_FORMAT(SR_Time,'%H:%i:%s') SR_Time_ FROM Search_record WHERE SR_Time BETWEEN ? AND ?`,
        [today_start,today_end],(err,result)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤';
        }else{
            for(i = 0;i < result.length;i++){
                data.record.push({
                    "SR_Date" : result[i].SR_Date,
                    "SR_Time" : result[i].SR_Time_,
                    "SR_Demand" : resource.setCode_to_Array(result[i].SR_Demand).map(value => search.getDemandText(value)),
                    "SR_Identity" : resource.setCode_to_Array(result[i].SR_Identity).map(value => search.getIdentityText(value)),
                    "SR_Condition" : resource.setCode_to_Array(result[i].SR_Condition).map(value => search.getConditionText(value)),
                    "SR_School" : search.getSchoolText(result[i].SR_School),
                    "SR_City" : search.getCityText(result[i].SR_City),
                    "SR_District" : result[i].SR_District,
                })
                
            }
        }

        
        html += `<script>
        ${setMsgbox(msgbox)}
        setSearch_record(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    })
    
    
})

router.post('/record/data',(req,res)=>{
    let date_start = req.body.date_start;
    let date_end = req.body.date_end;
    
    let data = {
        "record" : [],
        "today_start" : date_start,
        "today_end" : date_end,
        "msgbox" : ""
    }

    db.execute(`SELECT SR_Demand,SR_Identity,SR_Condition,SR_School,SR_City,SR_District,DATE_FORMAT(SR_Time,'%Y-%m-%d') SR_Date, 
        DATE_FORMAT(SR_Time,'%H:%i:%s') SR_Time_ FROM Search_record WHERE SR_Time BETWEEN ? AND ?`,
        [date_start + ' 00:00:00',date_end + ' 23:59:59'],(err,result)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤';
        }else{
            for(i = 0;i < result.length;i++){
                data.record.push({
                    "SR_Date" : result[i].SR_Date,
                    "SR_Time" : result[i].SR_Time_,
                    "SR_Demand" : resource.setCode_to_Array(result[i].SR_Demand).map(value => search.getDemandText(value)),
                    "SR_Identity" : resource.setCode_to_Array(result[i].SR_Identity).map(value => search.getIdentityText(value)),
                    "SR_Condition" : resource.setCode_to_Array(result[i].SR_Condition).map(value => search.getConditionText(value)),
                    "SR_School" : search.getSchoolText(result[i].SR_School),
                    "SR_City" : search.getCityText(result[i].SR_City),
                    "SR_District" : result[i].SR_District,
                })
                
            }
        }

        res.json(data)
    })
    
    
})



router.get('/proportion',(req,res)=>{
    let html = readFileSync('./public/html/back_end/search/search_proportion.html','utf-8');
    let msgbox = '';
    let data = {
        "Demand_PV": [],
        "Demand_UV": [],
        "Demand_UVisits": [],

        "Identity_PV": [],
        "Identity_UV": [],
        "Identity_UVisits": [],

        "Condition_PV": [],
        "Condition_UV": [],
        "Condition_UVisits": [],

        "School_PV": [],
        "School_UV": [],
        "School_UVisits": [],

        "City_PV": [],
        "City_UV": [],
        "City_UVisits": [],
    }

    search.getSearch_Proportion('PV','1d','Demand').then((result)=>{
        data.Demand_PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })
    search.getSearch_Proportion('PV','1d','Identity').then((result)=>{
        data.Identity_PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })
    search.getSearch_Proportion('PV','1d','Condition').then((result)=>{
        data.Condition_PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })
    search.getSearch_Proportion('PV','1d','School').then((result)=>{
        data.School_PV = result;
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
    })
    search.getSearch_Proportion('PV','1d','City').then((result)=>{
        data.City_PV = result;
        html += `<script>
        ${setMsgbox(msgbox)};
        setSearch_proportion(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    }).catch(()=>{
        msgbox += '資料查詢錯誤';
        html += `<script>
        ${setMsgbox(msgbox)};
        setSearch_proportion(${JSON.stringify(data)});
        </script>
        `;
        res.end(html)
    })


    
})


router.post('/proportion/data',(req,res)=>{
    let PV = req.body.PV;
    let UVisits = req.body.UVisits;
    let UV = req.body.UV;
    let range = req.body.time_range;
    
    let count = 0;
    let data = {
        "Demand_PV": [],
        "Demand_UV": [],
        "Demand_UVisits": [],

        "Identity_PV": [],
        "Identity_UV": [],
        "Identity_UVisits": [],

        "Condition_PV": [],
        "Condition_UV": [],
        "Condition_UVisits": [],

        "School_PV": [],
        "School_UV": [],
        "School_UVisits": [],

        "City_PV": [],
        "City_UV": [],
        "City_UVisits": [],
        "msgbox" : "",
    }

    if(PV == 'true'){
        count++;
        search.getSearch_Proportion('PV',range,'Demand').then((result)=>{
            data.Demand_PV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('PV',range,'Identity').then((result)=>{
            data.Identity_PV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('PV',range,'Condition').then((result)=>{
            data.Condition_PV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('PV',range,'School').then((result)=>{
            data.School_PV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('PV',range,'City').then((result)=>{
            data.City_PV = result;
            count--;
            if(count == 0){
                res.json(data);
            }
            
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
            count--;
            if(count == 0){
                res.json(data);
            }
        })
    }
    if(UVisits == 'true'){
        count++;
        search.getSearch_Proportion('UVisits',range,'Demand').then((result)=>{
            data.Demand_UVisits = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UVisits',range,'Identity').then((result)=>{
            data.Identity_UVisits = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UVisits',range,'Condition').then((result)=>{
            data.Condition_UVisits = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UVisits',range,'School').then((result)=>{
            data.School_UVisits = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UVisits',range,'City').then((result)=>{
            data.City_UVisits = result;
            count--;
            if(count == 0){
                res.json(data);
            }
            
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
            count--;
            if(count == 0){
                res.json(data);
            }
        })
    }
    if(UV == 'true'){
        count++;
        search.getSearch_Proportion('UV',range,'Demand').then((result)=>{
            data.Demand_UV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UV',range,'Identity').then((result)=>{
            data.Identity_UV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UV',range,'Condition').then((result)=>{
            data.Condition_UV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UV',range,'School').then((result)=>{
            data.School_UV = result;
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
        })
        search.getSearch_Proportion('UV',range,'City').then((result)=>{
            data.City_UV = result;
            count--;
            if(count == 0){
                res.json(data);
            }
            
        }).catch(()=>{
            msgbox += '資料查詢錯誤';
            count--;
            if(count == 0){
                res.json(data);
            }
        })
    }
})


module.exports = router;