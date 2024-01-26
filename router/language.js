const express = require('express');
const router = express.Router();
const {readFileSync,readFile} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox} = require('../function');


router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/language.html','utf-8');
    let msgbox = '';
    let all_l = 0; //語言數量
    let all_s = 0; //靜態數量
    let data = {
        "Language":[],
        "Static":[]
    }
    
    db.execute(`SELECT Languages.L_ID,L_Name,(COUNT(Languages.L_ID)-1) L_Use,DATE_FORMAT(L_Date,'%Y年%m月%d日 %H:%i:%s') L_Date_f FROM Languages 
    LEFT JOIN Resource_data ON Resource_data.L_ID = Languages.L_ID GROUP BY Languages.L_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            all_l = results.length;
            for(i = 0;i<results.length;i++){
                data.Language.push({
                    "L_ID" : results[i].L_ID,
                    "L_Name" : results[i].L_Name,
                    "L_Use" : results[i].L_Use,
                    "L_Date" : results[i].L_Date_f
                });
            }
        }
    })
    db.execute(`SELECT SP_ID,SP_Name,L_Name,Languages.L_ID,COUNT(L_Name) L_Name_Count FROM Static_page LEFT JOIN Resource_data 
    ON Static_page.SP_ID = Resource_data.R_ID LEFT JOIN Languages ON Resource_data.L_ID = Languages.L_ID 
    GROUP BY Languages.L_ID,SP_ID  ORDER BY Languages.L_ID,SP_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            if(results.length != 0){
                let now_sp = results[0].SP_ID;
                all_s = 1;

                data.Static.push({
                    "SP_ID" : results[0].SP_ID,
                    "Static_Name" : results[0].SP_Name,
                    "Static_Use" : [results[0].L_Name],
                })

                for(i = 1;i<results.length;i++){
                    if(results[i].SP_ID != now_sp){
                        now_sp = results[i].SP_ID;
                        all_s += 1; 
                        data.Static.push({
                            "SP_ID" : results[i].SP_ID,
                            "Static_Name" : results[i].SP_Name,
                            "Static_Use" : [results[i].L_Name],
                        })
                    }else{
                        data.Static[data.Static.length-1].Static_Use.push(results[i].L_Name);
                    }
                }
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${all_l});
        setData_block(1,${all_s});
        setLanguage(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
    
})



router.get('/add',(req,res)=>{
    let html = readFileSync('./public/html/back_end/language_add.html','utf-8');
    res.end(html)
})


router.get('/static',(req,res)=>{
    let html = readFileSync('./public/html/back_end/static.html','utf-8');
    let all_s = 0;
    let msgbox = '';
    let data = {  
        "Static":[]
    }


    db.execute(`SELECT SP_ID,SP_Name,SP_File,L_Name,Languages.L_ID,COUNT(L_Name) L_Name_Count FROM Static_page LEFT JOIN Resource_data 
    ON Static_page.SP_ID = Resource_data.R_ID LEFT JOIN Languages ON Resource_data.L_ID = Languages.L_ID 
    GROUP BY Languages.L_ID,SP_ID  ORDER BY Languages.L_ID,SP_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            if(results.length != 0){
                let now_sp = results[0].SP_ID;
                all_s = 1;

                data.Static.push({
                    "SP_ID" : results[0].SP_ID,
                    "Static_Name" : results[0].SP_Name,
                    "SP_File" : results[0].SP_File,
                    "Static_Use" : [results[0].L_Name],
                })

                for(i = 1;i<results.length;i++){
                    if(results[i].SP_ID != now_sp){
                        now_sp = results[i].SP_ID;
                        all_s += 1; 
                        data.Static.push({
                            "SP_ID" : results[i].SP_ID,
                            "Static_Name" : results[i].SP_Name,
                            "SP_File" : results[i].SP_File,
                            "Static_Use" : [results[i].L_Name],
                        })
                    }else{
                        data.Static[data.Static.length-1].Static_Use.push(results[i].L_Name);
                    }
                }
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${all_s});
        setStatic(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})

//這邊繼續
router.get('/static/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/language_edit.html','utf-8');

    let SP_ID = req.query.SP_ID;
    let SP_File = '';
    let msgbox = '';
    let data = {
        "static_page" : {
            "SP_Name" : "",
            "SP_ID" : SP_ID,
        },
        "leng" : [],
        "static_list" : [],
        "container" : []
    }


    db.execute(`SELECT * FROM Static_page WHERE SP_ID = ?;`,[SP_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            SP_File = results[0].SP_File;
            data.static_page.SP_Name = results[0].SP_Name;
            data.static_page.SP_ID = results[0].SP_ID;
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
    db.execute(`SELECT SP_ID,SP_Name FROM Static_page;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.static_list.push({
                    "SP_Name" : results[i].SP_Name,
                    "SP_ID" : results[i].SP_ID,
                })
            }
            try{
                let static_page_html = readFileSync('./public/html/' + SP_File,'utf-8');
                let content = static_page_html;
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
    
                if(container2_bool){
                    for(j = 0;j<data.container.length;j++){
                        for(k = 0;k<data.container[j].item;k++){
                            if(data.container[j].id[k] == ''){
                                data.container[j].id[k] = '系統ID讀取錯誤';
                            }
                        }
                    }  
                }else{
                    msgbox += `${data.static_page.SP_Name}(${SP_ID})無模板特徵<br>`;
                }
                           
            }catch(e){
                console.log(e)
                msgbox += '模板讀取錯誤<br>';
            }
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setLanguage_edit(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})






module.exports = router;