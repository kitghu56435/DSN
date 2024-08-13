const db = require('../db');
const moment = require('moment-timezone');
const {NextID,checkData,RDNextID, add0} = require('../function');
let gap = 30; //min 造訪間隔時間


//紀錄flow資料
async function Flow(FL_Page,FL_Cookie){
    let FL_Time = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let FL_ID = await RDNextID('Flow','FL_ID','FL');  //使用給RD專用的序號function，為了產生更多字元的代號

    
    return new Promise((resolve,reject)=>{
        if(checkData(FL_Page) && checkData(FL_Cookie)){
            db.execute(`INSERT INTO Flow VALUES(?,?,?,?);`,[FL_ID,FL_Page,FL_Time,FL_Cookie],(err,results)=>{
                if(err){
                    console.log(err);
                    reject('dberr');
                }else if(results.affectedRows == 0){
                    reject('nodata');
                }else{
                    resolve();
                }
            }) 
        }
    })
}


//取得顧客流量數據
async function getCustomer_data(type,range){
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let data = [];
    let date_start = '';
    let date_end = Now;
    switch(range){
        case '1h' : date_start = Minutes_ago(60); break;
        case '1d' : date_start = Hours_ago(23); break;
        case '1w' : date_start = Day_ago(7); break;
        case '1m' : date_start = Day_ago(31); break;
        case '3m' : date_start = Day_ago(93); break;
        case '6m' : date_start = Day_ago(182); break;
        default : data_count = 23; break;
    }
    
    return new Promise((resolve,reject)=>{
        //累計顧客數量
        if(type == 'PV'){
            if(range == '1h'){ //1小時 
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%H:%i') Time_class,COUNT(FL_Time) Count FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('min',60);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1d'){ //1天
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%H:00') Time_class,COUNT(DATE_FORMAT(FL_Time,'%H')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('h',24);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1w'){  //1周
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(DATE_FORMAT(FL_Time,'%d')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',7);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1m'){  //1月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(DATE_FORMAT(FL_Time,'%d')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',31);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '3m'){  //3月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(DATE_FORMAT(FL_Time,'%d')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',93);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '6m'){  //6月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(DATE_FORMAT(FL_Time,'%d')) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',182);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count = parseInt(result[j].Count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }
        }else if(type == 'Visits'){
            db.execute(`SELECT DATE_FORMAT(FL_Time,'%Y-%m-%d %H:%i:%s') FL_Time,FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? ORDER BY FL_Time;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){

                        user_list.push({
                            "cookie" : result[0].FL_Cookie,
                            "count" : 1,
                            "time" : result[0].FL_Time
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].FL_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].FL_Time);
                                    

                                    if(data_time > user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].FL_Cookie,
                                            "count" : 1,
                                            "time" : result[i].FL_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].FL_Cookie,
                                    "count" : 1,
                                    "time" : result[i].FL_Time
                                });
                            }
                            found = false;
                            
                        }
                    }

                    
                    
                    if(range == '1h'){  //1小時 
                        let label = create_label('min',60);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getHours()) + ':' + add0(user_list_time.getMinutes());
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }else if(range == '1d'){ //1天
                        let label = create_label('h',24);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getHours()) + ':00';
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }else if(range == '1w'){ //1周 
                        let label = create_label('d',7);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getMonth()+1) + '/' + add0(user_list_time.getDate());
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }else if(range == '1m'){ //1月 
                        let label = create_label('d',31);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getMonth()+1) + '/' + add0(user_list_time.getDate());
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }else if(range == '3m'){ //3月 
                        let label = create_label('d',93);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getMonth()+1) + '/' + add0(user_list_time.getDate());
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }else if(range == '6m'){ //6月 
                        let label = create_label('d',182);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                            for(j = 0;j < user_list.length;j++){
                                let user_list_time = new Date(user_list[j].time);
                                let Time_class = add0(user_list_time.getMonth()+1) + '/' + add0(user_list_time.getDate());
                                if(label[i] == Time_class){
                                    count += parseInt(user_list[j].count)
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                    }

                    resolve(data);
                }
            })
        }else if(type == 'UV'){
            if(range == '1h'){ //1小時 
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%H:%i') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('min',60);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1d'){ //1天
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%H:00') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('h',24);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1w'){  //1周
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',7);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '1m'){  //1月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',31);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '3m'){  //3月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',93);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }else if(range == '6m'){  //6月
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%m/%d') Time_class,COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ?  GROUP BY Time_class,FL_Cookie;`,[date_start,date_end],(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let label = create_label('d',182);
                        for(i = 0; i < label.length; i++){
                            let count = 0;
                        
                            for(j = 0;j < result.length;j++){
                                if(label[i] == result[j].Time_class){
                                    count += 1;
                                };
                            }
                            
                            data.push({
                                "label" : label[i],
                                "count" : count,
                            })
                        }
                        
                        resolve(data);
                    }
                })
            }
        }
        
    })
}

//取得時間範圍的資料累計數量&資料平均數
async function getCustomer_count(type,range,date_start,date_end){
    let data_count = 0;
    switch(range){
        case '1h' : data_count = 60; break;
        case '1d' : data_count = 23; break;
        case '1w' : data_count = 7; break;
        case '1m' : data_count = 31; break;
        case '3m' : data_count = 93; break;
        case '6m' : data_count = 182; break;
        default : data_count = 23; break;
    }
    
    let data = {
        "count" : 0,
        "average" : 0
    }
    
    return new Promise((resolve,reject)=>{

        if(type == 'PV'){
            db.execute(`SELECT COUNT(FL_Time) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{

                    if(result[0].Count == 0){
                        resolve(data)
                    }else{
                        data.count = result[0].Count;
                        data.average = Math.round(result[0].Count/data_count * 100)/100;
                        resolve(data)
                    }
                }
            })
        }else if(type == 'Visits'){
            db.execute(`SELECT DATE_FORMAT(FL_Time,'%Y-%m-%d %H:%i:%s') FL_Time,FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? ORDER BY FL_Time;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){

                        user_list.push({
                            "cookie" : result[0].FL_Cookie,
                            "count" : 1,
                            "time" : result[0].FL_Time
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].FL_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].FL_Time);
                                    

                                    if(data_time > user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].FL_Cookie,
                                            "count" : 1,
                                            "time" : result[i].FL_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].FL_Cookie,
                                    "count" : 1,
                                    "time" : result[i].FL_Time
                                });
                            }
                            found = false;
                            
                        }
                    }
                    
                    for(j = 0;j < user_list.length;j++){
                        data.count += parseInt(user_list[j].count)
                    }
                    data.average = Math.round(data.count/data_count * 100)/100;
                    
                    resolve(data)
                }
            })
        }else if(type == 'UV'){
            db.execute(`SELECT COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    data.count = result.length;
                    data.average = Math.round(result.length/data_count * 100)/100;
                    resolve(data)
                }
            })
        }
    })
}

//取得上期累計趨勢百分比
async function getCustomer_last_data_percentage(type,range,date_start,date_end){
    let start_obj = new Date(date_start).getTime();
    let end_obj = new Date(date_end).getTime();
    let last_start_date_obj = new Date(start_obj - (end_obj - start_obj))
    let last_start_date = Date_format(last_start_date_obj);

    let data_count = 0;
    switch(range){
        case '1h' : data_count = 60; break;
        case '1d' : data_count = 23; break;
        case '1w' : data_count = 7; break;
        case '1m' : data_count = 31; break;
        case '3m' : data_count = 93; break;
        case '6m' : data_count = 182; break;
        default : data_count = 23; break;
    }

    let data = {
        "count" : 0,
        "average" : 0
    }

    return new Promise((resolve,reject)=>{
        let now_num = 0;
        let last_num = 0;
        let now_average = 0;
        let last_average = 0;
        
        if(type == 'PV'){
            //本期
            db.execute(`SELECT COUNT(FL_Time) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{

                    if(result[0].Count == 0){
                        now_num = 0;
                    }else{
                        now_num = result[0].Count;
                        now_average = Math.round(result[0].Count/data_count * 100)/100;
                        
                    }
                }
            })
            //上期
            db.execute(`SELECT COUNT(FL_Time) Count FROM Flow WHERE FL_Time BETWEEN ? AND ?;`,[last_start_date,date_start],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    if(result[0].Count == 0){
                        data.count = 100.0;
                        data.average = 100.0;

                        resolve(data);
                    }else{
                        last_num = result[0].Count;
                        last_average = Math.round(result[0].Count/data_count * 100)/100;
                        
                        
                        data.count = Math.round(Math.round((now_num - last_num)/last_num * 100)/100*100);
                        data.average = Math.round(Math.round((now_average - last_average)/last_average * 100)/100*100);
                        resolve(data);
                    }
                }
            })
        }else if(type == 'Visits'){
            //本期
            db.execute(`SELECT DATE_FORMAT(FL_Time,'%Y-%m-%d %H:%i:%s') FL_Time,FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? ORDER BY FL_Time;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){

                        user_list.push({
                            "cookie" : result[0].FL_Cookie,
                            "count" : 1,
                            "time" : result[0].FL_Time
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].FL_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].FL_Time);
                                    

                                    if(data_time > user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].FL_Cookie,
                                            "count" : 1,
                                            "time" : result[i].FL_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].FL_Cookie,
                                    "count" : 1,
                                    "time" : result[i].FL_Time
                                });
                            }
                            found = false;
                            
                        }
                    }

                    for(j = 0;j < user_list.length;j++){
                        now_num += parseInt(user_list[j].count)
                    }
                    now_average = Math.round(now_num/data_count * 100)/100;
                }
            })
            //上期
            db.execute(`SELECT DATE_FORMAT(FL_Time,'%Y-%m-%d %H:%i:%s') FL_Time,FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? ORDER BY FL_Time;`,[last_start_date,date_start],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){

                        user_list.push({
                            "cookie" : result[0].FL_Cookie,
                            "count" : 1,
                            "time" : result[0].FL_Time
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].FL_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].FL_Time);
                                    

                                    if(data_time > user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].FL_Cookie,
                                            "count" : 1,
                                            "time" : result[i].FL_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].FL_Cookie,
                                    "count" : 1,
                                    "time" : result[i].FL_Time
                                });
                            }
                            found = false;
                            
                        }
                    }

                    for(j = 0;j < user_list.length;j++){
                        last_num += parseInt(user_list[j].count)
                    }
                    last_average = Math.round(last_num/data_count * 100)/100;

                    if(last_num == 0){
                        data.count = 100.0;
                        data.average = 100.0;
                        resolve(data);
                    }else{
                        data.count = Math.round(Math.round((now_num - last_num)/last_num * 100)/100*100);
                        data.average = Math.round(Math.round((now_average - last_average)/last_average * 100)/100*100);
                        resolve(data);
                    }
                }
            })
        }else if(type == 'UV'){
            //本期
            db.execute(`SELECT COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    now_num = result.length;
                    now_average = Math.round(result.length/data_count * 100)/100;
                }
            })
            //上期
            db.execute(`SELECT COUNT(FL_Time),FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? GROUP BY FL_Cookie;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    last_num = result.length;
                    last_average = Math.round(result.length/data_count * 100)/100;

                    if(last_num == 0){
                        data.count = 100.0;
                        data.average = 100.0;
                        resolve(data);
                    }else{
                        data.count = Math.round(Math.round((now_num - last_num)/last_num * 100)/100*100);
                        data.average = Math.round(Math.round((now_average - last_average)/last_average * 100)/100*100);
                        resolve(data);
                    }
                }
            })
        }
    })
}


//取得資源流量數據
async function getResource_data(type,range,resource){
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let data = [];
    let date_start = '';
    let date_end = Now;
    
    
    switch(range){
        case '1h' : date_start = Minutes_ago(60); break;
        case '1d' : date_start = Hours_ago(23); break;
        case '1w' : date_start = Day_ago(7); break;
        case '1m' : date_start = Day_ago(31); break;
        case '3m' : date_start = Day_ago(93); break;
        case '6m' : date_start = Day_ago(182); break;
        default : date_start = Hours_ago(23); break;
    }

    let resource_sql = '';
    let parameter = [date_start,date_end]
    if(resource.length != 0){
        resource_sql += ' AND ( FL_Page = ?';
        parameter.push(resource[0])
        data.push({
            "R_ID" : resource[0],
            "R_Name" : "",
            "Count" : 0,
        })
        for(i = 1;i < resource.length;i++){
            data.push({
                "R_ID" : resource[i],
                "R_Name" : "",
                "Count" : 0,
            })
            resource_sql += ' OR FL_Page = ? ';
            parameter.push(resource[i])
        }
        resource_sql += ' ) '
    }
    

    


    return new Promise((resolve,reject)=>{
        if(resource.length == 0){
            resolve(data);
        }else{
            //獲取資源的中文名稱
            db.execute(`SELECT Resource_data.R_ID,RD_Content FROM Resources,Resource_data WHERE L_ID = 'L000000001' AND RD_Type = 2 AND Resources.R_ID = Resource_data.R_ID AND Resources.R_Delete = 0;`,(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    for(i = 0;i < result.length;i++){
                        for(j = 0;j < data.length ; j++){
                            if(data[j].R_ID == result[i].R_ID){
                                data[j].R_Name = result[i].RD_Content;
                            }
                        }
                    }
                }
            })


            if(type == 'PV'){
                db.execute(`SELECT FL_Page,COUNT(FL_Page) Counts FROM Flow WHERE FL_Time BETWEEN ? AND ? AND FL_Page LIKE 'R%' ${resource_sql} GROUP BY FL_Page ORDER BY Counts;`,parameter,(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        for(i = 0;i < result.length;i++){
                            for(j = 0;j < data.length ; j++){
                                if(data[j].R_ID == result[i].FL_Page){
                                    data[j].Count = result[i].Counts;
                                }
                            }
                        }
                        resolve(Arrarysort(data,'Count'));
                    }
                })
            }else if(type == 'Visits'){
                db.execute(`SELECT DATE_FORMAT(FL_Time,'%Y-%m-%d %H:%i:%s') FL_Time,FL_Page,FL_Cookie FROM Flow WHERE FL_Time BETWEEN ? AND ? AND FL_Page LIKE 'R%' ${resource_sql} ORDER BY FL_Time;`,parameter,(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        
                        let user_list = [];
                        if(result.length != 0){

                            user_list.push({
                                "R_ID" : result[0].FL_Page,
                                "cookie" : result[0].FL_Cookie,
                                "count" : 1,
                                "time" : result[0].FL_Time
                            });

                            let found = false;
                            for(i = 1;i < result.length;i++){
                                for(j = user_list.length - 1;j >= 0;j--){
                                    if(user_list[j].cookie == result[i].FL_Cookie && user_list[j].R_ID == result[i].FL_Page){
                                        found = true;
                                        let user_list_time = new Date(user_list[j].time);
                                        let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                        let data_time = new Date(result[i].FL_Time);
                                        

                                        if(data_time > user_list_accept_time){
                                            user_list[j].time = result[i].FL_Time
                                            user_list[j].count += 1;
                                        }
                                        break;
                                    }
                                }

                                if(!found){
                                    user_list.push({
                                        "R_ID" : result[i].FL_Page,
                                        "cookie" : result[i].FL_Cookie,
                                        "count" : 1,
                                        "time" : result[i].FL_Time
                                    });
                                }
                                found = false;
                                
                            }
                        }

                        
                       
                        for(i = 0;i < user_list.length;i++){
                            for(j = 0;j < data.length ; j++){
                                if(data[j].R_ID == user_list[i].R_ID){
                                    data[j].Count += user_list[i].count;
                                }
                            }
                        }

                        resolve(Arrarysort(data,'Count'));
                    }
                })
            }else if(type == 'UV'){
                db.execute(`SELECT FL_Page,COUNT(FL_Time) Counts,FL_Time FROM Flow WHERE FL_Time BETWEEN ? AND ? AND FL_Page LIKE 'R%' ${resource_sql} GROUP BY FL_Page,FL_Cookie`,parameter,(err,result)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        user_list = [];
                        if(result.length != 0){
                            user_list.push({
                                "R_ID" : result[0].FL_Page,
                                "Count" : 1,
                            });

                            let found = false;
                            for(i = 1;i < result.length;i++){
                                for(j = 0;j < user_list.length;j++){
                                    if(user_list[j].R_ID == result[i].FL_Page){
                                        found = true;
                                        user_list[j].Count += 1;
                                        break;
                                    }
                                }

                                if(!found){
                                    user_list.push({
                                        "R_ID" : result[i].FL_Page,
                                        "Count" : 1,
                                    });
                                }
                                found = false;
                                
                            }
                        }

                        for(i = 0;i < user_list.length;i++){
                            for(j = 0;j < data.length ; j++){
                                if(data[j].R_ID == user_list[i].R_ID){
                                    data[j].Count = user_list[i].Count;
                                }
                            }
                        }
                        
                        resolve(Arrarysort(data,'Count'));
                    }
                })                 
            }
        }
    })
}


//的資源累計流量排行
async function getResource_Rank(limit,range,resource) {
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let data = [];
    let date_start = '';
    let date_end = Now;
    
    
    switch(range){
        case '1h' : date_start = Minutes_ago(60); break;
        case '1d' : date_start = Hours_ago(23); break;
        case '1w' : date_start = Day_ago(7); break;
        case '1m' : date_start = Day_ago(31); break;
        case '3m' : date_start = Day_ago(93); break;
        case '6m' : date_start = Day_ago(182); break;
        default : date_start = Hours_ago(23); break;
    }

    let resource_sql = '';
    let parameter = [date_start,date_end];
    if(resource != undefined){
        if(resource.length != 0){
            resource_sql += ' AND ( FL_Page = ?';
            parameter.push(resource[0])
            for(i = 1;i < resource.length;i++){
                resource_sql += ' OR FL_Page = ? ';
                parameter.push(resource[i])
            }
            resource_sql += ' ) '
        }
    }
    parameter.push(String(limit));
    


    return new Promise((resolve,reject)=>{
        db.execute(`SELECT FL_Page,COUNT(FL_Time) Count,Resource_data.RD_Content,D_Name FROM Flow,Resource_data,Resources,Demand WHERE FL_Time 
        BETWEEN ? AND ? AND FL_Page LIKE 'R%' AND Flow.FL_Page = Resource_data.R_ID AND 
        Resource_data.R_ID = Resources.R_ID AND Demand.D_ID = Resources.D_ID AND RD_Type = 2 AND Demand.L_ID = 'L000000001' 
        AND Resource_data.L_ID = 'L000000001' ${resource_sql} GROUP BY FL_Page ORDER BY Count DESC LIMIT ?;`,parameter,(err,result)=>{
            if(err){
                console.log(err);
                reject('dberr')
            }else{
                let rank = 1;
                for(i = 0;i < result.length;i++){
                    if(parseInt(result[i].Count) != 0){
                        data.push({
                            "rank" : rank,
                            "R_Name" : result[i].RD_Content,
                            "D_Name" : result[i].D_Name,
                            "count" : result[i].Count,
                        })
                        if(i < result.length - 1){
                            if(result[i].Count > result[i+1].Count){
                                rank += 1;
                            }
                        }
                    }
                }
                
                resolve(data);
                    
            }  
        }) 
    })

    
         
}





function Minutes_ago(min){  //產出幾分鐘以前
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let time1 = new Date(Now).getTime();
    let time2 = time1 - (min * 1000 * 60);
    
    let dateobj = new Date(time2);

    return dateobj.getFullYear() + '-' + add0((dateobj.getMonth() + 1)) + '-' + add0(dateobj.getDate()) + ' ' + add0(dateobj.getHours()) + ':' + add0(dateobj.getMinutes()) + ":" + add0(dateobj.getSeconds());
}
function Hours_ago(hour){  //產出幾小時以前
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let time1 = new Date(Now).getTime();
    let time2 = time1 - (hour * 1000 * 60 * 60);
    
    let dateobj = new Date(time2);

    return dateobj.getFullYear() + '-' + add0((dateobj.getMonth() + 1)) + '-' + add0(dateobj.getDate()) + ' ' + add0(dateobj.getHours()) + ':' + add0(dateobj.getMinutes()) + ":" + add0(dateobj.getSeconds());
}
function Day_ago(day){      //產出幾天以前
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let time1 = new Date(Now).getTime();
    let time2 = time1 - (day * 1000 * 60 * 60 * 24);
    
    let dateobj = new Date(time2);

    return dateobj.getFullYear() + '-' + add0((dateobj.getMonth() + 1)) + '-' + add0(dateobj.getDate()) + ' ' + add0(dateobj.getHours()) + ':' + add0(dateobj.getMinutes()) + ":" + add0(dateobj.getSeconds());
}
function Date_format(obj){
    return obj.getFullYear() + '-' + add0((obj.getMonth() + 1)) + '-' + add0(obj.getDate()) + ' ' + add0(obj.getHours()) + ':' + add0(obj.getMinutes()) + ":" + add0(obj.getSeconds());
}
function Arrarysort(array,key){
    temp = {};
    for(h = 0 ; h < array.length;h++ ){
        for(k = 0 ;k < array.length;k++){
            if(array[h][key] > array[k][key]){
                temp = array[k];
                array[k] = array[h];
                array[h] = temp;
            }
        }
    }
    return array;
}




function create_label(type,count){
    let data = [];
    let now = new Date();
    let time = '';
    for(i = (count - 1);i >= 0 ; i--){
        switch(type){
            case 'min' : {
                time = new Date(now - i * 1000 * 60);
                data.push(add0(time.getHours()) + ':' + add0(time.getMinutes()));
                break;
            }
            case 'h' : {
                time = new Date(now - i * 1000 * 60 * 60);
                data.push(add0(time.getHours()) + ':00');
                break;
            }
            case 'd' : {
                time = new Date(now - i * 1000 * 60 * 60 * 24);
                data.push(add0(time.getMonth()+1) + '/' + add0(time.getDate()));
                data.push();
                break;
            }
            case 'm' : {
                time = new Date(now - i * 1000 * 60 * 60 * 24 * 31);
                data.push(add0(time.getMonth()+1) + '/' + add0(time.getDate()));
                break;
            }
        }
    }

    return data;
}






module.exports = {
    Flow,
    getCustomer_data,
    getResource_Rank,
    Minutes_ago,
    Hours_ago,
    Day_ago,
    getCustomer_count,
    getCustomer_last_data_percentage,
    getResource_data,
};