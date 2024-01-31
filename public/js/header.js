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

            a.setAttribute('class','nav-link nav-link-hover');
            ul.setAttribute('class','nav-link-hover-menu');

            
            navbar_brand.innerHTML = '<img src="/docs/4.0/assets/brand/bootstrap-solid.svg" width="30" height="30" alt="">弱勢資源網DSN';
            

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-hover-item');
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

            a.setAttribute('class','nav-link dropdown-toggle');
            ul.setAttribute('class','dropdown-menu');

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-item');
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
        <div style="text-align: right;margin-bottom:1%"><img onclick="cookie_msg()" src="../img/X.png"></div>
        <p>我們使用Cookie技術提供個人化的服務，提升您的使用體驗，詳細請閱讀我們的<a href="#">《Cookie政策及條款》</a></p>
        <div><button class="no" onclick="cookie_msg()">拒絕</button><button class="yes" onclick="cookie_msg()">酷，我接受!</button></div>
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

