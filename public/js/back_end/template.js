


function setTemplate(data){
    let t_table_div = document.getElementsByClassName('t_table')[0];
    let t_table = t_table_div.getElementsByTagName('table')[0];
    let R_value_array = []
    let str = '';

    if(data == undefined){
        t_table.innerHTML = `
        <tr><th style="width:20%">模板名稱</th><th style="width:15%">套用數量</th><th style="width:15%">模板下載</th><th style="width:30%">使用資源</th><th style="width:20%">刪除</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
    }else{
        if(data.template.length == 0){
            t_table.innerHTML = `
            <tr><th style="width:20%">模板名稱</th><th style="width:15%">套用數量</th><th style="width:15%">模板下載</th><th style="width:30%">使用資源</th><th style="width:20%">刪除</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th style="width:20%">模板名稱</th><th style="width:15%">套用數量</th><th style="width:15%">模板下載</th><th style="width:30%">使用資源</th><th style="width:20%">刪除</th></tr>`;


            

            
            for(i = 0;i<data.template.length;i++){
                
                R_value_array = [];
                for(j = 0;j<data.template[i].T_Resource.length;j++){
                    R_value_array.push(data.template[i].T_Resource[j]);
                }
                
                str += `<tr onclick="url('/backend/resource/template/edit?T_ID=${data.template[i].T_ID}')"><td>${data.template[i].T_Name}</td><td>${data.template[i].T_Use}</td><td><a onclick="handleChildClick(event)" href="../../html/template/${data.template[i].T_Path}" download="${data.template[i].T_Path}"><img src="../../img/backend/download.png"></a></td><td>
                <select onclick="handleChildClick(event)">
                    ${Select_Option_HTML('',R_value_array,R_value_array)}
                </select>
                </td><td><img onclick="handleChildClick(event),msgbox(2,'即將刪除「${data.template[i].T_Name}」模板','deleteTemplate(` + '`' + data.template[i].T_ID + '`' + `)')" src="../../img/backend/bin.png"></td></tr>`;
            }
            
            t_table.innerHTML = str;
        }
        
    }
}

function setTemplate_edit(data){
    let lable_area = document.getElementsByClassName('lable_area')[0];
    let span = lable_area.getElementsByTagName('span');
    let html_area = document.getElementsByClassName('html_area')[0];
    let T_Name_Bar = document.getElementById('T_Name_Bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');

    btn[0].setAttribute('onclick',`url_blank('/html/template/${data.template.T_Path}')`);
    span[0].innerHTML = '標籤數量：' + data.all_label;
    span[1].innerHTML = '文字標籤：' + data.text_label;
    span[2].innerHTML = '照片標籤：' + data.img_label;
    span[3].innerHTML = '連結標籤：' + data.url_label;
    T_Name_Bar.innerHTML = data.template.T_Name;
    T_Name_Bar.setAttribute('href','/backend/resource/template/edit?T_ID=' + data.template.T_ID);

    sidebars2_a[0].setAttribute('href','/backend/resource/template/edit?T_ID=' + data.template.T_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/template/setting?T_ID=' + data.template.T_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/template/use?T_ID=' + data.template.T_ID);

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
                    <input placeholder="請輸入標題" value='${data.container[i].content[0]}'>
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

function setTemplate_r(data){
    let r_table_div = document.getElementsByClassName('r_table')[0];
    let r_table = r_table_div.getElementsByTagName('table')[0];
    let number = document.getElementsByClassName('number')[0];
    let T_Name_Bar = document.getElementById('T_Name_Bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');

    btn[0].setAttribute('onclick',`url_blank('/html/template/${data.template.T_Path}')`);
    sidebars2_a[0].setAttribute('href','/backend/resource/template/edit?T_ID=' + data.template.T_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/template/setting?T_ID=' + data.template.T_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/template/use?T_ID=' + data.template.T_ID);
    let str = '';

    if(data == undefined){
        r_table.innerHTML = `
        <tr><th>資源名稱</th><th>需求名稱</th><th>查看資源</th></tr>
        <tr><td colspan="4">無資料</td></tr>`;
    }else{
        if(data.resource.length == 0){
            r_table.innerHTML = `
            <tr><th>資源名稱</th><th>需求名稱</th><th>查看資源</th></tr>
            <tr><td colspan="4">無資料</td></tr>`;
        }else{
            T_Name_Bar.innerHTML = data.template.T_Name;
            T_Name_Bar.setAttribute('href','/backend/resource/template/edit?T_ID=' + data.template.T_ID);
            
            number.innerHTML = '套用數量：' + data.resource.length;
            str = `
            <tr><th>資源名稱</th><th>需求名稱</th><th>查看資源</th></tr>`;
            for(i = 0;i<data.resource.length;i++){
                str += `<tr><td>${data.resource[i].R_Name}</td><td>${data.resource[i].D_Name}</td><td><img onclick="url_blank('/resource?ID=${data.resource[i].R_ID}')" src="../../../img/backend/language.png"></td></tr>`
            } 
            r_table.innerHTML = str;
        }
    }
}

function setTemplate_setting(data){
    let T_ID = document.getElementById('T_ID');
    let T_Path = document.getElementById('T_Path');
    let T_Name = document.getElementsByName('T_Name')[0];
    let T_Name_Bar = document.getElementById('T_Name_Bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');

    

    if(data != undefined){
        T_ID.innerHTML = data.T_ID;
        T_Path.innerHTML = data.T_Path;
        T_Name.setAttribute('value',data.T_Name);
        T_Name_Bar.innerHTML = data.T_Name;
        T_Name_Bar.setAttribute('href','/backend/resource/template/edit?T_ID=' + data.T_ID);
        sidebars2_a[0].setAttribute('href','/backend/resource/template/edit?T_ID=' + data.T_ID);
        sidebars2_a[1].setAttribute('href','/backend/resource/template/setting?T_ID=' + data.T_ID);
        sidebars2_a[2].setAttribute('href','/backend/resource/template/use?T_ID=' + data.T_ID);
        btn[0].setAttribute('onclick',`saveTemplate_setting('${data.T_ID}')`);
        btn[1].setAttribute('onclick',`url_blank('/html/template/${data.T_Path}')`);
    }
}


function saveTemplate_setting(T_ID){
    let form = document.getElementsByClassName('content')[0];
    let formData = new FormData(form);
    let formObject = {};
    

    formData.forEach(function(value, key){
        formObject[key] = value;
    });
    formObject.T_ID = T_ID;

    let httpRequest = new XMLHttpRequest();

    show_loading();
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            hidden_loading();
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
                    let T_Name_Bar = document.getElementById('T_Name_Bar');
                    T_Name_Bar.innerHTML = jsonResponse.T_Name;
                    msgbox(1,'更新完成');
                }else{
                    msgbox(1,'伺服器無法反應，請稍後再嘗試');
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/template/setting/save');
    httpRequest.setRequestHeader('Content-Type','application/json');
    httpRequest.send(JSON.stringify(formObject));
}

function deleteTemplate(T_ID){
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
                    msgbox(1,'此模板還有資源資料在使用，無法刪除');
                }else if(jsonResponse.msg == 'success'){
                    setData_block(0,jsonResponse.all_t);
                    setTemplate(jsonResponse);
                }else{
                    msgbox(1,'伺服器無回應，請稍後再嘗試');
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/template/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('T_ID='+ T_ID);
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
function set_Height(id){
    let text = document.getElementsByName(id)[0];
    let container2 = text.parentElement.parentElement.parentElement;

    if(container2){
        if(container2.offsetHeight < 400){
            container2.style.height = (container2.offsetHeight*2.5) + 'px';
        }else{
            container2.setAttribute('style','');
        }
        
    }
}
function container_img(img_name){
    if(img_name == ''){
        return '../../../img/backend/plus.png';
    }else{
        return '../../../img/resource/' + img_name;
    }
}
function handleChildClick(event) {
    event.stopPropagation();
} 