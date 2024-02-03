//window.onresize = header_nav_check;

window.addEventListener('resize', function() {
    header_nav_check();
});


function header_nav_check(){
    let nav_item = document.getElementsByClassName('nav-item');
    let navbar_brand = document.getElementsByClassName('navbar-brand')[0];
    
    
    if(window.innerWidth > 768){
        for(i = 0;i<7;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            a.setAttribute('class','nav-link nav-link-hover T-title');
            ul.setAttribute('class','nav-link-hover-menu container2');

            
            navbar_brand.innerHTML = `<img src="/docs/4.0/assets/brand/bootstrap-solid.svg" width="30" height="30" alt="">
            <span class="T-title" dsnid="h000" dsnnote="網頁名稱">DSN弱勢支援網</span>`;
            

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-hover-item T-text');
            }
        }
    }else{
        for(i = 0;i<7;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            if(window.innerWidth > 560){
            navbar_brand.innerHTML = '<img src="/docs/4.0/assets/brand/bootstrap-solid.svg" width="30" height="30" alt="">';
            }

            a.setAttribute('class','nav-link dropdown-toggle T-title');
            ul.setAttribute('class','dropdown-menu container2');

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-item T-text');
            }
        }
    }
}

function getHeader_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('header資料錯誤');
                }else{
                    setHeader_data(jsonResponse.data,jsonResponse.L_ID);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/header_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send(null);
}
function setHeader_data(data,L_ID){
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
                if(dsnid == 'h050' || dsnid == 'h079'){
                    T_text[i].setAttribute('placeholder',data[j].RD_Content);
                }
                T_text[i].innerHTML = data[j].RD_Content;
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


function setLanguage(L_ID){
    let language = document.getElementById('language');
    let L_Name = '';
    switch(L_ID){
        case "L000000001" : L_Name = '繁體中文'; break;
        case "L000000002" : L_Name = 'English'; break;
    }
    language.innerHTML = L_Name;

    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status != 200){
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }else{
                getHeader_data();
            }
        }
    }
    
    httpRequest.open('POST','/leng');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('L_ID=' + L_ID);
}



