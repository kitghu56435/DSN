

function show_feedback(n){
    let msg_text = document.getElementsByClassName('msg_text')[n];  //padding:2%;
    let msg_title = document.getElementsByClassName('msg_title')[n];  //padding:2%;
    let text = msg_title.getElementsByClassName('text')[0]; 
    let div = msg_text.getElementsByTagName('div')[0];     //padding:1%;

    if(msg_text.style['padding'] == '2%'){
        msg_text.setAttribute('style','padding:0%;height:0');
        div.setAttribute('style','padding:0%;height:0');
        text.setAttribute('style',' opacity: 1;');
    }else{
        msg_text.setAttribute('style','padding:2%;height:auto;');
        div.setAttribute('style','padding:1%;height:auto;');
        text.setAttribute('style',' opacity: 0;');
    }

}


function checkbox(id){
    let checkbox = document.getElementById(id);
    checkbox.click();
}


function setResource(data){
    let d_table_div = document.getElementsByClassName('d_table')[0];
    let d_table = d_table_div.getElementsByTagName('table')[0];
    let t_table_div = document.getElementsByClassName('t_table')[0];
    let t_table = t_table_div.getElementsByTagName('table')[0];
    let str = '';

    if(data == undefined){
        d_table.innerHTML = `
        <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
        t_table.innerHTML = `
        <tr><th>模板名稱</th><th>使用數量</th></tr>
        <tr><td colspan="2">無資料</td></tr>`;
    }else{
        if(data.Demand.length == 0){
            d_table.innerHTML = `
            <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>`;
            for(i = 0;i<data.Demand.length;i++){
                str += `<tr onclick="url('/backend/resource/demand?D_ID=${data.Demand[i].D_ID}')"><td>${data.Demand[i].D_Name}</td><td>${data.Demand[i].D_Resource}</td><td>${data.Demand[i].R_On_Shelf}</td><td>${data.Demand[i].R_Down_Shelf}</td><td><img onclick="handleChildClick(event),msgbox(2,'即將刪除${data.Demand[i].D_Name}','deleteDemand(` + '`' + data.Demand[i].D_ID + '`' + `)')" src="../../img/bin.png"></td></tr>`
            }
            d_table.innerHTML = str;
        }


        if(data.Template.length == 0){
            t_table.innerHTML = `
            <tr><th>模板名稱</th><th>使用數量</th></tr>
            <tr><td colspan="2">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>模板名稱</th><th>使用數量</th></tr>`;
            for(i = 0;i<data.Template.length;i++){
                str += `<tr onclick="url('/backend/resource/template/edit?T_ID=${data.Template[i].T_ID}')"><td>${data.Template[i].T_Name}</td><td>${data.Template[i].T_Use}</td></tr>`
            }
            t_table.innerHTML = str;
        }
        
    }
}

function deleteDemand(D_ID){
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
                }else if(jsonResponse.msg == 'deleteerr'){
                    msgbox(1,'此需求還有資源資料，無法刪除');
                }else if(jsonResponse.msg == 'success'){
                    setData_block(0,jsonResponse.all_d);
                    setData_block(1,jsonResponse.all_r);
                    setResource(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/demand/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('D_ID='+D_ID);
}


function setDemand(data){
    let r_table_div = document.getElementsByClassName('r_table')[0];
    let r_table = r_table_div.getElementsByTagName('table')[0];
    let D_Name_bar = document.getElementById('D_Name_bar');
    let str = '';
    

    if(data == undefined){
        r_table.innerHTML = `
        <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
    }else{
        D_Name_bar.innerHTML = data.demand.D_Name;
        D_Name_bar.setAttribute('href','/backend/resource/demand?D_ID=' + data.demand.D_ID);

        if(data.resource.length == 0){
            r_table.innerHTML = `
            <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>`;
            for(i = 0;i<data.resource.length;i++){
                str += `<tr onclick="url('/backend/resource/demand/edit?R_ID=${data.resource[i].R_ID}')"><td>${data.resource[i].R_Name}</td><td>${data.resource[i].T_Name}</td><td>${Shelf(data.resource[i].R_Shelf)}</td><td>${data.resource[i].R_Update}</td><td><img onclick="handleChildClick(event),msgbox(2,'即將刪除「${data.resource[i].R_Name}」資源','deleteResource(` + '`' + data.resource[i].R_ID + '`' + `,` + '`' + data.demand.D_ID + '`' + `)')" src="../../img/bin.png"></td></tr>`
            }
            r_table.innerHTML = str;
        }
    }
}

function deleteResource(R_ID,D_ID){
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
                }else if(jsonResponse.msg == 'deleteerr'){
                    msgbox(1,'此需求還有資源資料，無法刪除');
                }else if(jsonResponse.msg == 'success'){
                    setData_block(0,jsonResponse.all_r);
                    setData_block(1,jsonResponse.On_Shelf);
                    setData_block(2,jsonResponse.Down_Shelf);
                    setDemand(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('R_ID='+ R_ID + '&D_ID=' + D_ID);
}


function setResource_Add_r(data){
    let save = document.getElementsByClassName('save')[0];
    let t = document.getElementsByClassName('t')[0];
    let d = document.getElementsByClassName('d')[0];
    let supplier_table = document.getElementsByClassName('supplier_table')[0];
    str = '';


    if(data == undefined || data.template.length == 0 || data.demand.length == 0){
        save.setAttribute('disabled','');
    }else{
        let T_Name_array = [];
        let T_ID_array = [];
        for(i = 0;i < data.template.length;i++){
            T_Name_array.push(data.template[i].T_Name);
            T_ID_array.push(data.template[i].T_ID);
        }
        t.innerHTML = Select_Option_HTML('',T_Name_array,T_ID_array);

        let D_Name_array = [];
        let D_ID_array = [];
        for(i = 0;i < data.demand.length;i++){
            D_Name_array.push(data.demand[i].D_Name);
            D_ID_array.push(data.demand[i].D_ID);
        }
        d.innerHTML = Select_Option_HTML('',D_Name_array,D_ID_array);


        
        str = '<tr><th>供應商序號</th><th>供應商名稱</th><th>勾選</th></tr>';
        for(i = 0;i<data.supplier.length;i++){
            str += `<tr onclick="checkbox('c${i}')"><td>${data.supplier[i].S_ID}</td><td>${data.supplier[i].S_Name}</td><td><input value="${data.supplier[i].S_ID}" name="S_ID" id="c${i}" type="checkbox"></td></tr>`;
        }
        supplier_table.innerHTML = str;
    }
}


function setResource_edit(data){
    let lang = document.getElementsByClassName('lang')[0];   
    let html_area = document.getElementsByClassName('html_area')[0];
    let D_Name_bar = document.getElementById('D_Name_bar');
    let R_Name_bar = document.getElementById('R_Name_bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');

    D_Name_bar.innerHTML = data.resource.D_Name;
    D_Name_bar.setAttribute('href','/backend/resource/demand?D_ID=' + data.resource.D_ID);
    R_Name_bar.innerHTML = data.resource.R_Name;
    R_Name_bar.setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);

    sidebars2_a[0].setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/demand/setting?R_ID=' + data.resource.R_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/demand/feedback?R_ID=' + data.resource.R_ID);
    sidebars2_a[3].setAttribute('href','/backend/resource/demand/supplier?R_ID=' + data.resource.R_ID);

    if(data.resource.R_Shelf){
        btn[1].innerHTML = '下架資源';
    }else{
        btn[1].innerHTML = '上架資源';
    }
    btn[0].setAttribute('onclick',`saveResource_data('${data.resource.R_ID}')`);
    btn[1].setAttribute('onclick',`shelfResource('${data.resource.R_ID}')`);
    
    let L_Name_array = [];
    let L_ID_array = [];
    for(i = 0;i < data.leng.length;i++){
        L_Name_array.push(data.leng[i].L_Name);
        L_ID_array.push(data.leng[i].L_ID);
    }
    lang.innerHTML = Select_Option_HTML(data.resource.L_ID,L_Name_array,L_ID_array);
    lang.setAttribute('onchange',`getResource_data('${data.resource.R_ID}',this.value)`);


    
    html_area.innerHTML = `<input type="hidden" id="L_ID" name="L_ID" value="${data.resource.L_ID}">`;
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
                            <span>項目提示：${data.container[i].note[j]}</span>
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
                            <span>項目提示：${data.container[i].note[j]}</span>
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
                            <span>項目提示：${data.container[i].note[j]}</span>
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

function shelfResource(R_ID){
    let httpRequest = new XMLHttpRequest();
    let btn_area = document.getElementsByClassName('btn_area')[0];
    let btn = btn_area.getElementsByTagName('button');

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
                }else if(jsonResponse.msg == 'success'){
                    if(jsonResponse.shelf){
                        btn[1].innerHTML = '下架資源';
                    }else{
                        btn[1].innerHTML = '上架資源';
                    }
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/demand/edit/shelf');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('R_ID='+R_ID);
}
function saveResource_data(R_ID){
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
    formObject.R_ID = R_ID;
    formObject.Template_ID = id_array;

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
    
    httpRequest.open('POST','/backend/resource/demand/edit/save');
    httpRequest.setRequestHeader('Content-Type','application/json');
    httpRequest.send(JSON.stringify(formObject));
}
function getResource_data(R_ID,L_ID){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                
                if(jsonResponse.msgbox != ''){
                    msgbox(1,jsonResponse.msgbox);
                }else{
                    setResource_edit(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/resource/demand/edit/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('R_ID='+R_ID + '&L_ID=' + L_ID);
}
function click_file_img(RD_ID){
    let img = document.getElementById( RD_ID + '_input_file');
    img.click();
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





function setResource_feedback(data){
    let content = document.getElementsByClassName('content')[0];
    let D_Name_bar = document.getElementById('D_Name_bar');
    let R_Name_bar = document.getElementById('R_Name_bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    sidebars2_a[0].setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/demand/setting?R_ID=' + data.resource.R_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/demand/feedback?R_ID=' + data.resource.R_ID);
    sidebars2_a[3].setAttribute('href','/backend/resource/demand/supplier?R_ID=' + data.resource.R_ID);
    D_Name_bar.innerHTML = data.resource.D_Name;
    D_Name_bar.setAttribute('href','/backend/resource/demand?D_ID=' + data.resource.D_ID);
    R_Name_bar.innerHTML = data.resource.R_Name;
    R_Name_bar.setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);
    let str = '';
    

    if(data == undefined){
        content.innerHTML += `
        <p class="lable_area">
        <span>回饋數量：0</span>
        </p>`;
    }else if(data.feedback.length == 0){
        content.innerHTML += `
        <p class="lable_area">
        <span>回饋數量：0</span>
        </p>`;
    }else{
        str += `
        <p class="lable_area">
        <span>回饋數量：${data.feedback.length}</span>
        </p>`;
        for(i = 0;i < data.feedback.length;i++){
            str += `<div class="container_msg">  
                <div class="msg_title"  onclick="show_feedback(${i})">
                    <span>${data.feedback[i].RF_Date}</span>
                    <span class="text">${data.feedback[i].RF_Content.substring(0,6)}....</span>
                    <img src="../../../img/bin.png">
                </div>
                <div class="msg_text">
                    <div>
                        ${data.feedback[i].RF_Content}
                    </div>
                </div>
            </div>`
        }

        content.innerHTML = str;
    }
}


function setResource_setting(data){
    let lang = document.getElementsByClassName('lang')[0];
    let R_ID = document.getElementsByClassName('R_ID')[0];    
    let R_Name = document.getElementsByName('R_Name')[0];
    let T_ID = document.getElementsByName('T_ID')[0];
    let D_ID = document.getElementsByName('D_ID')[0];
    let s_table = document.getElementById('s_table');
    let D_Name_bar = document.getElementById('D_Name_bar');
    let R_Name_bar = document.getElementById('R_Name_bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    let T_value_array = [];
    let T_id_array = [];
    let D_value_array = [];
    let D_id_array = [];
    let str = '';

    

    D_Name_bar.innerHTML = data.D_Name;
    D_Name_bar.setAttribute('href','/backend/resource/demand?D_ID=' + data.D_ID);
    R_Name_bar.innerHTML = data.R_Name;
    R_Name_bar.setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.R_ID);
    sidebars2_a[0].setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.R_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/demand/setting?R_ID=' + data.R_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/demand/feedback?R_ID=' + data.R_ID);
    sidebars2_a[3].setAttribute('href','/backend/resource/demand/supplier?R_ID=' + data.R_ID);

    
    let L_Name_array = [];
    let L_ID_array = [];
    for(i = 0;i < data.leng.length;i++){
        L_Name_array.push(data.leng[i].L_Name);
        L_ID_array.push(data.leng[i].L_ID);
    }
    lang.innerHTML = Select_Option_HTML('',L_Name_array,L_ID_array);

    for(i = 0;i<data.T_List.length;i++){
        T_value_array.push(data.T_List[i].T_Name)
        T_id_array.push(data.T_List[i].T_ID)
    }
    for(i = 0;i<data.D_List.length;i++){
        D_value_array.push(data.D_List[i].D_Name)
        D_id_array.push(data.D_List[i].D_ID)
    }
    

    if(data != undefined){
        R_Name.setAttribute('value',data.R_Name);
        R_ID.innerHTML = data.R_ID
        T_ID.innerHTML = Select_Option_HTML(data.T_ID,T_value_array,T_id_array);
        D_ID.innerHTML = Select_Option_HTML(data.D_ID,D_value_array,D_id_array);
        
        for(i = 0;i < data.S_List.length;i++){
            str += `<tr onclick="checkbox('c${i}')"><td>${data.S_List[i].S_ID}</td><td>${data.S_List[i].S_Name}</td><td><input id="c${i}" type="checkbox" ${Checked(data.S_List[i].S_Check)}></td></tr>`
        }
        
        s_table.innerHTML = str
    }
}


function setResource_supplier(data){
    let content = document.getElementsByClassName('content')[0];
    let s_table_div = document.getElementsByClassName('s_table')[0];
    let s_table = s_table_div.getElementsByTagName('table')[0];
    let s_table_p_div = document.getElementsByClassName('s_table_p')[0];
    let s_table_p = s_table_p_div.getElementsByTagName('table')[0];
    let number = document.getElementsByClassName('number')[0];
    let D_Name_bar = document.getElementById('D_Name_bar');
    let R_Name_bar = document.getElementById('R_Name_bar');
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let sidebars2_a = sidebars2.getElementsByTagName('a');
    sidebars2_a[0].setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);
    sidebars2_a[1].setAttribute('href','/backend/resource/demand/setting?R_ID=' + data.resource.R_ID);
    sidebars2_a[2].setAttribute('href','/backend/resource/demand/feedback?R_ID=' + data.resource.R_ID);
    sidebars2_a[3].setAttribute('href','/backend/resource/demand/supplier?R_ID=' + data.resource.R_ID);
    D_Name_bar.innerHTML = data.resource.D_Name;
    D_Name_bar.setAttribute('href','/backend/resource/demand?D_ID=' + data.resource.D_ID);
    R_Name_bar.innerHTML = data.resource.R_Name;
    R_Name_bar.setAttribute('href','/backend/resource/demand/edit?R_ID=' + data.resource.R_ID);
    let str = '';

    if(data == undefined){
        number.innerHTML = '供應商數量：0';
        
    }else if(data.S_Info.length == 0){
        number.innerHTML = '供應商數量：0';
    }else{

        number.innerHTML = '供應商數量：' + data.S_Info.length;
        
        


        str = '<tr><th style="width:20%">供應商名稱</th><th style="width:20%">供應商電話</th><th style="width:20%">供應商網站</th><th style="width:45%">供應商備註</th></tr>';
        for(i = 0;i<data.S_Info.length;i++){
            str += `<tr><td>${data.S_Info[i].S_Name}</td><td>${data.S_Info[i].S_Phone}</td><td><a href="${data.S_Info[i].S_Web}" target="_blank"><img src="../../../img/language.png"></a></td><td>${data.S_Info[i].S_Remark}</td></tr>`
        }

        s_table.innerHTML = str;


        str = '<tr><th>供應商名稱</th><th>聯絡人</th><th>聯絡電話</th></tr>';
        for(i = 0;i<data.S_Info_p.length;i++){
            str += `<tr><td>${data.S_Info_p[i].S_Name}</td><td>${data.S_Info_p[i].S_Manager}</td><td>${data.S_Info_p[i].S_Manager_phone}</td></tr>`
        }

        s_table_p.innerHTML = str;
    }
}








function Select_Option_HTML(value,value_array,id_array){
    str = '';
    for(i = 0;i<value_array.length;i++){
        if(id_array[i] == value){
            str += `<option selected value="${id_array[i]}">${value_array[i]}</option>`;
        }else{
            str += `<option value="${id_array[i]}">${value_array[i]}</option>`;
        }
    }
    
    return str;
}


function Checked(bool){
    if(bool){
        return 'checked';
    }else{
        return '';
    }
}
function container_img(img_name){
    if(img_name == ''){
        return '../../../img/plus.png';
    }else{
        return '../../../img/resource/' + img_name;
    }
}
function handleChildClick(event) {
    event.stopPropagation();
} 








