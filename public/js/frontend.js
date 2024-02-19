function guideline_poster_check(){
    let carousel_img = document.getElementsByClassName('carousel_img');

    if(window.innerWidth <= 560){
        carousel_img[0].setAttribute('src','../img/index/index_poster_560_2.png');
    }else if(window.innerWidth <= 768){
        carousel_img[0].setAttribute('src','../img/index/index_poster_768_2.png');
    }else if(window.innerWidth <= 1280){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1280_2.png');
    }else if(window.innerWidth <= 1600){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1600_2.png');
    }else{
        carousel_img[0].setAttribute('src','../img/index/index_poster_1900_2.png');
    }
}

function law_poster_check(){
    let carousel_img = document.getElementsByClassName('header-image');

    if(window.innerWidth <= 560){
        carousel_img[0].setAttribute('src','../img/index/index_poster_560_2.png');
    }else if(window.innerWidth <= 768){
        carousel_img[0].setAttribute('src','../img/index/index_poster_768_2.png');
    }else if(window.innerWidth <= 1280){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1280_2.png');
    }else if(window.innerWidth <= 1600){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1600_2.png');
    }else{
        carousel_img[0].setAttribute('src','../img/index/index_poster_1900_2.png');
    }
}

function emergency_poster_check(){
    let carousel_img = document.getElementsByClassName('header-image');

    if(window.innerWidth <= 560){
        carousel_img[0].setAttribute('src','../img/index/index_poster_560_2.png');
    }else if(window.innerWidth <= 768){
        carousel_img[0].setAttribute('src','../img/index/index_poster_768_2.png');
    }else if(window.innerWidth <= 1280){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1280_2.png');
    }else if(window.innerWidth <= 1600){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1600_2.png');
    }else{
        carousel_img[0].setAttribute('src','../img/index/index_poster_1900_2.png');
    }
}

function application_poster_check(){
    let carousel_img = document.getElementsByClassName('header-image');

    if(window.innerWidth <= 560){
        carousel_img[0].setAttribute('src','../img/index/index_poster_560_2.png');
    }else if(window.innerWidth <= 768){
        carousel_img[0].setAttribute('src','../img/index/index_poster_768_2.png');
    }else if(window.innerWidth <= 1280){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1280_2.png');
    }else if(window.innerWidth <= 1600){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1600_2.png');
    }else{
        carousel_img[0].setAttribute('src','../img/index/index_poster_1900_2.png');
    }
}


function show_a(n){
    let a = document.getElementsByClassName('a')[n];
    let q_img = document.getElementsByClassName('q_img')[n];

    if(a.style['height'] == '0px'){
        q_img.style['transform'] = 'rotate(180deg)';
        a.style['padding'] = `0.5em 1.5em 0.5em 1.5em`;
        a.style['height'] = `100px`;
    }else{
        q_img.style['transform'] = 'rotate(0deg)';
        a.style['padding'] = `0`;
        a.style['height'] = `0px`;
    }

    
}