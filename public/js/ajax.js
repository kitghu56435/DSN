

function setDSNdata(data,L_ID){
    
    let T_title = document.getElementsByClassName('T-title');
    let T_text = document.getElementsByClassName('T-text');
    let T_img = document.getElementsByClassName('T-img');
    let T_url = document.getElementsByClassName('T-url');
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
                T_text[i].innerHTML = check_text(data[j].RD_Content);
            }
        }
    }
    for(i = 0;i<T_img.length;i++){
        let dsnid = T_img[i].getAttribute('dsnid');
        for(j = 0;j<data.length;j++){
            if(dsnid == data[j].RD_Template_ID){
                T_img[i].setAttribute('src','/img/resource/' + data[j].RD_Content)
            }
        }
    }
    for(i = 0;i<T_url.length;i++){
        let dsnid = T_url[i].getAttribute('dsnid');
        for(j = 0;j<data.length;j++){
            if(dsnid == data[j].RD_Template_ID){
                T_url[i].setAttribute('href',data[j].RD_Content)
            }
        }
    }
}
function setResourceInfo_data(data){   //資源頁面專用的
    let RF_Btn = document.getElementById('RF_Btn');
    let numb = document.getElementsByClassName('numb')[0]; //like num
    let Like_btn = document.getElementById('Like_btn');
    let update_time = document.getElementsByClassName('update_time')[0];
    RF_Btn.setAttribute('onclick',`sendMsg('${data.R_ID}')`);
    Like_btn.setAttribute('onclick',`R_Like('${data.R_ID}')`);
    numb.innerHTML = data.R_Like_Num;
    setLike_Btn(data.R_Like);


    let T_title = document.getElementsByClassName('T-title');
    let T_text = document.getElementsByClassName('T-text');
    let T_img = document.getElementsByClassName('T-img');
    let T_url = document.getElementsByClassName('T-url');
    for(i = 0;i<T_title.length;i++){
        let dsnid = T_title[i].getAttribute('dsnid');
        for(j = 0;j<data.RD_Data.length;j++){
            if(dsnid == data.RD_Data[j].RD_Template_ID){
                if(data.RD_Data[j].RD_Content == ""){
                    T_title[i].setAttribute('style','display:none');
                    T_title[i].parentElement.setAttribute('style','display:none');
                }else{
                    T_title[i].setAttribute('style','');
                    T_title[i].parentElement.setAttribute('style','');
                    T_title[i].innerHTML = check_text(data.RD_Data[j].RD_Content);
                }
            }
        }
    }
    for(i = 0;i<T_text.length;i++){
        let dsnid = T_text[i].getAttribute('dsnid');
        for(j = 0;j<data.RD_Data.length;j++){
            if(dsnid == data.RD_Data[j].RD_Template_ID){
                if(data.RD_Data[j].RD_Content == ""){
                    T_text[i].setAttribute('style','display:none');
                    T_text[i].parentElement.setAttribute('style','display:none');
                    
                    if(T_text[i].parentElement.parentElement.getAttribute('class') == 'section1 container2' || 
                    T_text[i].parentElement.parentElement.getAttribute('class') == 'section2 container2'){
                        T_text[i].parentElement.parentElement.setAttribute('style','display:none');
                    }
                }else if(dsnid == '142'){   //目前142是回饋textarea的placeholder
                    T_text[i].setAttribute('placeholder',data.RD_Data[j].RD_Content);
                }else{
                    T_text[i].setAttribute('style','');
                    T_text[i].parentElement.setAttribute('style','');
                    
                    if(T_text[i].parentElement.parentElement.getAttribute('class') == 'section1 container2' || 
                    T_text[i].parentElement.parentElement.getAttribute('class') == 'section2 container2'){
                        T_text[i].parentElement.parentElement.setAttribute('style','');
                    }
                    T_text[i].innerHTML = check_text(data.RD_Data[j].RD_Content);
                }
                
            }
        }
    }
    for(i = 0;i<T_img.length;i++){
        let T_img_found = false;
        let dsnid = T_img[i].getAttribute('dsnid');
        for(j = 0;j<data.RD_Data.length;j++){
            if(dsnid == data.RD_Data[j].RD_Template_ID){
                T_img_found = true
                T_img[i].setAttribute('src','/img/resource/' + data.RD_Data[j].RD_Content)
                T_img[i].setAttribute('style','');
                T_img[i].parentElement.setAttribute('style','');
            }
        }
        if(!T_img_found){
            T_img[i].setAttribute('style','display:none');
            T_img[i].parentElement.setAttribute('style','display:none');
        }
    }
    for(i = 0;i<T_url.length;i++){
        let dsnid = T_url[i].getAttribute('dsnid');
        for(j = 0;j<data.RD_Data.length;j++){
            if(dsnid == data.RD_Data[j].RD_Template_ID){
                if(data.RD_Data[j].RD_Content == ''){
                    T_url[i].setAttribute('style','display:none');
                    //T_url[i].parentElement.setAttribute('style','display:none');
                }else{
                    T_url[i].setAttribute('style','');
                    T_url[i].setAttribute('href',data.RD_Data[j].RD_Content)
                }
                
            }
        }
    }

    update_time.innerHTML = '上次更新時間 ' + data.R_Update;
}
function setLike_Btn(clike){
    let content = document.getElementsByClassName('content')[0];
    let heart = document.getElementsByClassName('heart')[0];
    let like_text = document.getElementsByClassName('like_text')[0];
    let numb = document.getElementsByClassName('numb')[0];
    if(clike){
        content.setAttribute('class','content heart-active');
        heart.setAttribute('class','heart heart-active');
        like_text.setAttribute('class','like_text heart-active');
        numb.setAttribute('class','numb heart-active');
    }
}
function check_text(str){
    return str.replaceAll('\n', "<br>");
}



function getIndex_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Index資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/index_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getCookie_policy_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('cookie_policy資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
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
function getGuideline_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Guideline資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/guideline_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getAbout_us_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('About_us資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/about_us_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getEconomy_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Finance資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/economy_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getEmergency_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Emergency資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/emergency_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getLaw_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Law資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/law_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getApplication_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Application資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/application_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getPsychology_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Psychology資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/psychology_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getEducation_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Education資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/education_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getCareer_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Career資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/career_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getMedical_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('medical資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/medical_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getPsychology_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('psychology資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/psychology_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getSearch_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('search資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/search_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getSearch_results_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Search_results資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/search_results_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getNotFound(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('NotFound資料錯誤');
                }else{
                    setDSNdata(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/notfound_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function getTemplate_data(R_ID){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Template_data資料錯誤');
                }else{
                    setResourceInfo_data(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/resource/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('R_ID=' + R_ID);
}



function sendMsg(type){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('留言失敗使稍後嘗試');
                }else{
                    alert('您的留言已成功送出，謝謝您的回饋');
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }

    let msg = '';
    let R_ID = undefined;
    if(type == 'page'){
        let text = document.getElementById('newsletter1');
        msg = text.value;
        text.value = '';
        text.setAttribute('value','');
    }else{
        let text = document.getElementById('RF_Content');
        msg = text.value;
        text.value = '';
        R_ID = type;
    }

    if(msg == ''){
        alert('請先再輸入框輸入留言，在點擊送出');
    }else{
        httpRequest.open('POST','/static/msg');
        httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        httpRequest.send('msg=' + msg + '&R_ID=' + R_ID);
    }
    
    
}

function R_Like(R_ID){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('案讚失敗');
                }else{
                    let numb = document.getElementsByClassName('numb')[0]; //like num
                    numb.innerHTML = jsonResponse.R_Like;
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }


    httpRequest.open('POST','/static/like');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('R_ID=' + R_ID);
}