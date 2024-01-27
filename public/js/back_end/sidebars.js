/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()

function url(path){                      //轉送函數
  location.href = path;
}

function msgbox(mode,str,func){
    let msgbox = document.getElementsByClassName('msgbox')[0];
    let body = document.getElementsByTagName('body')[0];
    if(msgbox != undefined){
      msgbox.parentElement.removeChild(msgbox);
    }else if(mode == 1){
      let msg = document.createElement('div');
      msg.setAttribute('class','msgbox');
      msg.innerHTML = `
      <div class="title" style="text-align: center">系統通知<img onclick="msgbox()" src="/img/X.png"></div>
      <hr>
      <p>${str}</p>
      <hr>
      <div class="btn_a"><button onclick="msgbox()">確認</button></div>
      `
      body.appendChild(msg);
    }else if(mode == 2){
      let msg = document.createElement('div');
        msg.setAttribute('class','msgbox');
        msg.innerHTML = `
        <div class="title" style="text-align: center">系統通知<img onclick="msgbox()" src="/img/X.png"></div>
        <hr>
        <p>${str}</p>
        <hr>
        <div class="btn_a"><button onclick="msgbox()">取消</button><button onclick="${func}">確認</button></div>
        `
        body.appendChild(msg);
    }
}



