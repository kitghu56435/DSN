

function getCookie_policy_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('cookie_policy資料錯誤');
                }else{
                    setCookie_policy_data(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/cookie_policy_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function setCookie_policy_data(data,L_ID){
    let language = document.getElementById('language');
    let L_Name = '';
    switch(L_ID){
        case "L000000001" : L_Name = '繁體中文'; break;
        case "L000000002" : L_Name = 'English'; break;
    }
    language.innerHTML = L_Name;
    let T_title = document.getElementsByClassName('T-title');
    let T_text = document.getElementsByClassName('T-text');
    for(i = 0;i<T_title.length;i++){
        let dsnid = T_title[i].getAttribute('dsnid');
        for(j = 0;j<data.length;j++){
            if(dsnid == data[j].RD_Template_ID){
                T_title[i].innerHTML = data[j].RD_Content;
            }
        }
    }
    for(i = 0;i<T_text.length;i++){
        let dsnid = T_text[i].getAttribute('dsnid');
        for(j = 0;j<data.length;j++){
            if(dsnid == data[j].RD_Template_ID){
                T_text[i].innerHTML = data[j].RD_Content;
            }
        }
    }
}