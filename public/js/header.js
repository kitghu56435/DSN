//window.onresize = header_nav_check;

window.addEventListener('resize', function() {
    header_nav_check();
});


function header_nav_check(){
    let nav_item = document.getElementsByClassName('nav-item');
    let nav_num = document.getElementsByClassName('nav-num');
    let logo_name = document.getElementsByTagName('span')[0];
    
    if(window.innerWidth > 768){
        for(i = 0;i<nav_num.length;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            a.setAttribute('class','nav-link nav-link-hover T-title');
            ul.setAttribute('class','nav-link-hover-menu container2');

            
            logo_name.style['display'] = 'inline';
            

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-hover-item T-text');
            }
        }
    }else{
        for(i = 0;i<nav_num.length;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            if(window.innerWidth > 560){
                logo_name.style['display'] = 'none';
            }

            a.setAttribute('class','nav-link dropdown-toggle T-title');
            ul.setAttribute('class','dropdown-menu container2');

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-item T-text');
            }
        }
    }
}

function getHeader_data(page_name){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('header資料錯誤');
                }else{
                    setHeader_data(jsonResponse);
                    header_nav_check();
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/header_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('Page=' + page_name);
}


// let data = {
//     "L_ID" : "L000000001",
//     "lang" : [
//         {
//             "L_Name" : "繁體中文",
//             "L_ID" : "L000000001"
//         },
//         {
//             "L_Name" : "English",
//             "L_ID" : "L000000002"
//         }
//     ],
//     "data" : [
//         {
//             "D_ID" : "D000000001",
//             "D_Name" : "經濟",
//             "resource" : [
//                 {
//                     "R_ID" : "R000000001",
//                     "R_Name" : "低收入戶"
//                 },
//                 {
//                     "R_ID" : "R000000002",
//                     "R_Name" : "低收入戶2"
//                 }
//             ]
//         }
//     ],
//     "static_data" : [] //這邊放footer資料
// }


function setHeader_data(data){
    //動態nav
    let collapse = document.getElementsByClassName('collapse')[0];
    collapse.innerHTML = '';
    let ul = document.createElement('ul');
    ul.setAttribute('class','navbar-nav me-auto mb-2 mb-md-0');
    let str2 = '';
    for(i = 0;i<data.data.length;i++){
        let str = '';
        
        for(j = 0;j<data.data[i].resource.length;j++){
            str += `<li><a class="dropdown-hover-item" href="#">${data.data[i].resource[j].R_Name}</a></li>`;
            if(data.data[i].resource.length-1  != j){
                str += `<li><hr class="nav-link-hr"></li>`;
            }
        }
        str2 += `
        <li class="nav-item nav-num dropdown">
            <a class="nav-link nav-link-hover" href="#" data-bs-toggle="dropdown" aria-expanded="false">${data.data[i].D_Name}</a>
            <ul class="nav-link-hover-menu">
            ${str}
            </ul>
        </li>`;
    }
    ul.innerHTML = str2;
    collapse.appendChild(ul);





    //語言選擇
    let change_language = document.createElement('ul');
    change_language.setAttribute('class','navbar-nav mb-2 mb-md-0');
    change_language.setAttribute('id','change_language');
    str = '';
    for(i = 0;i<data.lang.length;i++){
        str += `<li><a class="dropdown-item" onclick="setLanguage('${data.lang[i].L_ID}','${data.Page}')">${data.lang[i].L_Name}</a></li>`;
    }
    
    str2 = `<li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" id="language" data-bs-toggle="dropdown" aria-expanded="false">${data.L_Name}</a>
    <ul class="dropdown-menu">
        ${str}
    </ul>
    </li>`;
    change_language.innerHTML = str2;
    collapse.appendChild(change_language);



    //搜尋框
    let form = document.createElement('form');
    form.setAttribute('class','d-flex container2');
    form.setAttribute('role','search');
    form.innerHTML = `<input class="form-control me-2 T-text" dsnid="h050" dsnnote="搜尋框" type="search" placeholder="請輸入關鍵字.." aria-label="Search" style="background-color: #ECECFF;">
    <button class="btn btn-outline-light T-text" dsnid="h051" dsnnote="搜尋按鈕" type="submit" style="width:30%">搜尋</button>`;
    collapse.appendChild(form);





    let T_title = document.getElementsByClassName('T-title');
    let T_text = document.getElementsByClassName('T-text');
    for(i = 0;i<T_title.length;i++){
        let dsnid = T_title[i].getAttribute('dsnid');
        for(j = 0;j<data.static_data.length;j++){
            if(dsnid == data.static_data[j].RD_Template_ID){
                T_title[i].innerHTML = data.static_data[j].RD_Content;
            }
        }
    }
    for(i = 0;i<T_text.length;i++){
        let dsnid = T_text[i].getAttribute('dsnid');
        for(j = 0;j<data.static_data.length;j++){
            if(dsnid == data.static_data[j].RD_Template_ID){
                if(dsnid == 'h050' || dsnid == 'h079'){
                    T_text[i].setAttribute('placeholder',data.static_data[j].RD_Content);
                }
                T_text[i].innerHTML = data.static_data[j].RD_Content;
            }
        }
    }
}

function cookie_msg(){
    let cookie_msg = document.getElementsByClassName('cookie_msg')[0];
    let body = document.getElementsByTagName('body')[0];
    if(cookie_msg != undefined){
        cookie_msg.parentElement.removeChild(cookie_msg);
    }else{
        let msg = document.createElement('div');
        msg.setAttribute('class','cookie_msg');
        msg.innerHTML = `
        <div style="text-align: right;margin-bottom:1%"><img onclick="setCookie('delete'),cookie_msg()" src="../img/X.png"></div>
        <p>我們使用Cookie技術提供個人化的服務，提升您的使用體驗，詳細請閱讀我們的<a href="#">《Cookie政策及條款》</a></p>
        <div><button class="no" onclick="setCookie('none'),cookie_msg()">拒絕</button><button class="yes" onclick="setCookie('accept'),cookie_msg()">酷，我接受!</button></div>
        `
        body.appendChild(msg);
    }
}


function url(path){                      //轉送函數
    location.href = path;
}



function Shelf(n){
    if(n == 1){
        return '上架中'
    }else{
        return '下架中'
    }
}


function setCookie(accept){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status != 200){
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/cookie');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('accept=' + accept);
}


function setLanguage(L_ID,Page){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status != 200){
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }else{
                getHeader_data(Page);
                switch(Page){
                    case "index" : getIndex_data();
                    case "guideline" : getGuideline_data();
                    case "about_us" : getAbout_us_data();
                    case "cookie_policy" : getCookie_policy_data();
                }
            }
        }
    }
    
    httpRequest.open('POST','/leng');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('L_ID=' + L_ID);
}



