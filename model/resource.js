const db = require('../db');
const {NextID,checkData,RDNextID,addID} = require('../function');
const moment = require('moment-timezone');
const {readFileSync,writeFile,unlink} = require('fs');


//新增需求
async function Create_Demand(D_Name,L_ID,D_ID){
    if(D_ID == undefined){
        D_ID = await NextID('Demand','D_ID','D');
    }
    if(L_ID == undefined) L_ID = 'L000000001';

    return new Promise((resolve,reject)=>{
        db.execute(`INSERT INTO Demand VALUES(?,?,?);`,[D_ID,L_ID,D_Name],(err)=>{
            if(err){
                console.log(err)
                reject('dberr');
            }else{
                resolve();
            }
        })
    })
}


//新增資源
async function Create_Resource(data){
    let R_ID = await NextID('Resources','R_ID','R');
    let RD_ID1 = await RDNextID('Resource_data','RD_ID','RD');  //給資源名稱的
    let RD_ID2 = addID('RD',RD_ID1)                             //給資源敘述的
    let R_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let R_Name = data.R_Name;
    let T_ID = data.T_ID;
    let D_ID = data.D_ID;
    let S_ID = data.S_ID;
    let R_Depiction = data.R_Depiction;
    let R_Img = data.R_Img;

    if(checkData(R_Name) && checkData(T_ID) && checkData(D_ID)  && checkData(R_Img) && checkData(R_Depiction)){
        if(checkData(S_ID)){
            if(typeof S_ID == 'object'){
                for(c = 0;c<S_ID.length;c++){
                    await create_Supplier_binding(R_ID,S_ID[c]);
                }
            }else{
                await create_Supplier_binding(R_ID,S_ID);
            }
        }

        return new Promise((resolve,reject)=>{
            //這邊可以做資料庫交易優化
            db.execute(`INSERT INTO Resources VALUES(?,?,?,1,?,?,?,null,null,null,null,0);`,
            [R_ID,D_ID,T_ID,R_Date,R_Date,R_Img],(err)=>{
                if(err){
                    console.log(err)
                    reject('dberr');
                }else{
                    db.execute(`INSERT INTO Resource_data VALUES(?,?,'L000000001',null,2,?);`,
                    [RD_ID1,R_ID,R_Name],(err)=>{
                        if(err){
                            console.log(err);
                            reject('dberr');
                        }
                    })
                    db.execute(`INSERT INTO Resource_data VALUES(?,?,'L000000001',null,3,?);`,
                    [RD_ID2,R_ID,R_Depiction],(err)=>{
                        if(err){
                            console.log(err);
                            reject('dberr');
                        }else{
                            resolve();
                        }
                    })
                }
            })
        })

    }else{
        return new Promise((resolve,reject)=>{
            reject('dataerr')
        })
    }




}

//新增模板
async function Create_Templare(data){
    let T_ID = await NextID('Template','T_ID','T');
    let T_Number = Number(T_ID.substring(1));


    if(checkData(data.T_Name) && checkData(data.T_base64)){
        return new Promise((resolve,reject)=>{

            db.execute(`INSERT INTO Template VALUES(?,?,'T${T_Number}.html');`,[T_ID,data.T_Name],(err)=>{
                if(err){
                    console.log(err)
                    reject('dberr');
                }
    
            })
    
            let base64Data = data.T_base64.replace(/^data:text\/\html+;base64,/, "");
            let new_file = __dirname + `/../public/html/template/T${T_Number}.html`;
            var dataBuffer = Buffer.from(base64Data, 'base64');
            writeFile(new_file, dataBuffer, function(err) {
                if(err){
                    console.log(err)
                    reject('dberr');
                }else{
                    resolve();
                }
            }); 
        })
    }else{
        return new Promise((resolve,reject)=>{
            reject('dataerr')
        })
    }

}





//修改模板
async function Edit_Templare(input_data){
    let T_ID = input_data.T_ID;
    let T_Name = input_data.T_Name;
    let data = {
        "T_Name" : T_Name,
        "msg" : "success",
    }

    return new Promise((resolve,reject)=>{
        if(checkData(T_ID) && checkData(T_Name)){
            db.execute(`SELECT T_ID FROM Template WHERE T_ID = ?`,[T_ID],(err,results)=>{  //確認是否有此模板
                if(err){
                    console.log(err);
                    reject("dberr");
                }else if(results.length == 0){
                    reject("nodata");
                }else{
                    
                    db.execute('UPDATE Template SET T_Name = ? WHERE T_ID = ?;',[T_Name,T_ID],(err,results)=>{
                        if(err){
                            console.log(err);
                            reject("dberr");
                        }else{
                            resolve(data);
                        }
                    })
                }
            })   
        }else{
            reject("dataerr");
        }
    })

}

//修改需求名稱
async function Edit_Demand_name(data,Array){
    let D_ID = data.D_ID;


    for(x = 0;x<Array.length;x++){
        await update_Demand_data(D_ID,Array[x].L_ID,data[Array[x].L_ID]);
    }

    return new Promise((resolve)=>{
        resolve();
    })
}

//修改上下架狀態
async function Edit_Shelf(data){
    let R_ID = data.R_ID;

    return new Promise((resolve,reject)=>{
        if(checkData(R_ID)){
            db.execute(`SELECT R_Shelf FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{
                if(err){
                    reject("dberr");
                }else if(results[0].length == 0){
                    reject("nodata");
                }else{
                    db.execute(`UPDATE Resources SET R_Shelf = ? WHERE R_ID = ?`,[!results[0].R_Shelf,R_ID],(err)=>{
                        if(err){
                            reject("dberr");
                        }else{
                            resolve(!results[0].R_Shelf);
                        }
                    })
                }
            })
        }else{
            reject("dataerr");
        }
    })
}

//修改資源頁面資料
async function Edit_Resource_Page_data(data){
    let R_ID = data.R_ID;
    let L_ID = data.L_ID;

    return new Promise((resolve,reject)=>{
        if(checkData(R_ID) && checkData(L_ID)){
            db.execute(`SELECT L_ID FROM Languages WHERE L_ID = ?;`,[L_ID],(err,results)=>{  //確認是否有此語言續號
                if(err){
                    console.log(err);
                    reject("dberr")
                }else if(results.length == 0){
                    reject("nodata");
                }else{
                    db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{  //確認是否有此資源
                        if(err){
                            console.log(err);
                            reject("dberr")
                        }else if(results.length == 0){
                            reject("nodata");
                        }else{
                            update_Resource_data(data).then(()=>{
                                resolve("success")
                            })
                        }
                    })
                }
            })
        }else{
            reject("dataerr")
        }
    })
}

//修改資源資料
async function Edit_Resource_data(data){
    let R_ID = data.R_ID;
    let L_ID = data.L_ID;
    let R_Name = data.R_Name;
    let R_Img = data.R_Img;


    return new Promise((resolve,reject)=>{
        if(checkData(R_ID) && checkData(L_ID) && checkData(R_Name) && checkData(R_Img)){
            db.execute(`SELECT L_ID FROM Languages WHERE L_ID = ?;`,[L_ID],(err,results)=>{  //確認是否有此語言續號
                if(err){
                    console.log(err);
                    reject("dberr");
                }else if(results.length == 0){
                    reject("nodata");
                }else{
                    db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{  //確認是否有此資源
                        if(err){
                            console.log(err);
                            reject("dberr");
                        }else if(results.length == 0){
                            reject("nodata");
                        }else{
                            update_Resource(data).then(()=>{
                                resolve("success");
                            })
                        }
                    })
                }
            })
        }else{
            reject("dataerr")
        }
    })
}

//修改資源搜尋參數
async function Edit_Resource_search(data){
    let R_ID = data.R_ID;
    let R_Identity_code = setArray_to_Code(data.R_Identity);
    let R_School_code = setArray_to_Code(data.R_School);
    let R_City_code = setArray_to_Code(data.R_City);
    let R_Condition_code = setArray_to_Code(data.R_Condition);

    return new Promise((resolve,reject)=>{
        db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ? AND R_Delete = 0;`,[R_ID],(err,results)=>{  //確認是否有此資源
            if(err){
                console.log(err);
                resolve("dberr");
            }else if(results.length == 0){
                resolve("nodata");
            }else{
                

                db.execute(`UPDATE Resources SET R_Identity = ?,R_School = ?,R_City = ?,R_Condition = ? WHERE R_ID = ?`,[R_Identity_code,R_School_code,R_City_code,R_Condition_code,R_ID],(err)=>{
                    if(err){
                        console.log(err)
                        resolve("dberr");
                    }else{
                        resolve('success')
                    }
                })
            }
        }) 
    })
}






//刪除需求
async function Delete_Demand(input_data){
    let D_ID = input_data.D_ID;
    let data = {
        "all_d" : 0,   //需求數量
        "all_r" : 0,   //資源數量
        "msg" : "success",
        "Demand" : [],
    }

    return new Promise((resolve,reject)=>{
        if(checkData(D_ID)){
            db.execute(`SELECT COUNT(R_ID) R_Count FROM Resources WHERE R_Delete = 0 AND D_ID = ?;`,[D_ID],(err,results)=>{
                if(err){
                    console.log(err);
                    reject("dberr");
                }else if(results[0].R_Count != 0){
                    reject("deleteerr");
                }else{
                    db.execute(`DELETE FROM Demand WHERE D_ID = ?;`,[D_ID],(err)=>{
                        if(err){
                            console.log(err);
                            reject("dberr");
                        }else{
                            db.execute(`SELECT * FROM Demand WHERE L_ID = 'L000000001' ORDER BY D_ID;`,(err,results)=>{
                                if(err){
                                    reject("dberr");
                                    console.log(err);
                                }else{
                                    data.all_d = results.length;
                                    for(i = 0;i<results.length;i++){
                                        data.Demand.push({
                                            "D_ID" : results[i].D_ID,
                                            "D_Name" : results[i].D_Name,
                                            "D_Resource" : 0,
                                            "R_On_Shelf" : 0,
                                            "R_Down_Shelf" : 0
                                        });
                                    }
                                }
                            })
                            db.execute('SELECT Resources.D_ID,COUNT(R_ID) R_Num FROM Resources WHERE R_Delete = 0 GROUP BY D_ID ORDER BY D_ID;',(err,results)=>{
                                if(err){
                                    console.log(err);
                                    reject("dberr");
                                }else{
                                    for(i = 0;i<results.length;i++){
                                        for(j = 0;j<data.Demand.length;j++){
                                            if(results[i].D_ID == data.Demand[j].D_ID){
                                                data.Demand[j].D_Resource = results[i].R_Num;
                                                data.all_r += Number(results[i].R_Num);
                                            }
                                        }
                                    }
                                }
                            })
                            db.execute('SELECT Resources.D_ID,COUNT(R_ID) R_Num FROM Resources WHERE R_Delete = 0 AND R_Shelf = 1 GROUP BY D_ID ORDER BY D_ID;',(err,results)=>{
                                if(err){
                                    reject("dberr");
                                    console.log(err);
                                }else{
                                    for(i = 0;i<results.length;i++){
                                        for(j = 0;j<data.Demand.length;j++){
                                            if(results[i].D_ID == data.Demand[j].D_ID){
                                                data.Demand[j].R_On_Shelf = results[i].R_Num;
                                                data.Demand[j].R_Down_Shelf = data.Demand[j].D_Resource - results[i].R_Num;
                                            }
                                        }
                                    }
            
                                    resolve(data);
                                }
                            })
                        }
                    })
                }
            })
        }else{
            reject("dataerr");
        }
    })
}

//刪除資源
async function Delete_Resource(input_data){
    let R_ID = input_data.R_ID;
    let D_ID = input_data.D_ID;
    let data = {
        "msg" : "success",
        "all_r" : 0,        //資源數量
        "On_Shelf" : 0,     //總上架數量
        "Down_Shelf" : 0,   //總下架數量
        "demand" : {
            "D_Name" : "",
            "D_ID" : ""
        },
        "resource" : []
    }

    return new Promise((resolve,reject)=>{
        if(checkData(R_ID)){
            db.execute(`UPDATE Resources SET R_Delete = 1 WHERE R_ID = ? AND R_Delete = 0`,[R_ID],(err)=>{
                if(err){
                    resolve("dberr");
                    console.log(err);
                }else{
                    db.execute(`SELECT D_ID,D_Name FROM Demand WHERE L_ID = 'L000000001' AND D_ID = ?;`,[D_ID],(err,results)=>{
                        if(err){
                            console.log(err);
                            resolve("dberr");
                        }else{
                            data.demand.D_Name = results[0].D_Name;
                            data.demand.D_ID = results[0].D_ID;
                        }
                    })
                    db.execute(`SELECT Resources.R_ID,T_Name,R_Shelf,DATE_FORMAT(R_Update,'%Y年%m月%d日 %H:%i:%s') R_Update,RD_Content R_Name
                    FROM Resources,Template,Resource_data WHERE Resources.T_ID = Template.T_ID AND Resources.R_ID = Resource_data.R_ID 
                    AND R_Delete = 0 AND RD_Type = 2 AND L_ID = 'L000000001' AND D_ID = ?;`,[D_ID],(err,results)=>{
                        if(err){
                            console.log(err);
                            resolve("dberr");
                        }else{
                            data.all_r = results.length;
                            for(i = 0;i<results.length;i++){
                                if(results[i].R_Shelf == 1){
                                    data.On_Shelf++;
                                }else{
                                    data.Down_Shelf++;
                                }
                
                                data.resource.push({ 
                                    "R_ID" : results[i].R_ID, 
                                    "R_Name" : results[i].R_Name,
                                    "T_Name" : results[i].T_Name,
                                    "R_Shelf" : results[i].R_Shelf,
                                    "R_Update" : results[i].R_Update
                                });
                            }
                            resolve(data);
                        }
                    })
                }
            })
        }else{
            resolve("dataerr");
        }
    })
}

//刪除模板
async function Delete_Templare(input_data){
    let T_ID = input_data.T_ID;
    let T_Number = Number(T_ID.substring(1));
    let data = {
        "msg" : "success",
        "all_t" : 0,        //模板數量
        "template" : []
    }

    return new Promise((resolve,reject)=>{
        if(checkData(T_ID)){
            db.execute(`SELECT COUNT(*) T_Count FROM Resources WHERE R_Delete = 0 AND T_ID = ?;`,[T_ID],(err,results)=>{
                if(err){
                    console.log(err);
                    reject("dberr");
                }else if(results[0].T_Count != 0){  //還有資源再使用
                    reject("rerr");
                }else{
                    unlink(`./public/html/template/T${T_Number}.html`,(err)=>{
                        if(err){
                            console.log(err);
                        }
                    })
                    db.execute(`DELETE FROM Template WHERE T_ID = ?;`,[T_ID],(err)=>{
                        if(err){
                            console.log(err);
                            reject("dberr");
                        }
                    })
                    db.execute(`SELECT Template.*,Resources.R_Name FROM Template LEFT JOIN (SELECT RD_Content R_Name,T_ID FROM Resources,Resource_data 
                        WHERE Resources.R_ID = Resource_data.R_ID AND R_Delete = 0 AND RD_Type = 2 
                        AND Resource_data.L_ID = 'L000000001') Resources ON Template.T_ID = Resources.T_ID;`,(err,results)=>{
                        if(err){
                            console.log(err);
                            reject("dberr");
                        }else{
                            if(results.length != 0){
                                let now_template = results[0].T_ID;
                                data.all_t = 1;       //模板總數
                
                                data.template.push({
                                    "T_ID" : results[0].T_ID,
                                    "T_Name" : results[0].T_Name,
                                    "T_Use" : 0,
                                    "T_Path" : results[0].T_Path,
                                    "T_Resource" : [results[0].R_Name],
                                })
                
                                for(i = 1;i<results.length;i++){
                                    if(results[i].T_ID != now_template){
                                        now_template = results[i].T_ID;
                                        data.all_t += 1; 
                                        data.template.push({
                                            "T_ID" : results[i].T_ID,
                                            "T_Name" : results[i].T_Name,
                                            "T_Use" : T_Use(results[i].R_Name),
                                            "T_Path" : results[i].T_Path,
                                            "T_Resource" : [results[i].R_Name],
                                        })
                                    }else{
                                        data.template[data.template.length-1].T_Use += 1;
                                        data.template[data.template.length-1].T_Resource.push(results[i].R_Name);
                                    }
                                }
                            }
                            
                        }
                
                        resolve(data);
                    })
                }
            })
        }else{
            reject("dataerr");
        }
    })
}





//取得資源頁面資料
async function getResource_Page_data(L_ID,R_ID){ 
    let T_Path = '';
    let data = {
        "resource" : {
            "D_Name" : "",
            "D_ID" : "",
            "R_Name" : "",
            "R_ID" : "",
            "R_Shelf" : 1,
            "L_ID" : L_ID,
        },
        "msgbox": "",
        "leng" : [],
        "container" : []
    }

    
    return new Promise((resolve,reject)=>{
        db.execute(`SELECT Resources.R_ID,R_Shelf,Resources.D_ID,D_Name,T_Path,RD_Content R_Name FROM Resources,Demand,Template,Resource_data
        WHERE Resources.D_ID = Demand.D_ID AND Template.T_ID = Resources.T_ID AND Resources.R_ID = Resource_data.R_ID 
        AND R_Delete = 0 AND Demand.L_ID = 'L000000001' AND Resources.R_ID = ? AND RD_Type = 2 AND Resource_data.L_ID = 'L000000001';`,[R_ID],(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                T_Path = results[0].T_Path;
                data.resource.D_Name = results[0].D_Name;
                data.resource.D_ID = results[0].D_ID;
                data.resource.R_Name = results[0].R_Name;
                data.resource.R_ID = results[0].R_ID;
                data.resource.R_Shelf = results[0].R_Shelf;
            }
        })
        db.execute(`SELECT L_ID,L_Name FROM Languages;`,(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0;i<results.length;i++){
                    data.leng.push({
                        "L_Name" : results[i].L_Name,
                        "L_ID" : results[i].L_ID,
                    })
                }
            }
        })
        db.execute(`SELECT * FROM Resource_data WHERE R_ID = ? AND L_ID = ? AND RD_Type = 1;`,[R_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                try{
                    let template_html = readFileSync('./public/html/template/' + T_Path,'utf-8');
                    let content = template_html;
                    let container2 = 'container2';   //container標籤
                    let container2_bool = false;
                    let count = 0;
                    let label_state = '';
        
                    let dnsid = '';
                    let dsnnote = '';
                    let title_str = 'T-title';
                    let title_count = 0;   //計數
                    let img_str = 'T-img';
                    let img_count = 0;     //計數
                    let text_str = 'T-text';
                    let text_count = 0;    //計數
                    let url_str = 'T-url';
                    let url_count = 0;     //計數
                    let dsnid_str = 'dsnid="';
                    let dsnid_count = 0;     //計數
                    let dsnnote_str = 'dsnnote="';
                    let dsnnote_count = 0;     //計數
        
                    let container = null;
                    
                    //讀取模板ID
                    for(k = 0;k<content.length;k++){
                        for(j = 0;j<container2.length;j++){
                            if(content[k+j] == container2[j]){
                                count++;
                                if(count == container2.length){  //找到container2
                                    if(container != null){
                                        if(container.note.length < (container.item)){
                                            container.note.push("");
                                        }
                                        if(container.id.length < (container.item)){
                                            container.id.push("");
                                        }
                                        data.container.push(container);
                                        
                                        container = null;
                                    }
                                    container2_bool = true;
                                    
                                    count = 0;            //全部初始化
                                    title_count = 0;     
                                    img_count = 0;
                                    text_count = 0;
                                    url_count = 0;    
                                    img_num = 0;
                                    text_num = 0;
                                    url_num = 0;
                                    break;
                                }
                            }else{
                                count = 0;
                                break;
                            }
                        }
                        if(container2_bool){   //如果container2_bool被開啟，就開始收集內標籤
                            for(s1 = 0;s1<title_str.length;s1++){    //尋找title內標籤
                                if(content[k+s1] == title_str[s1]){
                                    title_count++;
                                    if(title_count == title_str.length){  
                                        label_state = 'title';
                                        title_count = 0;
                                        break;
                                    }
                                }else{
                                    title_count = 0;
                                    break;
                                }
                            }
        
        
                            for(s2 = 0;s2<img_str.length;s2++){      //尋找img內標籤
                                if(content[k+s2] == img_str[s2]){
                                    img_count++;
                                    if(img_count == img_str.length){  
                                        label_state = 'img'
                                        img_count = 0;
                                        break;
                                    }
                                }else{
                                    img_count = 0;
                                    break;
                                }
                            }
                            for(s3 = 0;s3<text_str.length;s3++){      //尋找text內標籤
                                if(content[k+s3] == text_str[s3]){
                                    text_count++;
                                    if(text_count == text_str.length){  
                                        label_state = 'text'
                                        text_count = 0;
                                        break;
                                    }
                                }else{
                                    text_count = 0;
                                    break;
                                }
                            }
                            for(s4 = 0;s4<url_str.length;s4++){      //尋找url內標籤
                                if(content[k+s4] == url_str[s4]){
                                    url_count++;
                                    if(url_count == url_str.length){  
                                        label_state = 'url'
                                        url_count = 0;
                                        break;
                                    }
                                }else{
                                    url_count = 0;
                                    break;
                                }
                            }
        
        
                            for(s5 = 0;s5<dsnid_str.length;s5++){      //尋找dsnid內標籤
                                if(content[k+s5] == dsnid_str[s5]){
                                    dsnid_count++;
                                    if(dsnid_count == dsnid_str.length){  
                                        
                                        for(s10 = 1;s10<100;s10++){      //100字元以內
                                            if(content[k+s5+s10] != '"'){
                                                dnsid += content[k+s5+s10];
                                            }else{
                                                break;
                                            }
                                        }
                                        label_state = 'dsnid'
                                        dsnid_count = 0;
                                        break;
                                    }
                                }else{
                                    dsnid_count = 0;
                                    break;
                                }
                            }
                            for(s6 = 0;s6<dsnnote_str.length;s6++){      //尋找dsnnote內標籤
                                if(content[k+s6] == dsnnote_str[s6]){
                                    dsnnote_count++;
                                    if(dsnnote_count == dsnnote_str.length){  
                                        
                                        for(s10 = 1;s10<100;s10++){      //100字元以內
                                            if(content[k+s6+s10] != '"'){
                                                dsnnote += content[k+s6+s10];
                                            }else{
                                                break;
                                            }
                                        }
                                        label_state = 'dsnnote'
                                        dsnnote_count = 0;
                                        break;
                                    }
                                }else{
                                    dsnnote_count = 0;
                                    break;
                                }
                            }
                            
        
                            switch(label_state){
                                case 'title' : {
                                    container = {    
                                        "type" : "title",
                                        "item" : 1,
                                        "note" : [],
                                        "id" : [],
                                        "item_type" : ["text"],
                                        "content" : [""]
                                    }
                                }break;
                                case 'img' : {
                                    if(container == null){
                                        container = {    
                                            "type" : "content",
                                            "item" : 1,
                                            "note" : [],
                                            "id" : [],
                                            "item_type" : ["img"],
                                            "content" : ['']
                                        }
                                    }else{
                                        container.item += 1;
                                        container.item_type.push("img");
                                        container.content.push("");
                                        if(container.note.length < (container.item - 1)){
                                            container.note.push("");
                                        }
                                        if(container.id.length < (container.item - 1)){
                                            container.id.push("");
                                        }
                                    }
                                }break;
                                case 'text' : {
                                    if(container == null){
                                        container = {    
                                            "type" : "content",
                                            "item" : 1,
                                            "note" : [],
                                            "id" : [],
                                            "item_type" : ["text"],
                                            "content" : ['']
                                        }
                                    }else{
                                        container.item += 1;
                                        container.item_type.push("text");
                                        container.content.push("");
                                        if(container.note.length < (container.item - 1)){
                                            container.note.push("");
                                        }
                                        if(container.id.length < (container.item - 1)){
                                            container.id.push("");
                                        }
                                    }
                                }break;
                                case 'url' : {
                                    if(container == null){
                                        container = {    
                                            "type" : "content",
                                            "item" : 1,
                                            "note" : [],
                                            "id" : [],
                                            "item_type" : ["url"],
                                            "content" : ['']
                                        }
                                    }else{
                                        container.item += 1;
                                        container.item_type.push("url");
                                        container.content.push("");
                                        if(container.note.length < (container.item - 1)){
                                            container.note.push("");
                                        }
                                        if(container.id.length < (container.item - 1)){
                                            container.id.push("");
                                        }
                                    }
                                }break;
                                case 'dsnid' : {
                                    if(container != null){
                                        container.id.push(dnsid);
                                    }
                                    dnsid = '';
                                }break;
                                case 'dsnnote' : {
                                    if(container != null){
                                        container.note.push(dsnnote);
                                    }
                                    dsnnote = '';
                                }break;
                            }
                            label_state = '';
                        }             
                    }
                    if(container.note.length < (container.item)){
                        container.note.push("");
                    }
                    if(container.id.length < (container.item)){
                        container.id.push("");
                    }
                    data.container.push(container);
        
        
        
        
                    for(i = 0;i<results.length;i++){
                        for(j = 0;j<data.container.length;j++){
                            for(k = 0;k<data.container[j].item;k++){
                                if(data.container[j].id[k] == results[i].RD_Template_ID){
                                    data.container[j].content[k] = results[i].RD_Content;
                                }
                            }
                        }
                    }
                    
                    for(j = 0;j<data.container.length;j++){
                        for(k = 0;k<data.container[j].item;k++){
                            if(data.container[j].id[k] == ''){
                                data.container[j].id[k] = '系統ID讀取錯誤';
                            }
                        }
                    }        
                }catch(e){
                    console.log(e)
                    data.msgbox += '模板讀取錯誤<br>';
                }
            }
    
            resolve(data);
        })            
    })

}

//取得資源基本資料
async function getResource_data(input_data){ 
    let R_ID = input_data.R_ID;
    let L_ID = input_data.L_ID;

    let data = {
        "leng" : [],
        "R_ID" : R_ID,
        "L_ID" : L_ID,
        "R_Name" : "",
        "R_Shelf" : "",
        "T_ID" : "",
        "D_Name" : "",
        "D_ID" : "",
        "R_Depiction" : "",
        "R_Img" : "",
        "T_List" : [],
        "D_List" : [],
        "S_List" : [],
        "msgbox" : ""
    }

    
    return new Promise((resolve,reject)=>{
        db.execute(`SELECT Resources.D_ID,D_Name,T_ID,R_Img,R_Shelf FROM Resources,Demand WHERE Demand.D_ID = Resources.D_ID 
        AND R_Delete = 0 AND Demand.L_ID = 'L000000001' AND Resources.R_ID = ?;`,[R_ID],(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                data.D_Name = results[0].D_Name;
                data.T_ID = results[0].T_ID;
                data.D_ID = results[0].D_ID;
                data.R_Img = results[0].R_Img;
                data.R_Shelf = results[0].R_Shelf;
            }
        })
        db.execute(`SELECT RD_Content R_Name,RD_Type FROM Resource_data WHERE R_ID = ? AND L_ID = ? AND ( RD_Type = 3 OR RD_Type = 2) ORDER BY RD_Type;`,[R_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0; i < results.length;i++){
                    if(results[i].RD_Type == 2){
                        data.R_Name = results[i].R_Name;
                    }else if(results[i].RD_Type == 3){
                        data.R_Depiction = results[i].R_Name;  //這個其實是資源敘述
                    }
                }
            }
        })
        db.execute(`SELECT L_ID,L_Name FROM Languages;`,(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0;i<results.length;i++){
                    data.leng.push({
                        "L_Name" : results[i].L_Name,
                        "L_ID" : results[i].L_ID,
                    })
                }
            }
        })
        db.execute(`SELECT * FROM Template;`,(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0;i<results.length;i++){
                    data.T_List.push({
                        "T_Name" : results[i].T_Name,
                        "T_ID" : results[i].T_ID,
                    })
                }
            }
        })
        db.execute(`SELECT * FROM Demand WHERE Demand.L_ID = 'L000000001';`,(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0;i<results.length;i++){
                    data.D_List.push({
                        "D_Name" : results[i].D_Name,
                        "D_ID" : results[i].D_ID,
                    })
                }
            }
        })
        db.execute(`SELECT Supplier.S_ID,S_Name,Supplier_binding.SB_ID FROM Supplier LEFT JOIN Supplier_binding 
        ON Supplier_binding.S_ID = Supplier.S_ID AND Supplier_binding.R_ID = ?;`,[R_ID],(err,results)=>{
            if(err){
                console.log(err);
                data.msgbox += '資料庫錯誤<br>';
            }else{
                for(i = 0;i<results.length;i++){
                    if(results[i].SB_ID == null || results[i].SB_ID == 'null'){
                        data.S_List.push({
                            "S_Name" : results[i].S_Name,
                            "S_ID" : results[i].S_ID,
                            "S_Check" : false
                        })
                    }else{
                        data.S_List.push({
                            "S_Name" : results[i].S_Name,
                            "S_ID" : results[i].S_ID,
                            "S_Check" : true
                        })
                    }
                    
                }
            }
            resolve(data)
        })           
    })

}




async function update_Demand_data(D_ID,L_ID,D_Name){
    

    return new Promise((resolve)=>{
        db.execute(`UPDATE Demand SET D_Name = ? WHERE D_ID = ? AND L_ID = ?`,[D_Name,D_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err);
            }else{
                if(results.affectedRows == 0){
                    Create_Demand(D_Name,L_ID,D_ID);
                }
                resolve();
            }
        })
    })
}
async function update_Resource_data(data){
    let R_Update = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let R_ID = data.R_ID;
    let L_ID = data.L_ID;
    let delete_sql = 'DELETE FROM Resource_data WHERE R_ID = ? AND L_ID = ?';
    let parameter = [R_ID,L_ID];

    for(x = 0;x<data.Template_ID.length;x++){
        delete_sql += ' AND RD_Template_ID != ?';
        parameter.push(data.Template_ID[x]);
        await create_Resource_data(R_ID,L_ID,data.Template_ID[x],data[data.Template_ID[x]]);
    }


    // console.log(delete_sql);
    // console.log(parameter);

    return new Promise((resolve,rejects)=>{
        
        //同步資料庫資料，刪除沒有包含在這批的dsnid資料
        db.execute(delete_sql,parameter,(err)=>{
            if(err){
                console.log(err);
            }
            
        })
        //更新資源更新時間
        db.execute(`UPDATE Resources SET R_Update = ? WHERE R_ID = ?`,[R_Update,R_ID],(err)=>{
            if(err){
                console.log(err);
                rejects();
            }else{
                resolve();
            }
        })
    })
}
async function create_Resource_data(R_ID,L_ID,Template_ID,Content){
    let RD_ID = await RDNextID('Resource_data','RD_ID','RD');
    

    await delete_Resource_data(R_ID,L_ID,Template_ID,Content);  //先刪除原來的資料

    return new Promise((resolve,reject)=>{
        if(Content == 'delete_img'){  //刪除照片
            unlink(`./public/img/resource/${Template_ID}_${R_ID}_${L_ID}.png`,(err)=>{
                if(err){
                    console.log(err);
                }
                resolve();
            })
        }else if(Content != 'img_no_change'){
            if(isBase64(Content)){  //是照片
                let img_name = Template_ID + '_' + R_ID + '_' + L_ID + '.png';
                let base64Data = Content.replace(/^data:image\/\w+;base64,/, "");
                let new_file = __dirname + `/../public/img/resource/${img_name}`;
                var dataBuffer = Buffer.from(base64Data, 'base64');
                writeFile(new_file, dataBuffer, function(err) {
                    if(err){
                        console.log(err)
                    }
                });
    
                Content = img_name; //資料庫內容換成檔案名稱
            }
            db.execute(`INSERT INTO Resource_data VALUES(?,?,?,?,1,?);`,[RD_ID,R_ID,L_ID,Template_ID,Content],(err)=>{
                if(err){
                    console.log(err)
                    reject();
                }else{
                    resolve();
                }
            })
        }else{
            resolve();
        }
    })
}
async function delete_Resource_data(R_ID,L_ID,Template_ID,Content){
    return new Promise((resolve)=>{
        if(Content != 'img_no_change'){
            if(isBase64(Content)){
                unlink(`./public/img/resource/${Template_ID}_${R_ID}_${L_ID}.png`,(err)=>{
                    if(err){
                        console.log('123');
                        console.log(err);
                    }
                })
            }
            db.execute(`DELETE FROM Resource_data WHERE R_ID = ? AND L_ID = ? AND RD_Template_ID = ?`,[R_ID,L_ID,Template_ID],(err)=>{
                if(err){
                    console.log(err)
                }
                resolve();
            })
        }else{
            resolve();
        }        
    })

    
}

async function update_Resource(data){
    let RD_ID1 = await RDNextID('Resource_data','RD_ID','RD');  //給資源名稱的
    let RD_ID2 = addID('RD',RD_ID1)                             //給資源敘述的
    let R_ID = data.R_ID;
    let L_ID = data.L_ID;
    let R_Name = data.R_Name;
    let T_ID = data.T_ID;
    let D_ID = data.D_ID;
    let S_ID = data.S_ID;
    let R_Img = data.R_Img;
    let R_Depiction = data.R_Depiction;

    

    
    await delete_Supplier_binding(R_ID);  //刪除供應商綁定
    if(checkData(S_ID)){
        for(cc = 0;cc<S_ID.length;cc++){
            await create_Supplier_binding(R_ID,S_ID[cc]);
        }  
    } 



    return new Promise((resolve,rejects)=>{
        //資源需求與模板
        db.execute(`UPDATE Resources SET T_ID = ?,D_ID = ?,R_Img = ? WHERE R_ID = ?`,[T_ID,D_ID,R_Img,R_ID],(err)=>{
            if(err){
                console.log(err)
                rejects();
            }
        })
        //資源敘述
        db.execute(`UPDATE Resource_data SET RD_Content = ? WHERE R_ID = ? AND L_ID = ? AND RD_Type = 3`,[R_Depiction,R_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err)
                rejects();
            }else{
                if(results.affectedRows == 0){
                    db.execute(`INSERT INTO Resource_data VALUES(?,?,?,null,3,?);`,[RD_ID2,R_ID,L_ID,R_Depiction],(err)=>{
                        if(err){
                            console.log(err)
                            rejects();
                        }
                    })
                }
            }
        })
        //資源名稱
        db.execute(`UPDATE Resource_data SET RD_Content = ? WHERE R_ID = ? AND L_ID = ? AND RD_Type = 2`,[R_Name,R_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err)
                rejects();
            }else{
                if(results.affectedRows == 0){
                    db.execute(`INSERT INTO Resource_data VALUES(?,?,?,null,2,?);`,[RD_ID1,R_ID,L_ID,R_Name],(err)=>{
                        if(err){
                            console.log(err)
                            rejects();
                        }else{
                            resolve();
                        }
                    })
                }else{
                    resolve();
                }
            }
        })
    })
}
async function delete_Supplier_binding(R_ID){
    return new Promise((resolve)=>{
        db.execute(`DELETE FROM Supplier_binding WHERE R_ID = ?`,[R_ID],(err)=>{
            if(err){
                console.log(err);
            }
            resolve();
        })
    })
}
async function create_Supplier_binding(R_ID,S_ID){
    let SB_ID = await NextID('Supplier_binding','SB_ID','SB');

    new Promise((resolve,reject)=>{
        db.execute(`INSERT INTO Supplier_binding VALUES(?,?,?);`,[SB_ID,R_ID,S_ID],(err)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve();
            }
        })
    })
}
function isBase64(str){
    try {
        if(str.substring(0,10) == 'data:image'){
            return true;
        }else{
            return false;
        }
    } catch (error) {
        return false;
    }
}
function setArray_to_Code(array){
    let str = '';
    let all = false
    

    for(m = 0;m < array.length;m++){
        if(array[m] == 'A0'){
            all = true
            break;
        }
        str += array[m];
    }

    if(all){
        return 'A0';
    }else{
        return str;
    }
}





module.exports = {
    Create_Resource,
    Create_Templare,
    Create_Demand,
    Edit_Demand_name,
    Edit_Templare,
    Edit_Shelf,
    Edit_Resource_data,
    Edit_Resource_Page_data,
    Edit_Resource_search,
    Delete_Demand,
    Delete_Resource,
    Delete_Templare,
    getResource_Page_data,
    getResource_data,
};