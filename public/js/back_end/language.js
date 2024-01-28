



function setLanguage(data){
    let d_table_div = document.getElementsByClassName('d_table')[0];
    let d_table = d_table_div.getElementsByTagName('table')[0];
    let t_table_div = document.getElementsByClassName('t_table')[0];
    let t_table = t_table_div.getElementsByTagName('table')[0];
    let str = '';

    if(data == undefined){
        d_table.innerHTML = `
        <tr><th>語言名稱</th><th>套用數量</th><th>建立時間</th><th>刪除</th></tr>
        <tr><td colspan="4">無資料</td></tr>`;
        t_table.innerHTML = `
        <tr><th>網頁名稱</th><th>套用語言</th></tr>
        <tr><td colspan="2">無資料</td></tr>`;
    }else{
        if(data.Language.length == 0){
            d_table.innerHTML = `
            <tr><th>語言名稱</th><th>套用數量</th><th>建立時間</th><th>刪除</th></tr>
            <tr><td colspan="4">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>語言名稱</th><th>套用數量</th><th>建立時間</th><th>刪除</th></tr>`;
            for(i = 0;i<data.Language.length;i++){
                str += `<tr><td>${data.Language[i].L_Name}</td><td>${data.Language[i].L_Use}</td><td>${data.Language[i].L_Date}</td>
                <td><img onclick="handleChildClick(event),msgbox(2,'即將刪除「${data.Language[i].L_Name}」語言','deleteLanguage(` + '`' + data.Language[i].L_ID + '`' + `)')" src="../../img/bin.png"></td></tr>`
            }
            d_table.innerHTML = str;
        }


        if(data.Static.length == 0){
            t_table.innerHTML = `
            <tr><th>網頁名稱</th><th>套用語言</th></tr>
            <tr><td colspan="2">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>網頁名稱</th><th>套用語言</th></tr>`;
            for(i = 0;i<data.Static.length;i++){
                str += `
                <tr onclick="url('/backend/language/static/edit?SP_ID=${data.Static[i].SP_ID}')"><td>${data.Static[i].Static_Name}</td><td>
                    <select onclick="handleChildClick(event)">
                        ${Select_Option_HTML('',data.Static[i].Static_Use,data.Static[i].Static_Use)}
                    </select>
                </td></tr>
                `
            }
            t_table.innerHTML = str;
        }
        
    }
}


function deleteLanguage(L_ID){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                msgbox(); //先刪除目前視窗
                if(jsonResponse.msg == 'dberr'){
                    msgbox(1,'伺服器錯誤');
                }else if(jsonResponse.msg == 'dataerr'){
                    msgbox(1,'資料缺失');
                }else if(jsonResponse.msg == 'rerr'){
                    msgbox(1,'此語言還有資源資料在使用，無法刪除');
                }else if(jsonResponse.msg == 'success'){
                    setData_block(0,jsonResponse.all_l);
                    setLanguage(jsonResponse);
                }else{
                    msgbox(1,'伺服器無回應，請稍後再嘗試');
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/language/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('L_ID='+ L_ID);
}

function setLanguage_edit(data){
    let lang = document.getElementsByClassName('lang')[0]; 
    let static = document.getElementsByClassName('static')[0];   
    let html_area = document.getElementsByClassName('html_area')[0];
    let SP_Name_Bar = document.getElementById('SP_Name_Bar');
    SP_Name_Bar.innerHTML = data.static_page.SP_Name;
    SP_Name_Bar.setAttribute('href','/backend/language/static/edit?SP_ID=' + data.static_page.SP_ID);


    let L_Name_array = [];
    let L_ID_array = [];
    for(i = 0;i < data.leng.length;i++){
        L_Name_array.push(data.leng[i].L_Name);
        L_ID_array.push(data.leng[i].L_ID);
    }
    lang.innerHTML = Select_Option_HTML('',L_Name_array,L_ID_array);

    let SP_Name_array = [];
    let SP_ID_array = [];
    for(i = 0;i < data.static_list.length;i++){
        SP_Name_array.push(data.static_list[i].SP_Name);
        SP_ID_array.push(data.static_list[i].SP_ID);
    }
    static.innerHTML = Select_Option_HTML('',SP_Name_array,SP_ID_array);

    html_area.innerHTML = '';
    for(i = 0;i< data.container.length;i++){
        let div = document.createElement('div');
        let str = '';

        if(data.container[i].type == 'title'){
            div.setAttribute('class','container2_title');
            str += `
            <div class="item">
                <div class="item_title">${data.container[i].id[0]}(標題)</div>
                <div class="item_label">
                    <span>項目提示：${data.container[i].note[0]}</span>
                </div>
                <div class="item_content">
                    <input placeholder="請輸入標題" value="${data.container[i].content[0]}">
                </div>
            </div>
            `;
        }else{
            div.setAttribute('class','container2');
            

            for(j = 0;j < data.container[i].item;j++){
                
                if(data.container[i].item_type[j] == 'text'){
                    str += `
                    <div class="item">
                        <div class="item_title">${data.container[i].id[j]}(文字)</div>
                        <div class="item_label">
                            <span>項目提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                            <textarea placeholder="請輸入文字內容">${data.container[i].content[j]}</textarea>
                        </div>
                    </div>                    
                    `;
                }else if(data.container[i].item_type[j] == 'url'){
                    str += `
                    <div class="item">
                        <div class="item_title">${data.container[i].id[j]}(連結)</div>
                        <div class="item_label">
                            <span>項目提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                            <textarea placeholder="請輸入URL或是網址">${data.container[i].content[j]}</textarea>
                        </div>
                    </div> 
                    `;
                }else if(data.container[i].item_type[j] == 'img'){
                    str += `
                    <div class="item">
                        <div class="item_title">${data.container[i].id[j]}(照片)</div>
                        <div class="item_label">
                            <span>項目提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                            <img src="${container_img(data.container[i].content[j])}" title="上傳照片">
                        </div>
                    </div>                    
                    `;
                }
            }

            
        }

        div.innerHTML = str;
        html_area.appendChild(div);
    }
}


function setStatic(data){
    let r_table_div = document.getElementsByClassName('r_table')[0];
    let r_table = r_table_div.getElementsByTagName('table')[0];
    let str = '';

    if(data == undefined){
        r_table.innerHTML = `
        <tr><th>頁面名稱</th><th>套用語言</th><th>檔案名稱</th></tr>
        <tr><td colspan="3">無資料</td></tr>`;
    }else{
        if(data.Static.length == 0){
            r_table.innerHTML = `
            <tr><th>頁面名稱</th><th>套用語言</th><th>檔案名稱</th></tr>
            <tr><td colspan="3">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>頁面名稱</th><th>套用語言</th><th>檔案名稱</th></tr>`;
            for(i = 0;i<data.Static.length;i++){
                str += `
                <tr onclick="url('/backend/language/static/edit?SP_ID=${data.Static[i].SP_ID}')"><td>${data.Static[i].Static_Name}</td><td>
                    <select onclick="handleChildClick(event)">
                        ${Select_Option_HTML('',data.Static[i].Static_Use,data.Static[i].Static_Use)}
                    </select>
                </td><td>${data.Static[i].SP_File}</td></tr>
                `
            }
            r_table.innerHTML = str;
        }
        
    }
}



function Select_Option_HTML(value,value_array,id_array){
    str = '';
    for(c = 0;c<value_array.length;c++){
        if(id_array[c] == value){
            str += `<option selected value="${id_array[c]}">${value_array[c]}</option>`;
        }else{
            str += `<option value="${id_array[c]}">${value_array[c]}</option>`;
        }
    }
    
    return str;
}
function container_img(img_name){
    if(img_name == ''){
        return '../../../img/plus.png';
    }else{
        return '../../../img/' + img_name;
    }
}
function handleChildClick(event) {
    event.stopPropagation();
} 












