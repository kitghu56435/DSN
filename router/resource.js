const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,checkData,NextID,RDNextID,addID} = require('../function');
const moment = require('moment-timezone');



router.use(Administrator_verafication);



router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource.html','utf-8');
    let msgbox = '';
    let all_d = 0; //需求數量
    let all_r = 0; //資源數量
    let all_t = 0; //模板數量
    let data = {
        "Demand" : [],
        "Template" : []
    }
    
    db.execute(`SELECT * FROM Demand WHERE Demand.L_ID = 'L000000001' ORDER BY D_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            all_d = results.length;
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
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.Demand.length;j++){
                    if(results[i].D_ID == data.Demand[j].D_ID){
                        data.Demand[j].D_Resource = results[i].R_Num;
                        all_r += Number(results[i].R_Num);
                    }
                }
            }
        }
    })
    db.execute('SELECT Resources.D_ID,COUNT(R_ID) R_Num FROM Resources WHERE R_Delete = 0 AND R_Shelf = 1 GROUP BY D_ID ORDER BY D_ID;',(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.Demand.length;j++){
                    if(results[i].D_ID == data.Demand[j].D_ID){
                        data.Demand[j].R_On_Shelf = results[i].R_Num;
                        data.Demand[j].R_Down_Shelf = data.Demand[j].D_Resource - results[i].R_Num;
                    }
                }
            }
        }
    })
    db.execute('SELECT * FROM Template;',(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            all_t = results.length;
            for(i = 0;i<results.length;i++){
                data.Template.push({
                    "T_ID" : results[i].T_ID,
                    "T_Name" : results[i].T_Name,
                    "T_Use" : 0,
                });
            }
        }
    })
    db.execute('SELECT Resources.T_ID,COUNT(T_ID) T_Num FROM Resources WHERE R_Delete = 0 GROUP BY T_ID ORDER BY R_ID;',(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.Template.length;j++){
                    if(results[i].T_ID == data.Template[j].T_ID){
                        data.Template[j].T_Use = results[i].T_Num;
                    }
                }
            }
        }

        html += `<script>
            setData_block(0,${all_d});
            setData_block(1,${all_r});
            setData_block(2,${all_t});
            setResource(${JSON.stringify(data)});
            ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)
    })
})


router.get('/demand',(req,res)=>{
    let html = readFileSync('./public/html/back_end/demand.html','utf-8');
    let D_ID = req.query.D_ID;
    let msgbox = '';
    let all_r = 0;      //資源數量
    let On_Shelf = 0;   //總上架數量
    let Down_Shelf = 0; //總下架數量
    let data = {
        "demand" : {
            "D_Name" : "",
            "D_ID" : ""
        },
        "resource" : []
    }
    


    db.execute(`SELECT D_ID,D_Name FROM Demand WHERE D_ID = ?;`,[D_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
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
            msgbox += '資料庫錯誤<br>';
        }else{
            all_r = results.length;
            for(i = 0;i<results.length;i++){
                if(results[i].R_Shelf == 1){
                    On_Shelf++;
                }else{
                    Down_Shelf++;
                }

                data.resource.push({ 
                    "R_ID" : results[i].R_ID, 
                    "R_Name" : results[i].R_Name,
                    "T_Name" : results[i].T_Name,
                    "R_Shelf" : results[i].R_Shelf,
                    "R_Update" : results[i].R_Update
                });
            }
        }

        html += `<script>
        setData_block(0,${all_r});
        setData_block(1,${On_Shelf});
        setData_block(2,${Down_Shelf});
        setDemand(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)
    })

    
    
    
})
router.get('/demand/name_setting',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_setting_d.html','utf-8');
    let D_ID = req.query.D_ID;
    let msg = req.query.data;
    let msgbox = '';
    let data = {
        "D_Name" : "",
        "D_ID" : "",
        "name" :[]
    }


    switch(msg){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }
    


    db.execute(`SELECT D_ID,D_Name FROM Demand WHERE D_ID = ? AND L_ID = 'L000000001';`,[D_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.D_Name = results[0].D_Name;
            data.D_ID = results[0].D_ID;
        }
    })
    db.execute(`SELECT Languages.L_ID,L_Name,D_Name FROM Languages LEFT JOIN (SELECT * FROM Demand WHERE D_ID = ?) Demand  ON Demand.L_ID = Languages.L_ID;`,[D_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.name.push({
                    "L_ID" : results[i].L_ID,
                    "L_Name" : results[i].L_Name,
                    "D_Name" : checkNull(results[i].D_Name)
                })
            }
        }

        html += `<script>
        setDemand_Setting(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)
    })

    
    
    
})
router.post('/demand/name_setting/data',(req,res)=>{
    

    db.execute('SELECT L_ID FROM Languages;',(err,results)=>{
        if(err){
            console.log(err);
            res.writeHead(303,{Location:'/backend/resource/demand/setting?data=err'});
            res.end();
        }else{
            new Promise((resolve,reject)=>{
                resolve(update_Demand(req.body,results));
            }).then(()=>{
                res.writeHead(303,{Location:'/backend/resource/demand?D_ID=' + req.body.D_ID});
                res.end();
            })
        }
    })
})





router.get('/demand/edit',(req,res)=>{
    let R_ID = req.query.R_ID;
    let L_ID = req.query.L_ID;
    let html = readFileSync('./public/html/back_end/edit/resource_edit.html','utf-8');

    if(L_ID == undefined) L_ID = 'L000000001';

    html += `
    <script>
    getResource_data('${R_ID}','${L_ID}');
    </script>`
    res.end(html);
})
router.post('/demand/edit/data',(req,res)=>{
    let R_ID = req.body.R_ID;
    let L_ID = req.body.L_ID;
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


    db.execute(`SELECT Resources.R_ID,R_Shelf,Resources.D_ID,D_Name,T_Path,RD_Content R_Name FROM Resources,Demand,Template,Resource_data
    WHERE Resources.D_ID = Demand.D_ID AND Template.T_ID = Resources.T_ID AND Resources.R_ID = Resource_data.R_ID 
    AND R_Delete = 0 AND Resources.R_ID = ? AND RD_Type = 2 AND Resource_data.L_ID = 'L000000001';`,[R_ID],(err,results)=>{
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

        res.json(data);
    })
})
router.post('/demand/edit/shelf',(req,res)=>{
    let R_ID = req.body.R_ID;
    
    if(checkData(R_ID)){
        db.execute(`SELECT R_Shelf FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{
            if(err){
                res.json({"msg" : "dberr"});
            }else if(results[0].length == 0){
                res.json({"msg" : "nodata"});
            }else{
                db.execute(`UPDATE Resources SET R_Shelf = ? WHERE R_ID = ?`,[!results[0].R_Shelf,R_ID],(err)=>{
                    if(err){
                        res.json({"msg" : "dberr"});
                    }else{
                        res.json({"msg" : "success","shelf" : !results[0].R_Shelf});
                    }
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"});
    }
    
})
router.post('/demand/edit/save',(req,res)=>{
    let R_ID = req.body.R_ID;
    let L_ID = req.body.L_ID;
    
    if(checkData(R_ID) && checkData(L_ID)){
        db.execute(`SELECT L_ID FROM Languages WHERE L_ID = ?;`,[L_ID],(err,results)=>{  //確認是否有此語言續號
            if(err){
                console.log(err);
                res.json({"msg" : "dberr"})
            }else if(results.length == 0){
                res.json({"msg" : "nodata"});
            }else{
                db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{  //確認是否有此資源
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
                    }else if(results.length == 0){
                        res.json({"msg" : "nodata"});
                    }else{
                        new Promise((resolve,reject)=>{
                            resolve(update_Resource_data(req.body));
                        }).then((result)=>{
                            res.json({"msg" : "success"})
                        })
                    }
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"})
    }
})




router.get('/demand/setting',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_setting.html','utf-8');
    let R_ID = req.query.R_ID;
    let L_ID = req.query.L_ID;

    if(L_ID == undefined) L_ID = 'L000000001';

    html += `
    <script>
    getResource('${R_ID}','${L_ID}');
    </script>`
    res.end(html);
})
router.post('/demand/setting/data',(req,res)=>{
    let R_ID = req.body.R_ID;
    let L_ID = req.body.L_ID;
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
        res.json(data)
    })
})
router.post('/demand/setting/save',(req,res)=>{ 
    let R_ID = req.body.R_ID;
    let L_ID = req.body.L_ID;
    let R_Name = req.body.R_Name;
    let R_Img = req.body.R_Img;

    
    if(checkData(R_ID) && checkData(L_ID) && checkData(R_Name) && checkData(R_Img)){
        db.execute(`SELECT L_ID FROM Languages WHERE L_ID = ?;`,[L_ID],(err,results)=>{  //確認是否有此語言續號
            if(err){
                console.log(err);
                res.json({"msg" : "dberr"})
            }else if(results.length == 0){
                res.json({"msg" : "nodata"});
            }else{
                db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ?;`,[R_ID],(err,results)=>{  //確認是否有此資源
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
                    }else if(results.length == 0){
                        res.json({"msg" : "nodata"});
                    }else{
                        new Promise((resolve,reject)=>{
                            resolve(update_Resource(req.body));
                        }).then((result)=>{
                            res.json({"msg" : "success"})
                        })
                    }
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"})
    }
})




router.get('/demand/search',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_search.html','utf-8');
    let R_ID = req.query.R_ID;

   

    html += `
    <script>
    getResource_search('${R_ID}');
    </script>`
    res.end(html);
})
router.post('/demand/search/data',(req,res)=>{
    let R_ID = req.body.R_ID;
    let data = {
        "R_Name" : "",
        "D_Name" : "",
        "D_ID" : "",
        "R_ID" : R_ID,
        "R_Identity" : [],
        "R_School" : [],
        "R_City" : [],
        "msgbox" : ""
    }

    
    db.execute(`SELECT Resources.D_ID,D_Name,R_City,R_School,R_Identity FROM Resources,Demand WHERE Demand.D_ID = Resources.D_ID 
    AND R_Delete = 0 AND Demand.L_ID = 'L000000001' AND Resources.R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤<br>';
        }else{
            data.D_Name = results[0].D_Name;
            data.D_ID = results[0].D_ID;

            data.R_Identity = setCode_to_Array(results[0].R_Identity);
            data.R_School = setCode_to_Array(results[0].R_School);
            data.R_City = setCode_to_Array(results[0].R_City);
        }
    })
    db.execute(`SELECT RD_Content R_Name,RD_Type FROM Resource_data WHERE R_ID = ? AND L_ID = 'L000000001' AND RD_Type = 2;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤<br>';
        }else{
            data.R_Name = results[0].R_Name;
        }

        res.json(data)
    })
})
router.post('/demand/search/save',(req,res)=>{ 
    let R_ID = req.body.R_ID;
    console.log(req.body);
    
    
    db.execute(`SELECT T_ID FROM Resources WHERE R_ID = ? AND R_Delete = 0;`,[R_ID],(err,results)=>{  //確認是否有此資源
        if(err){
            console.log(err);
            res.json({"msg" : "dberr"});
        }else if(results.length == 0){
            res.json({"msg" : "nodata"});
        }else{
            new Promise((resolve,reject)=>{
                resolve(update_Resource_search(req.body));
            }).then((result)=>{
                res.json({"msg" : "success"})
            })
        }
    })            
          
        
    
})




router.get('/demand/feedback',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_feedback.html','utf-8');
    let R_ID = req.query.R_ID;
    let msgbox = '';
    let data = {
        "resource" : {
            "D_Name" : "",
            "D_ID" : "",
            "R_Name" : "",
            "R_ID" : R_ID
        },
        "feedback":[]
    }


    db.execute(`SELECT RD_Content R_Name,Resources.D_ID,D_Name FROM Resources,Demand,Resource_data WHERE Demand.D_ID = Resources.D_ID 
    AND Resources.R_ID = Resource_data.R_ID AND RD_Type = 2 AND Resource_data.L_ID = 'L000000001' AND R_Delete = 0 AND Resources.R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.resource.D_Name = results[0].D_Name;
            data.resource.R_Name = results[0].R_Name;
            data.resource.D_ID = results[0].D_ID;
        }
    })
    db.execute(`SELECT *,DATE_FORMAT(RF_Date,'%Y年%m月%d日 %H:%i:%s') RF_Date_f FROM Resource_feedback WHERE R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.feedback.push({
                    "RF_ID" : results[i].RF_ID,
                    "RF_Content" : results[i].RF_Content,
                    "RF_Date" : results[i].RF_Date_f
                })                
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setResource_feedback(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})
router.get('/demand/supplier',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_supplier.html','utf-8');
    let R_ID = req.query.R_ID;
    let msgbox = '';
    let data = {
        "resource" : {
            "D_Name" : "",
            "D_ID" : "",
            "R_Name" : "",
            "R_ID" : R_ID
        },
        "S_Info" : [],
        "S_Info_p" : []
    }

    db.execute(`SELECT RD_Content R_Name,Resources.D_ID,D_Name FROM Resources,Demand,Resource_data WHERE Demand.D_ID = Resources.D_ID 
    AND Resources.R_ID = Resource_data.R_ID AND RD_Type = 2 AND R_Delete = 0 AND Resources.R_ID = ? 
    AND Resource_data.L_ID = 'L000000001'`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.resource.D_Name = results[0].D_Name;
            data.resource.R_Name = results[0].R_Name;
            data.resource.D_ID = results[0].D_ID;
        }
    })
    db.execute(`SELECT Supplier.* FROM Supplier,Supplier_binding WHERE Supplier.S_ID = Supplier_binding.S_ID AND Supplier_binding.R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.S_Info.push({
                    "S_Name" : results[i].S_Name,
                    "S_Phone" : results[i].S_Phone,
                    "S_Web" : results[i].S_Web,
                    "S_Remark" : results[i].S_Remark,
                })
                data.S_Info_p.push({
                    "S_Name" : results[i].S_Name,
                    "S_Manager" : results[i].S_Manager,
                    "S_Manager_phone" : results[i].S_Manager_phone,
                })
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setResource_supplier(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})
router.post('/demand/delete',(req,res)=>{
    let D_ID = req.body.D_ID;
    let data = {
        "all_d" : 0,   //需求數量
        "all_r" : 0,   //資源數量
        "msg" : "success",
        "Demand" : [],
    }

    if(checkData(D_ID)){
        db.execute(`SELECT COUNT(R_ID) R_Count FROM Resources WHERE R_Delete = 0 AND D_ID = ?;`,[D_ID],(err,results)=>{
            if(err){
                res.json({"msg" : "dberr"});
                console.log(err);
            }else if(results[0].R_Count != 0){
                res.json({"msg" : "deleteerr"});
            }else{
                db.execute(`DELETE FROM Demand WHERE D_ID = ?;`,[D_ID],(err)=>{
                    if(err){
                        res.json({"msg" : "dberr"});
                        console.log(err);
                    }else{
                        db.execute(`SELECT * FROM Demand WHERE L_ID = 'L000000001' ORDER BY D_ID;`,(err,results)=>{
                            if(err){
                                console.log(err);
                                res.json({"msg" : "dberr"});
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
                                res.json({"msg" : "dberr"});
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
                                console.log(err);
                                res.json({"msg" : "dberr"});
                            }else{
                                for(i = 0;i<results.length;i++){
                                    for(j = 0;j<data.Demand.length;j++){
                                        if(results[i].D_ID == data.Demand[j].D_ID){
                                            data.Demand[j].R_On_Shelf = results[i].R_Num;
                                            data.Demand[j].R_Down_Shelf = data.Demand[j].D_Resource - results[i].R_Num;
                                        }
                                    }
                                }
        
                                res.json(data);
                            }
                        })
                    }
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"});
    }
    
})
router.post('/delete',(req,res)=>{
    let R_ID = req.body.R_ID;
    let D_ID = req.body.D_ID;
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
    

    if(checkData(R_ID)){
        db.execute(`UPDATE Resources SET R_Delete = 1 WHERE R_ID = ? AND R_Delete = 0`,[R_ID],(err)=>{
            if(err){
                res.json({"msg" : "dberr"});
                console.log(err);
            }else{
                db.execute(`SELECT D_ID,D_Name FROM Demand WHERE L_ID = 'L000000001' AND D_ID = ?;`,[D_ID],(err,results)=>{
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
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
                        res.json({"msg" : "dberr"});
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
                        res.json(data);
                    }
            
                    
                    
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"});
    }
    
})



router.get('/add_r',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_r.html','utf-8');
    let msg = req.query.data;
    let msgbox = '';
    let data = {
        "template" : [],
        "demand" :[],
        "supplier" :[]
    }
    
    switch(msg){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }
    
    
    db.execute(`SELECT * FROM Template;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.template.push({
                    "T_Name" : results[i].T_Name,
                    "T_ID" : results[i].T_ID,
                })
            }
        }
    })
    db.execute(`SELECT * FROM Demand WHERE L_ID = 'L000000001';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.demand.push({
                    "D_Name" : results[i].D_Name,
                    "D_ID" : results[i].D_ID,
                })
            }
        }
    })
    db.execute(`SELECT * FROM Supplier;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.supplier.push({
                    "S_Name" : results[i].S_Name,
                    "S_ID" : results[i].S_ID,
                })
            }
        }



        html += `<script>
        ${setMsgbox(msgbox)}
        setResource_Add_r(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
    
    
    
})
router.post('/add_r/data',(req,res)=>{
    if(checkData(req.body.R_Name) && checkData(req.body.T_ID) && checkData(req.body.D_ID)  && checkData(req.body.R_Img) && checkData(req.body.R_Depiction)){
        new Promise((resolve,reject)=>{
            resolve(create_Resource(req.body));
        }).then(()=>{
            res.writeHead(303,{Location:'/backend/resource/demand?D_ID=' + req.body.D_ID});
            res.end();
        }).catch(()=>{
            res.writeHead(303,{Location:'/backend/resource/add_r?data=create_err'});
            res.end();
        })
    }else{
        res.writeHead(303,{Location:'/backend/resource/add_r?data=err'});
        res.end();
    }
})


router.get('/add_t',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_t.html','utf-8');
    let data = req.query.data;
    let msgbox = '';
    switch(data){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }
    
    html += `<script>
    ${setMsgbox(msgbox)}
    </script>
    `;
    res.end(html)
})
router.post('/add_t/data',(req,res)=>{
    if(checkData(req.body.T_Name) && checkData(req.body.T_base64)){
        new Promise((resolve,reject)=>{
            resolve(create_Template(req.body));
        }).then(()=>{
            res.writeHead(303,{Location:'/backend/resource/template'});
            res.end();
        }).catch(()=>{
            res.writeHead(303,{Location:'/backend/resource/add_t?data=create_err'});
            res.end();
        })
    }else{
        res.writeHead(303,{Location:'/backend/resource/add_t?data=err'});
        res.end();
    }
})


router.get('/add_d',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_d.html','utf-8');
    let data = req.query.data;
    let msgbox = '';
    switch(data){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }
    
    html += `<script>
    ${setMsgbox(msgbox)}
    </script>
    `;
    res.end(html)
})
router.post('/add_d/data',(req,res)=>{
    let D_Name = req.body.D_Name;
    if(checkData(D_Name)){
        new Promise((resolve,reject)=>{
            resolve(create_Demand(D_Name));
        }).then(()=>{
            res.writeHead(303,{Location:'/backend/resource/'});
            res.end();
        }).catch(()=>{
            res.writeHead(303,{Location:'/backend/resource/add_d?data=create_err'});
            res.end();
        })
    }else{
        res.writeHead(303,{Location:'/backend/resource/add_d?data=err'});
        res.end();
    }
})



router.get('/template',(req,res)=>{
    let html = readFileSync('./public/html/back_end/template.html','utf-8');
    let msgbox = '';
    let all_t = 0;      //模板數量
    let data = {
        "template" : []
    }
    

    db.execute(`
    SELECT Template.*,Resources.R_Name FROM Template LEFT JOIN (SELECT RD_Content R_Name,T_ID FROM Resources,Resource_data 
    WHERE Resources.R_ID = Resource_data.R_ID AND R_Delete = 0 AND RD_Type = 2 
    AND Resource_data.L_ID = 'L000000001') Resources ON Template.T_ID = Resources.T_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            if(results.length != 0){
                let now_template = results[0].T_ID;
                all_t = 1;       //模板總數

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
                        all_t += 1; 
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

        html += `<script>
        setData_block(0,${all_t});
        setTemplate(${JSON.stringify(data)});
        ${setMsgbox(msgbox)}
        </script>
        `;
        res.end(html)
    })

    
    
    
})
router.get('/template/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/template_edit.html','utf-8');
    let T_ID = req.query.T_ID;
    let T_Path = '';
    let msgbox = '';
    let data = {
        "template": {
            "T_ID" : T_ID,
            "T_Name" : ""
        },
        "all_label" : 0,
        "text_label" : 0,
        "img_label" : 0,
        "url_label" : 0,
        "container" : []
    }


    db.execute(`SELECT T_Path,T_Name FROM Template WHERE T_ID = ?;`,[T_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.template.T_Name = results[0].T_Name;
            T_Path = results[0].T_Path;
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
    
    
    
    
    
                
                for(j = 0;j<data.container.length;j++){
                    for(k = 0;k<data.container[j].item;k++){
                        data.all_label += 1;
                        switch(data.container[j].item_type[k]){
                            case 'text' : data.text_label += 1; break;
                            case 'img' : data.img_label += 1; break;
                            case 'url' : data.url_label += 1; break;
                        }
                        
                    }
                }    
                          
            }catch(e){
                console.log(e)
                msgbox += '模板讀取錯誤<br>';
            }
        }
        html += `<script>
        ${setMsgbox(msgbox)}
        setTemplate_edit(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})




router.get('/template/setting',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/template_setting.html','utf-8');
    let T_ID = req.query.T_ID;
    let msgbox = '';
    let data = {
        "T_ID" : T_ID,
        "T_Name" : ""
    }
    
    db.execute(`SELECT T_Name FROM Template WHERE T_ID = ?;`,[T_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.T_Name = results[0].T_Name;
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setTemplate_setting(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})
router.get('/template/use',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/template_r.html','utf-8');
    let T_ID = req.query.T_ID;
    let all_t = 0;
    let msgbox = '';
    let data = {
        "template": {
            "T_ID" : T_ID,
            "T_Name" : ""
        },
        "resource" : []
    }
    
    db.execute(`SELECT T_Name FROM Template WHERE T_ID = ?;`,[T_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.template.T_Name = results[0].T_Name;
        }
    })
    db.execute(`SELECT Resources.R_ID,RD_Content R_Name,D_Name FROM Template,Resources,Demand,Resource_data WHERE Template.T_ID = Resources.T_ID 
    AND Resources.R_ID = Resource_data.R_ID AND Demand.D_ID = Resources.D_ID AND RD_Type = 2 AND R_Delete = 0 
    AND Resource_data.L_ID = 'L000000001' AND Template.T_ID = ?;`,[T_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.resource.push({
                    "R_ID" : results[i].R_ID,
                    "R_Name" : results[i].R_Name,
                    "D_Name" : results[i].D_Name,
                })
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setTemplate_r(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})
router.post('/template/delete',(req,res)=>{
    let T_ID = req.body.T_ID;
    let T_Number = Number(T_ID.substring(1));
    let data = {
        "msg" : "success",
        "all_t" : 0,        //模板數量
        "template" : []
    }
    

    if(checkData(T_ID)){
        db.execute(`SELECT COUNT(*) T_Count FROM Resources WHERE R_Delete = 0 AND T_ID = ?;`,[T_ID],(err,results)=>{
            if(err){
                res.json({"msg" : "dberr"});
                console.log(err);
            }else if(results[0].T_Count != 0){  //還有資源再使用
                res.json({"msg" : "rerr"});
            }else{
                unlink(`./public/html/template/T${T_Number}.html`,(err)=>{
                    if(err){
                        console.log(err);
                    }
                })
                db.execute(`DELETE FROM Template WHERE T_ID = ?;`,[T_ID],(err)=>{
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
                    }
                })
                db.execute(`SELECT Template.*,Resources.R_Name FROM Template LEFT JOIN (SELECT RD_Content R_Name,T_ID FROM Resources,Resource_data 
                    WHERE Resources.R_ID = Resource_data.R_ID AND R_Delete = 0 AND RD_Type = 2 
                    AND Resource_data.L_ID = 'L000000001') Resources ON Template.T_ID = Resources.T_ID;`,(err,results)=>{
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
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
            
                    res.json(data);
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"});
    }
})










async function create_Demand(D_Name,L_ID,D_ID){
    if(D_ID == undefined){
        D_ID = await NextID('Demand','D_ID','D');
    } 
    if(L_ID == undefined) L_ID = 'L000000001';

    return new Promise((resolve,reject)=>{
        db.execute(`INSERT INTO Demand VALUES(?,?,?);`,[D_ID,L_ID,D_Name],(err)=>{
            if(err){
                console.log(err)
                reject();
            }else{
                resolve();
            }
        })
    })
}
async function update_Demand(data,Array){
    let D_ID = data.D_ID;

    for(x = 0;x<Array.length;x++){
        await update_Demand_data(D_ID,Array[x].L_ID,data[Array[x].L_ID]);
    }

    return new Promise((resolve)=>{
        resolve();
    })
}
async function update_Demand_data(D_ID,L_ID,D_Name){
    

    return new Promise((resolve)=>{
        db.execute(`UPDATE Demand SET D_Name = ? WHERE D_ID = ? AND L_ID = ?`,[D_Name,D_ID,L_ID],(err,results)=>{
            if(err){
                console.log(err);
            }else{
                if(results.affectedRows == 0){
                    create_Demand(D_Name,L_ID,D_ID);
                }
                resolve();
            }
        })
    })
}
async function create_Template(data){
    let T_ID = await NextID('Template','T_ID','T');
    let T_Number = Number(T_ID.substring(1));
    
    return new Promise((resolve,reject)=>{
        db.execute(`INSERT INTO Template VALUES(?,?,'T${T_Number}.html');`,[T_ID,data.T_Name],(err)=>{
            if(err){
                console.log(err)
                reject();
            }

        })
        let base64Data = data.T_base64.replace(/^data:text\/\html+;base64,/, "");
        let new_file = __dirname + `/../public/html/template/T${T_Number}.html`;
        var dataBuffer = Buffer.from(base64Data, 'base64');
        writeFile(new_file, dataBuffer, function(err) {
            if(err){
                reject();
                console.log(err)
            }else{
                resolve();
            }
        }); 
    })
}
async function create_Resource(data){
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
        db.execute(`INSERT INTO Resources VALUES(?,?,?,1,?,?,?,null,null,null,0);`,
        [R_ID,D_ID,T_ID,R_Date,R_Date,R_Img],(err)=>{
            if(err){
                console.log(err)
                reject();
            }else{
                db.execute(`INSERT INTO Resource_data VALUES(?,?,'L000000001',null,2,?);`,
                [RD_ID1,R_ID,R_Name],(err)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }
                })
                db.execute(`INSERT INTO Resource_data VALUES(?,?,'L000000001',null,3,?);`,
                [RD_ID2,R_ID,R_Depiction],(err)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        resolve();
                    }
                })
            }
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
async function update_Resource_data(data){
    let R_ID = data.R_ID;
    let L_ID = data.L_ID;

    for(x = 0;x<data.Template_ID.length;x++){
        await create_Resource_data(R_ID,L_ID,data.Template_ID[x],data[data.Template_ID[x]]);
    }

    return new Promise((resolve)=>{
        resolve();
    })
}
async function create_Resource_data(R_ID,L_ID,Template_ID,Content){
    let RD_ID = await RDNextID('Resource_data','RD_ID','RD');

    await delete_Resource_data(R_ID,L_ID,Template_ID,Content);  //先刪除原來的資料

    return new Promise((resolve,reject)=>{
        if(Content != 'img_no_change'){
            if(isBase64(Content)){  //是照片
                let img_name = Template_ID + '_' + R_ID + '_' + L_ID + '.png';
                let base64Data = Content.replace(/^data:image\/\w+;base64,/, "");
                let new_file = __dirname + `../../public/img/resource/${img_name}`;
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
        for(c = 0;c<S_ID.length;c++){
            await create_Supplier_binding(R_ID,S_ID[c]);
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
async function update_Resource_search(data){
    let R_ID = data.R_ID;
    let R_Identity_code = setArray_to_Code(data.R_Identity);
    let R_School_code = setArray_to_Code(data.R_School);
    let R_City_code = setArray_to_Code(data.R_City);




    return new Promise((resolve,rejects)=>{
        //資源需求與模板
        db.execute(`UPDATE Resources SET R_Identity = ?,R_School = ?,R_City = ? WHERE R_ID = ?`,[R_Identity_code,R_School_code,R_City_code,R_ID],(err)=>{
            if(err){
                console.log(err)
                rejects();
            }else{
                resolve()
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






function setCode_to_Array(code){
    let str = '';
    let array = [];

    if(code == undefined || code == null || code == 'null'){
        return '';
    }else{
        for(m = 0;m < code.length;m++){
            str += code[m];
            if(m%2 == 1){
                array.push(str);
                str = '';
            }
        }

        return array;
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
function T_Use(str){
    if(str == 'null' || str == null){
        return 0;
    }else{
        return 1;
    }
}
function checkNull(value){
    if(value == 'null' || value == null){
        return '';
    }else{
        return value;
    }
}





module.exports = router;