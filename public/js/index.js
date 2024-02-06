
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


function getIndex_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('header資料錯誤');
                }else{
                    setIndex_data(jsonResponse.data,jsonResponse.L_ID);
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
function setIndex_data(data,L_ID){
    let language = document.getElementById('language');
    let L_Name = '';
    switch(L_ID){
        case "L000000001" : L_Name = '繁體中文'; break;
        case "L000000002" : L_Name = 'English'; break;
    }
    language.innerHTML = L_Name;
    
    let T_text = document.getElementsByClassName('T-text');
    for(i = 0;i<T_text.length;i++){
        let dsnid = T_text[i].getAttribute('dsnid');
        for(j = 0;j<data.length;j++){
            if(dsnid == data[j].RD_Template_ID){
                // if(dsnid == 'h050' || dsnid == 'h079'){
                //     T_text[i].setAttribute('placeholder',data[j].RD_Content);
                // }
                T_text[i].innerHTML = data[j].RD_Content;
            }
        }
    }
}