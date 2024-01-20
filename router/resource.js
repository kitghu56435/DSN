const express = require('express');
const router = express.Router();
const {readFileSync,readFile} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,find_Count} = require('../function');


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
    
    db.execute('SELECT * FROM Demand ORDER BY D_ID;',(err,results)=>{
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
    db.execute(`SELECT R_ID,R_Name,T_Name,R_Shelf,DATE_FORMAT(R_Update,'%Y年%m月%d日 %H:%i:%s') R_Update FROM Resources,Template WHERE Resources.T_ID = Template.T_ID AND D_ID = ?;`,[D_ID],(err,results)=>{
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


router.get('/demand/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_edit.html','utf-8');
    let R_ID = req.query.R_ID;
    let T_Path = '';
    let msgbox = '';
    let data = {
        "resource" : {
            "D_Name" : "",
            "D_ID" : "",
            "R_Name" : "",
            "R_ID" : ""
        },
        "leng" : [],
        "container" : []
    }


    db.execute(`SELECT R_ID,R_Name,Resources.D_ID,D_Name,T_Path FROM Resources,Demand,Template 
    WHERE Resources.D_ID = Demand.D_ID AND Template.T_ID = Resources.T_ID AND R_Delete = 0 AND R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            T_Path = results[0].T_Path;
            data.resource.D_Name = results[0].D_Name;
            data.resource.D_ID = results[0].D_ID;
            data.resource.R_Name = results[0].R_Name;
            data.resource.R_ID = results[0].R_ID;
        }
    })
    db.execute(`SELECT L_ID,L_Name FROM Languages;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.leng.push({
                    "L_Name" : results[i].L_Name,
                    "L_ID" : results[i].L_ID,
                })
            }
        }
    })
    db.execute(`SELECT * FROM Resource_data WHERE R_ID = ? AND L_ID = 'L000000001';`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            try{
                let template_html = readFileSync('./public/html/template/' + T_Path,'utf-8');
                let content = template_html;
                let container2 = '"container2"';   //container標籤
                let container2_bool = false;
                let count = 0;
                let label_state = '';
    
                let dnsid = '';
                let dsnnote = '';
                let title_str = '"container2-title"';
                let title_count = 0;   //計數
                let img_str = '"container2-img"';
                let img_count = 0;     //計數
                let text_str = '"container2-text"';
                let text_count = 0;    //計數
                let url_str = '"container2-url"';
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
                msgbox += '模板讀取錯誤<br>';
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setResource_edit(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })

})


router.get('/demand/setting',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/resource_setting.html','utf-8');
    let R_ID = req.query.R_ID;
    let msgbox = '';
    let data = {
        "leng" : [],
        "R_ID" : R_ID,
        "R_Name" : "",
        "T_ID" : "",
        "D_Name" : "",
        "D_ID" : "",
        "T_List" : [],
        "D_List" : [],
        "S_List" : []
    }


    db.execute(`SELECT R_Name,Resources.D_ID,D_Name,T_ID FROM Resources,Demand WHERE Demand.D_ID = Resources.D_ID AND R_Delete = 0 AND R_ID = ?;`,[R_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.D_Name = results[0].D_Name;
            data.R_Name = results[0].R_Name;
            data.T_ID = results[0].T_ID;
            data.D_ID = results[0].D_ID;
        }
    })
    db.execute(`SELECT L_ID,L_Name FROM Languages;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
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
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.T_List.push({
                    "T_Name" : results[i].T_Name,
                    "T_ID" : results[i].T_ID,
                })
            }
        }
    })
    db.execute(`SELECT * FROM Demand;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
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
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                if(results[i].SB_ID != null && results[i].SB_ID != 'null'){
                    data.S_List.push({
                        "S_Name" : results[i].S_Name,
                        "S_ID" : results[i].S_ID,
                        "S_Check" : true
                    })
                }else{
                    data.S_List.push({
                        "S_Name" : results[i].S_Name,
                        "S_ID" : results[i].S_ID,
                        "S_Check" : false
                    })
                }
                
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setResource_setting(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
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


    db.execute(`SELECT R_Name,Resources.D_ID,D_Name FROM Resources,Demand WHERE Demand.D_ID = Resources.D_ID AND R_Delete = 0 AND R_ID = ?;`,[R_ID],(err,results)=>{
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

    db.execute(`SELECT R_Name,Resources.D_ID,D_Name FROM Resources,Demand WHERE Demand.D_ID = Resources.D_ID AND R_Delete = 0 AND R_ID = ?;`,[R_ID],(err,results)=>{
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


router.get('/add_r',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_r.html','utf-8');
    let msgbox = '';
    let data = {
        "template" : [],
        "demand" :[],
        "supplier" :[]
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
    db.execute(`SELECT * FROM Demand;`,(err,results)=>{
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


router.get('/add_t',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_t.html','utf-8');

    
    res.end(html);
})


router.get('/add_d',(req,res)=>{
    let html = readFileSync('./public/html/back_end/resource_add_d.html','utf-8');

    
    res.end(html);
})



router.get('/template',(req,res)=>{
    let html = readFileSync('./public/html/back_end/template.html','utf-8');
    let msgbox = '';
    let all_t = 0;      //模板數量
    let data = {
        "template" : []
    }
    

    db.execute(`SELECT Template.*,Resources.R_Name FROM Template LEFT JOIN Resources ON Template.T_ID = Resources.T_ID;`,(err,results)=>{
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
                let container2 = '"container2"';   //container標籤
                let container2_bool = false;
                let count = 0;
                let label_state = '';
    
                let dnsid = '';
                let dsnnote = '';
                let title_str = '"container2-title"';
                let title_count = 0;   //計數
                let img_str = '"container2-img"';
                let img_count = 0;     //計數
                let text_str = '"container2-text"';
                let text_count = 0;    //計數
                let url_str = '"container2-url"';
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
    db.execute(`SELECT Resources.R_ID,R_Name,D_Name FROM Template,Resources,Demand WHERE Template.T_ID = Resources.T_ID 
    AND Demand.D_ID = Resources.D_ID AND Template.T_ID = ?;`,[T_ID],(err,results)=>{
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
        ${setMsgbox(msgbox)}
        setTemplate_r(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})










function T_Use(str){
    if(str == 'null' || str == null){
        return 0;
    }else{
        return 1;
    }
}





module.exports = router;