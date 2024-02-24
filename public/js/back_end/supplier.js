

function setSupplier_Add(data){
    let resource_table = document.getElementsByClassName('resource_table')[0];
    str = '';

    str = '<tr><th>資源需求</th><th>資源名稱</th><th>勾選</th></tr>';
    for(i = 0;i<data.resource.length;i++){
        str += `<tr onclick="checkbox('c${i}')"><td>${data.resource[i].D_Name}</td><td>${data.resource[i].R_Name}</td><td><input value="${data.resource[i].R_ID}" name="R_ID" id="c${i}" type="checkbox"></td></tr>`;
    }
    resource_table.innerHTML = str;
}


function checkbox(id){
    let checkbox = document.getElementById(id);
    checkbox.click();
}



function setSupplier(data){
    let d_table = document.getElementsByClassName('d_table')[0];
    let table = d_table.getElementsByTagName('table')[0];
    let str = '';

    
    if(data != undefined){
        str += '<tr><th>供應商名稱</th><th>資源綁定數</th><th>綁定資源</th><th>供應商網站</th><th>建立時間</th><th>刪除</th></tr>';
        for(i = 0;i < data.supplier.length;i++){
            str += `<tr onclick="url('/backend/supplier/edit?S_ID=${data.supplier[i].S_ID}')"><td>${data.supplier[i].S_Name}</td><td>${data.supplier[i].S_Resource.length}</td><td>
            <select>
                ${Select_Option_HTML('',data.supplier[i].S_Resource,'')}
            </select>
            </td><td><a target="_blank" href="${data.supplier[i].S_Web}"><img onclick="handleChildClick(event)" src="../../img/backend/language.png"></a></td><td>${data.supplier[i].S_Date}</td><td>
            <img onclick="handleChildClick(event),msgbox(2,'即將刪除「${data.supplier[i].S_Name}」供應商','deleteSupplier(` + '`' + data.supplier[i].S_ID + '`' + `)')" src="../../img/backend/bin.png"></td></tr>`
        }
    }
    table.innerHTML = str;
}
function deleteSupplier(S_ID){
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
                }else if(jsonResponse.msg == 'success'){
                    setData_block(0,jsonResponse.supplier.length);
                    setSupplier(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/supplier/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('S_ID='+S_ID);
}



function setSupplier_edit(data){
    let S_Name_Bar = document.getElementById('S_Name_Bar');
    let S_ID = document.getElementById('S_ID');
    let S_Name = document.getElementsByName('S_Name')[0];
    let S_Phone = document.getElementsByName('S_Phone')[0];
    let S_Web = document.getElementsByName('S_Web')[0];
    let S_Manager = document.getElementsByName('S_Manager')[0];
    let S_Manager_phone = document.getElementsByName('S_Manager_phone')[0];
    let S_Remark = document.getElementsByName('S_Remark')[0];
    let sidebars2 = document.getElementsByClassName('sidebars2')[0];
    let a = sidebars2.getElementsByTagName('a');
    
    if(data != undefined){
        a[0].setAttribute('href','');

        S_Name_Bar.innerHTML = data.S_Name;
        S_ID.innerHTML = data.S_ID;
        S_Name.setAttribute('value',data.S_Name);
        S_Phone.setAttribute('value',data.S_Phone);
        S_Web.setAttribute('value',data.S_Web);
        S_Manager.setAttribute('value',data.S_Manager);
        S_Manager_phone.setAttribute('value',data.S_Manager_phone);
        S_Remark.innerHTML = data.S_Remark;
    }
    
}


function setSupplier_r(data){
    let S_Name_Bar = document.getElementById('S_Name_Bar');
    let lable_area = document.getElementsByClassName('lable_area')[0]
    let span = lable_area.getElementsByTagName('span')[0];
    let resource_table = document.getElementsByClassName('resource_table')[0];
    str = '';

    S_Name_Bar.innerHTML = data.S_Name;
    span.innerHTML = `綁定數量：` + data.resource.length;
    str = '<tr><th>資源需求</th><th>資源名稱</th><th>勾選</th></tr>';
    for(i = 0;i<data.resource.length;i++){
        str += `<tr onclick="checkbox('c${i}')"><td>${data.resource[i].D_Name}</td><td>${data.resource[i].R_Name}</td><td><input value="${data.resource[i].R_ID}" name="S_ID" id="c${i}" type="checkbox"></td></tr>`;
    }
    resource_table.innerHTML = str;
}




function Select_Option_HTML(value,value_array,id_array){
    str = '';
    for(b = 0;b<value_array.length;b++){
        if(id_array[b] == value){
            str += `<option selected value="${id_array[b]}">${value_array[b]}</option>`;
        }else{
            str += `<option value="${id_array[b]}">${value_array[b]}</option>`;
        }
    }
    
    return str;
}
function handleChildClick(event) {
    event.stopPropagation();
} 