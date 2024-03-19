



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
                <td><img onclick="handleChildClick(event),msgbox(2,'即將刪除「${data.Language[i].L_Name}」語言','deleteLanguage(` + '`' + data.Language[i].L_ID + '`' + `)')" src="../../img/backend/bin.png"></td></tr>`
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

function setStatic_edit(data){
    let lang = document.getElementsByClassName('lang')[0]; 
    let static = document.getElementsByClassName('static')[0];   
    let html_area = document.getElementsByClassName('html_area')[0];
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');
    let SP_Name_Bar = document.getElementById('SP_Name_Bar');
    SP_Name_Bar.innerHTML = data.static_page.SP_Name;
    SP_Name_Bar.setAttribute('href','/backend/language/static/edit?SP_ID=' + data.static_page.SP_ID);


    let L_Name_array = [];
    let L_ID_array = [];
    for(i = 0;i < data.leng.length;i++){
        L_Name_array.push(data.leng[i].L_Name);
        L_ID_array.push(data.leng[i].L_ID);
    }
    lang.innerHTML = Select_Option_HTML(data.L_ID,L_Name_array,L_ID_array);
    lang.setAttribute('onchange',`getStatic_data('${data.static_page.SP_ID}',this.value)`);

    let SP_Name_array = [];
    let SP_ID_array = [];
    for(i = 0;i < data.static_list.length;i++){
        SP_Name_array.push(data.static_list[i].SP_Name);
        SP_ID_array.push(data.static_list[i].SP_ID);
    }
    static.innerHTML = Select_Option_HTML(data.static_page.SP_ID,SP_Name_array,SP_ID_array);
    static.setAttribute('onchange',`getStatic_data(this.value,'L000000001')`);

    btn[0].setAttribute('onclick',`saveStatic_data('${data.static_page.SP_ID}')`);


    html_area.innerHTML = `<input type="hidden" name="L_ID" value="${data.L_ID}">`;
    for(i = 0;i< data.container.length;i++){
        let div = document.createElement('div');
        let str = '';

        if(data.container[i].type == 'title'){
            div.setAttribute('class','container2_title');
            str += `
            <div class="item">
                <div class="item_title">${data.container[i].id[0]}(標題)</div>
                <div class="item_label">
                    <span>提示：${data.container[i].note[0]}</span>
                </div>
                <div class="item_content">
                    <input placeholder="請輸入標題" name="${data.container[i].id[0]}" value="${data.container[i].content[0]}">
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
                            <span>提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                            <textarea name="${data.container[i].id[j]}" placeholder="請輸入文字內容">${data.container[i].content[j]}</textarea>
                        </div>
                    </div>                    
                    `;
                }else if(data.container[i].item_type[j] == 'url'){
                    str += `
                    <div class="item">
                        <div class="item_title">${data.container[i].id[j]}(連結)</div>
                        <div class="item_label">
                            <span>提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                            <textarea name="${data.container[i].id[j]}" placeholder="請輸入URL或是網址">${data.container[i].content[j]}</textarea>
                        </div>
                    </div> 
                    `;
                }else if(data.container[i].item_type[j] == 'img'){
                    str += `
                    <div class="item">
                        <div class="item_title">${data.container[i].id[j]}(照片)</div>
                        <div class="item_label">
                            <span>提示：${data.container[i].note[j]}</span>
                        </div>
                        <div class="item_content">
                        <img onclick="click_file_img('${data.container[i].id[j]}')" id="${data.container[i].id[j]}_img" src="${container_img(data.container[i].content[j])}" title="上傳照片" >
                            <input type="file" onchange="setContainer2_img('${data.container[i].id[j]}')" id="${data.container[i].id[j]}_input_file" accept="image/*">
                            <input type="hidden" name="${data.container[i].id[j]}" value="img_no_change">
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
function getStatic_data(SP_ID,L_ID){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msgbox != ''){
                    msgbox(1,jsonResponse.msgbox);
                    setStatic_edit(jsonResponse);
                }else{
                    setStatic_edit(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/language/static/edit/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('SP_ID='+SP_ID + '&L_ID=' + L_ID);
}
function saveStatic_data(SP_ID){
    let form = document.getElementsByClassName('html_area')[0];
    let formData = new FormData(form);
    let formObject = {};
    let id_array = [];

    formData.forEach(function(value, key){
        formObject[key] = value;
        if(key != "L_ID"){
            id_array.push(key);
        }
    });
    formObject.SP_ID = SP_ID;
    formObject.Template_ID = id_array;
    console.log(formObject)

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
                }else if(jsonResponse.msg == 'nodata'){
                    msgbox(1,'查無資源，請嘗試重新整理頁面');
                }else if(jsonResponse.msg == 'err'){
                    msgbox(1,'更新錯誤');
                }else if(jsonResponse.msg == 'success'){
                    msgbox(1,'更新完成');
                }else{
                    msgbox(1,'伺服器無法反應，請稍後再嘗試');
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/language/static/edit/save');
    httpRequest.setRequestHeader('Content-Type','application/json');
    httpRequest.send(JSON.stringify(formObject));
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
        return '../../../img/backend/plus.png';
    }else{
        return '../../../img/resource/' + img_name;
    }
}
function setContainer2_img(RD_ID){
    let file_input = document.getElementById( RD_ID + '_input_file');
    let img = document.getElementById( RD_ID + '_img');
    let hidden_input = document.getElementsByName(RD_ID)[0];


    let reader = new FileReader();
    reader.readAsDataURL(file_input.files[0]);
    reader.onload = (e) =>{
        img.setAttribute('src',e.currentTarget.result);
        hidden_input.setAttribute('value',e.currentTarget.result);
    }
    
}
function click_file_img(RD_ID){
    let img = document.getElementById( RD_ID + '_input_file');
    img.click();
}
function handleChildClick(event) {
    event.stopPropagation();
} 












