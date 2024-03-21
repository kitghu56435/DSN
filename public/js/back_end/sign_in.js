


function setMsg(info){
    let h3 = document.getElementsByTagName('h5')[0];

    let msg = '';
    switch(info){
        case 'err' : msg = '伺服器錯誤，請通知作業人員'; break;
        case 'nodata' : msg = '帳號密碼錯誤'; break;
        case 'none' : msg = '請嘗試登入系統'; break;
    }

    h3.innerHTML = msg;
    h3.style['color'] = 'red';


    return;
}