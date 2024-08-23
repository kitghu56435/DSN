const db = require('../db');
const moment = require('moment-timezone');
const {add0,checkData,RDNextID,Required_Resource,find} = require('../function');
const resource = require('./resource');
let gap = 30; //min 造訪間隔時間



//紀錄搜尋資料
async function Record(data,SR_Cookie,SR_L_ID){
    let SR_Time = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let SR_ID = await RDNextID('Search_record','SR_ID','SR');


    let SR_Demand = resource.setArray_to_Code(data.demand);
    let SR_Identity = resource.setArray_to_Code(data.identity);
    let SR_School = resource.setArray_to_Code(data.school);
    let SR_Condition = resource.setArray_to_Code(data.condition);
    let SR_City = resource.setArray_to_Code(data.R_City);
    let SR_District = resource.setArray_to_Code(data.R_District);


    return new Promise((resolve,reject)=>{
        if(checkData(SR_Cookie) && checkData(SR_L_ID)){
            db.execute(`INSERT INTO Search_record VALUES(?,?,?,?,?,?,?,?,?,?);`,
            [SR_ID,SR_L_ID,SR_Demand,SR_Identity,SR_Condition,SR_School,SR_City,SR_District,SR_Cookie,SR_Time],(err,results)=>{
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



//取得搜尋流量數據
async function getSearch_data(type,range){
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
    
    
    return new Promise((resolve,reject)=>{
        //累計顧客數量
        if(type == 'PV'){
            if(range == '1h'){ //1小時 
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%H:%i') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ? GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%H:00') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ? GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time) Count FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class;`,[date_start,date_end],(err,result)=>{
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
        }else if(type == 'UVisits'){
            db.execute(`SELECT DATE_FORMAT(SR_Time,'%Y-%m-%d %H:%i:%s') SR_Time,SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ? ORDER BY SR_Time;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){
                        user_list.push({
                            "cookie" : result[0].SR_Cookie,
                            "count" : 0,
                            "time" : result[0].SR_Time,
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].SR_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].SR_Time);
                                    

                                    if(data_time <= user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].SR_Cookie,
                                            "count" : 1,
                                            "time" : result[i].SR_Time
                                        });
                                    }else{
                                        user_list.push({
                                            "cookie" : result[i].SR_Cookie,
                                            "count" : 0,
                                            "time" : result[i].SR_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].SR_Cookie,
                                    "count" : 0,
                                    "time" : result[i].SR_Time
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%H:%i') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ? GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%H:00') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ? GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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
                db.execute(`SELECT DATE_FORMAT(SR_Time,'%m/%d') Time_class,COUNT(SR_Time),SR_Cookie FROM Search_record WHERE SR_Time BETWEEN ? AND ?  GROUP BY Time_class,SR_Cookie;`,[date_start,date_end],(err,result)=>{
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



//取得搜尋需求比例
async function getSearch_Proportion(type,range,data_type){
    let Now = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let data = [];
    let date_start = '';
    let date_end = Now;
    let data_field = '';
    
    switch(range){
        case '1h' : date_start = Minutes_ago(60); break;
        case '1d' : date_start = Hours_ago(23); break;
        case '1w' : date_start = Day_ago(7); break;
        case '1m' : date_start = Day_ago(31); break;
        case '3m' : date_start = Day_ago(93); break;
        case '6m' : date_start = Day_ago(182); break;
        default : date_start = Hours_ago(23); break;
    }

    switch(data_type){
        case 'Demand' : data_field = 'SR_Demand'; break;
        case 'Identity' : data_field = 'SR_Identity'; break;
        case 'Condition' : data_field = 'SR_Condition'; break;
        case 'School' : data_field = 'SR_School'; break;
        case 'City' : data_field = 'SR_City'; break;
        default : data_field = 'SR_Demand'; break;
    }
    
    
    return new Promise((resolve,reject)=>{
        //累計顧客數量
        if(type == 'PV'){
            db.execute(`SELECT ${data_field} FROM Search_record WHERE SR_Time BETWEEN ? AND ?;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let found = false;
                    
                    for(i = 0; i < result.length; i++){
                        result[i][data_field] = resource.setCode_to_Array(result[i][data_field]);
                        for(j = 0;j < result[i][data_field].length;j++){
                            if(data.length == 0){

                                data.push({
                                    "name" : Proportion_DataText(result[i][data_field][j],data_type),
                                    "count" : 1,
                                })

                            }else{
                                for(k = 0; k < data.length;k++){
                                    if(data[k].name == Proportion_DataText(result[i][data_field][j],data_type)){
                                        data[k].count += 1;
                                        found = true;
                                        break;
                                    }
                                }

                                if(!found){
                                    data.push({
                                        "name" : Proportion_DataText(result[i][data_field][j],data_type),
                                        "count" : 1,
                                    })
                                }

                                found = false;
                            }
                        }
                    }

                    

                    resolve(data);
                }
            })
        }else if(type == 'UVisits'){
            db.execute(`SELECT DATE_FORMAT(SR_Time,'%Y-%m-%d %H:%i:%s') SR_Time,SR_Cookie,${data_field} FROM Search_record WHERE SR_Time BETWEEN ? AND ? ORDER BY SR_Time;`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    let user_list = [];
                    if(result.length != 0){
                        user_list.push({
                            "cookie" : result[0].SR_Cookie,
                            "count" : 0,
                            [data_field] : result[0][data_field],
                            "time" : result[0].SR_Time,
                        });

                        let found = false;
                        for(i = 1;i < result.length;i++){
                            for(j = user_list.length - 1;j >= 0;j--){
                                if(user_list[j].cookie == result[i].SR_Cookie){
                                    found = true;
                                    let user_list_time = new Date(user_list[j].time);
                                    let user_list_accept_time = new Date(user_list_time.getTime() + (1000 * 60 * gap));
                                    let data_time = new Date(result[i].SR_Time);
                                    

                                    if(data_time <= user_list_accept_time){
                                        user_list.push({
                                            "cookie" : result[i].SR_Cookie,
                                            "count" : 1,
                                            [data_field] : result[i][data_field],
                                            "time" : result[i].SR_Time
                                        });
                                    }else{
                                        user_list.push({
                                            "cookie" : result[i].SR_Cookie,
                                            "count" : 0,
                                            [data_field] : result[i][data_field],
                                            "time" : result[i].SR_Time
                                        });
                                    }
                                    break;
                                }
                            }

                            if(!found){
                                user_list.push({
                                    "cookie" : result[i].SR_Cookie,
                                    "count" : 0,
                                    [data_field] : result[i][data_field],
                                    "time" : result[i].SR_Time
                                });
                            }
                            found = false;
                            
                        }
                    }

                    

                    let found = false;
                    for(i = 0; i < user_list.length; i++){
                        user_list[i][data_field] = resource.setCode_to_Array(user_list[i][data_field]);
                        for(j = 0;j < user_list[i][data_field].length;j++){
                            if(data.length == 0){
                                for(k = 0; k < user_list.length;k++){
                                    if(user_list[k].count != 0){
                                        data.push({
                                            "name" : Proportion_DataText(user_list[i][data_field][j],data_type),
                                            "count" : 1,
                                        })
                                        break;
                                    }
                                }
                            }else{
                                for(k = 0; k < data.length;k++){
                                    if(data[k].name == Proportion_DataText(user_list[i][data_field][j],data_type) && user_list[i].count != 0){
                                        data[k].count += 1;
                                        found = true;
                                        break;
                                    }
                                }

                                if(!found && user_list[i].count != 0){
                                    data.push({
                                        "name" : Proportion_DataText(user_list[i][data_field][j],data_type),
                                        "count" : 1,
                                    })
                                }

                                found = false;
                            }
                        }
                    }
                    

                    resolve(data);
                }
            })
        }else if(type == 'UV'){
            db.execute(`SELECT COUNT(${data_field}),${data_field} FROM Search_record WHERE SR_Time BETWEEN ? AND ? GROUP BY ${data_field};`,[date_start,date_end],(err,result)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    
                    let found = false;
                    
                    for(i = 0; i < result.length; i++){
                        result[i][data_field] = resource.setCode_to_Array(result[i][data_field]);
                        for(j = 0;j < result[i][data_field].length;j++){
                            if(data.length == 0){
                                data.push({
                                    "name" : Proportion_DataText(result[i][data_field][j],data_type),
                                    "count" : 1,
                                })
                            }else{
                                for(k = 0; k < data.length;k++){
                                    if(data[k].name == Proportion_DataText(result[i][data_field][j],data_type)){
                                        found = true;
                                        break;
                                    }
                                }

                                if(!found){
                                    data.push({
                                        "name" : Proportion_DataText(result[i][data_field][j],data_type),
                                        "count" : 1,
                                    })
                                }

                                found = false;
                            }
                        }
                    }

                    resolve(data);
                }
            })
        }
        
    })
}











function create_label(type,count){
    let now_text = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let now = new Date(now_text)
    let data = [];
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

function Proportion_DataText(code,type){   //用於分遍data label的編號中文function
    switch(type){
        case 'Demand' : return getDemandText(code); break;
        case 'Identity' : return getIdentityText(code); break;
        case 'Condition' : return getConditionText(code); break;
        case 'School' : return getSchoolText(code); break;
        case 'City' : {
            if(getCityText(code) == ''){
                return '不限區';
            }else{
                return getCityText(code);
            }
        }
    }
    return null;
}







// -----------------搜尋資源方法-------------------------------------


async function searchResource_location(R_City){
    return new Promise((resolve,reject)=>{
        if(R_City == 'A0'){
            db.execute(`SELECT R_ID,R_City FROM Resources WHERE R_Delete = 0 AND Resources.R_Shelf = 1`,(err,results)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    resolve(results)
                }
            })
        }else{
            db.execute(`SELECT R_ID,R_City FROM Resources WHERE R_Delete = 0 AND Resources.R_Shelf = 1 AND (R_City LIKE ? OR R_City LIKE '%A0%')`,['%' + R_City + '%'],(err,results)=>{
                if(err){
                    console.log(err);
                    reject();
                }else{
                    resolve(results)
                }
            })
        }
        
    })
}
async function searchResource_identity(identity,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Identity,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_Identity LIKE '%A0%' `;


    if(typeof identity == 'string'){
        str += 'OR R_Identity LIKE ? ';
        parameter.push(`%${identity}%`);
    }else if(typeof identity == 'object'){
        for(i = 0;i<identity.length;i++){
            str += 'OR R_Identity LIKE ? ';
            parameter.push(`%${identity[i]}%`);
        }
    }

    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_Identity LIKE '%A0%' `;

    parameter.push(L_ID);
    parameter.push(L_ID);

    if(typeof identity == 'string'){
        str += 'OR R_Identity LIKE ? ';
        parameter.push(`%${identity}%`);
    }else if(typeof identity == 'object'){
        for(i = 0;i<identity.length;i++){
            str += 'OR R_Identity LIKE ? ';
            parameter.push(`%${identity[i]}%`);
        }
    }
    str += ')';
    //console.log(str);
    //console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_school(school,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_School,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_School LIKE '%A0%' `

    if(typeof school == 'string'){
        str += 'OR R_School LIKE ? ';
        parameter.push(`%${school}%`);
    }else if(typeof school == 'object'){
        for(i = 0;i<school.length;i++){
            str += 'OR R_School LIKE ? ';
            parameter.push(`%${school[i]}%`);
        }
    }


    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_School LIKE '%A0%' `;


    parameter.push(L_ID);
    parameter.push(L_ID);


    if(typeof school == 'string'){
        str += 'OR R_School LIKE ? ';
        parameter.push(`%${school}%`);
    }else if(typeof school == 'object'){
        for(i = 0;i<school.length;i++){
            str += 'OR R_School LIKE ? ';
            parameter.push(`%${school[i]}%`);
        }
    }
    str += ')';
    // console.log(str);
    // console.log(parameter);
    

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_condition(condition,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Condition,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT Resources.R_ID,RD_Content R_Depiction FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID 
    AND Resource_data.L_ID = ? AND Resource_data.RD_Type = 3 AND ( R_Condition LIKE '%A0%' `

    if(typeof condition == 'string'){
        str += 'OR R_Condition LIKE ? ';
        parameter.push(`%${condition}%`);
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){
            str += 'OR R_Condition LIKE ? ';
            parameter.push(`%${condition[i]}%`);
        }
    }


    str +=` )) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( R_Condition LIKE '%A0%' `;


    parameter.push(L_ID);
    parameter.push(L_ID);


    if(typeof condition == 'string'){
        str += 'OR R_Condition LIKE ? ';
        parameter.push(`%${condition}%`);
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){
            str += 'OR R_Condition LIKE ? ';
            parameter.push(`%${condition[i]}%`);
        }
    }
    str += ')';
    // console.log(str);
    // console.log(parameter);
    

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}
async function searchResource_suitable(demand){
    let parameter = [];
    str = `SELECT R_ID,Resources.D_ID FROM Resources,Demand WHERE  R_Delete = 0 AND Resources.R_Shelf = 1 AND Demand.D_ID = Resources.D_ID AND L_ID = 'L000000001' AND ( FALSE `;

    if(typeof demand == 'string'){
        str += 'OR Demand.D_ID = ? ';
        parameter.push(`${getDemandID(demand)}`);
    }else if(typeof demand == 'object'){
        for(i = 0;i<demand.length;i++){
            if(demand[i] != 'A8'){  //避開申請需求
                str += 'OR Demand.D_ID = ? ';
                parameter.push(`${getDemandID(demand[i])}`);
            }   
        }
    }
    str += ')';
    
    // console.log(str);
    // console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
    
}
async function searchResource_requestData(condition,L_ID){
    let parameter = [L_ID];
    str = `SELECT Resources.R_ID,RD_Content R_Name,R_Depiction,R_Img,R_Identity,Demand.D_ID,D_Name FROM Resources,Demand,Resource_data,
    (SELECT R_ID,RD_Content R_Depiction FROM Resource_data WHERE L_ID = ? `
    if(typeof condition == 'string'){
        if(Required_Resource[condition]){

            for(i = 0;i<Required_Resource[condition].length;i++){
                str += 'AND R_ID = ? ';
                parameter.push(Required_Resource[condition][i]);
            }
            
        }
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){

            if(Required_Resource[condition[i]]){
                for(j = 0;j<Required_Resource[condition[i]].length;j++){
                    str += 'AND R_ID = ? ';
                    parameter.push(Required_Resource[condition[i]][j]);
                }
            }

        }
    }


    str += ` AND RD_Type = 3) Depiction
    WHERE Resources.D_ID = Demand.D_ID AND Resources.R_ID = Resource_data.R_ID AND Depiction.R_ID = Resources.R_ID 
    AND Demand.L_ID = ? AND Resource_data.L_ID = ? AND Resources.R_Shelf = 1 AND Resource_data.RD_Type = 2 AND ( FALSE `;

    parameter.push(L_ID);
    parameter.push(L_ID);

    if(typeof condition == 'string'){
        if(Required_Resource[condition]){

            for(i = 0;i<Required_Resource[condition].length;i++){
                str += 'OR Resources.R_ID LIKE ? ';
                parameter.push(`%${Required_Resource[condition][i]}%`);
            }
            
        }
    }else if(typeof condition == 'object'){
        for(i = 0;i<condition.length;i++){

            if(Required_Resource[condition[i]]){
                for(j = 0;j<Required_Resource[condition[i]].length;j++){
                    str += 'OR Resources.R_ID LIKE ? ';
                    parameter.push(`%${Required_Resource[condition[i]][j]}%`);
                }
            }

        }
    }
    str += ')';
    //console.log(str);
    //console.log(parameter);

    return new Promise((resolve,reject)=>{
        db.execute(str,parameter,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve(results)
            }
        })
    })
}



function getDemandID(code){
    switch(code){
        case 'A1' : return `D000000001`  //經濟需求
        case 'A2' : return `D000000003`  //法律需求
        case 'A3' : return `D000000002`  //緊急需求
        case 'A4' : return `D000000004`  //教育需求
        case 'A5' : return `D000000005`  //職涯資訊
        case 'A6' : return `D000000006`  //醫療資訊
        case 'A7' : return `D000000007`  //心理資訊
        default : return '';
    }
}
function getDemandText(code){
    switch(code){
        case 'A1' : return `經濟資訊`;
        case 'A2' : return `法律資訊`; 
        case 'A3' : return `緊急資訊`; 
        case 'A4' : return `教育資訊`; 
        case 'A5' : return `職涯資訊`; 
        case 'A6' : return `醫療資訊`; 
        case 'A7' : return `心理資訊`; 
        default : return '無需求序號';
    }
}
function getIdentityText(code){
    switch(code){
        case 'A0' : return '';  //所有身分回傳空字串
        case 'A1' : return '新住民';
        case 'A2' : return '新住民子女';
        case 'A3' : return '原住民';
        case 'A4' : return '以上皆否';
    }
}
function getSchoolText(code){
    switch(code){
        case 'A0' : return '';  //所有就學回傳空字串
        case 'A1' : return '未就學';
        case 'A2' : return '國小';
        case 'A3' : return '國中';
        case 'A4' : return '高中';
        case 'A5' : return '五專';
        case 'A6' : return '大學';
        case 'A7' : return '研究所';
        case 'A8' : return '畢業就學';
    }
}
function getConditionText(code){
    switch(code){
        case 'A0' : return '';  //所有狀況回傳空字串
        case 'A1' : return '身心障礙';
        case 'A2' : return '經濟弱勢';
        case 'A3' : return '就職青年';
        case 'A4' : return '單親家庭';
        case 'A5' : return '家事糾紛';
        case 'A6' : return '暴力/霸凌受害者';
        case 'A7' : return '心理患者';
        case 'A8' : return '醫院患者';
        case 'A9' : return '懷孕少女';
        case 'B1' : return '租屋者';
    }
}
function getCityText(code){
    switch(code){
        case 'A0' : return '';  //所有縣市回傳空字串
        case 'A1' : return '臺北市';
        case 'A2' : return '新北市';
        case 'A3' : return '桃園市';
        case 'A4' : return '台中市';
        case 'A5' : return '台南市';
        case 'A6' : return '高雄市';
        case 'A7' : return '基隆市';
        case 'A8' : return '新竹市';
        case 'A9' : return '新竹縣';
        case 'B1' : return '苗栗縣';
        case 'B2' : return '彰化縣';
        case 'B3' : return '南投縣';
        case 'B4' : return '雲林縣';
        case 'B5' : return '嘉義市';
        case 'B6' : return '嘉義縣';
        case 'B7' : return '屏東縣';
        case 'B8' : return '宜蘭縣';
        case 'B9' : return '花蓮縣';
        case 'C1' : return '台東縣';
        case 'C2' : return '澎湖縣';
        case 'C3' : return '金門縣';
        case 'C4' : return '連江縣';
    }
}


function getMultiple_IdentityText(identity,R_Identity){
    //identity   使用者搜尋的序號
    //R_Identity 資源的身分序號
    if(R_Identity == 'A0'){
        return getIdentityText(R_Identity);
    }else{
        if(typeof identity == 'string'){
            if(find(identity,R_Identity)){
                //console.log(identity,R_Identity);
                return getIdentityText(identity);
            }
        }else if(typeof identity == 'object'){
            let str = '';
            for(h = 0;h<identity.length;h++){
                if(find(identity[h],R_Identity)){
                    str +=  getIdentityText(identity[h]) + "、";
                }
            }
            return str.substring(0,(str.length - 1));
        }
    }
    
}
function getMultiple_ConditionText(condition,R_Condition){
    //condition   使用者搜尋的序號
    //R_Condition 資源的狀況序號
    if(R_Condition == 'A0'){
        return getConditionText(R_Condition);
    }else{
        if(typeof condition == 'string'){
            if(find(condition,R_Condition)){
                //console.log(condition,R_Condition);
                return getConditionText(condition);
            }
        }else if(typeof condition == 'object'){
            let str = '';
            for(h = 0;h<condition.length;h++){
                if(find(condition[h],R_Condition)){
                    str +=  getConditionText(condition[h]) + "、";
                }
            }
            return str.substring(0,(str.length - 1));
        }
    }
}
function getMultiple_SchoolText(school,R_School){
    if(R_School == 'A0'){
        return getSchoolText(R_School);
    }else{
        if(find(school,R_School)){
            return getSchoolText(school);
        }
    }
}
function getMultiple_LocationText(City,R_City){
    if(R_City == 'A0' || City == 'A0'){
        return getCityText(R_City);
    }else{
        if(find(City,R_City)){
            return getCityText(City);
        }
    }
}
function checkDemand(demand,D_ID){
    let found = false;

    if(typeof demand == 'string'){
        if(getDemandID(demand) == D_ID){
            found = true;
        }
    }else if(typeof demand == 'object'){
        let str = '';
        for(h = 0;h<demand.length;h++){
            if(getDemandID(demand[i]) == D_ID){
                found = true;
                break;
            }
        }
    }

    return found;
}










module.exports = {
    Record,
    getSearch_data,
    getSearch_Proportion,

    getDemandText,
    getDemandID,
    getIdentityText,
    getSchoolText,
    getConditionText,
    getCityText,
    searchResource_location,
    searchResource_identity,
    searchResource_school,
    searchResource_condition,
    searchResource_suitable,
    searchResource_requestData,
    getMultiple_IdentityText,
    getMultiple_ConditionText,
    getMultiple_SchoolText,
    getMultiple_LocationText,
    checkDemand
};