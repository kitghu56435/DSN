
window.addEventListener('resize', function() {
    index_poster_check();
});

function index_poster_check(){
    let carousel_img = document.getElementsByClassName('carousel_img');

    if(window.innerWidth <= 560){
        carousel_img[0].setAttribute('src','../img/index/index_poster_560_1.png');
        carousel_img[1].setAttribute('src','../img/index/index_poster_560_2.png');
        carousel_img[2].setAttribute('src','../img/index/index_poster_560_3.png');
    }else if(window.innerWidth <= 768){
        carousel_img[0].setAttribute('src','../img/index/index_poster_768_1.png');
        carousel_img[1].setAttribute('src','../img/index/index_poster_768_2.png');
        carousel_img[2].setAttribute('src','../img/index/index_poster_768_3.png');
    }else if(window.innerWidth <= 1280){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1280_1.png');
        carousel_img[1].setAttribute('src','../img/index/index_poster_1280_2.png');
        carousel_img[2].setAttribute('src','../img/index/index_poster_1280_3.png');
    }else if(window.innerWidth <= 1600){
        carousel_img[0].setAttribute('src','../img/index/index_poster_1600_1.png');
        carousel_img[1].setAttribute('src','../img/index/index_poster_1600_2.png');
        carousel_img[2].setAttribute('src','../img/index/index_poster_1600_3.png');
    }else{
        carousel_img[0].setAttribute('src','../img/index/index_poster_1900_1.png');
        carousel_img[1].setAttribute('src','../img/index/index_poster_1900_2.png');
        carousel_img[2].setAttribute('src','../img/index/index_poster_1900_3.png');
    }
}
