
window.addEventListener('resize', function() {
    guideline_poster_check();
});

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


function getGuideline_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('Guideline資料錯誤');
                }else{
                    setGuideline_data(jsonResponse.data,jsonResponse.L_ID);
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
function setGuideline_data(data,L_ID){
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