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

function url_blank(path) {
  let newTab = window.open(path, '_blank');
  newTab.location;
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



function show_loading(){
  let body = document.getElementsByTagName('body')[0];
  let black_screen = document.createElement('div');
  let loading_screen = document.createElement('div');
  black_screen.setAttribute('class','black_screen');
  loading_screen.setAttribute('class','loading_screen');
  loading_screen.innerHTML = `<div class="loader"></div>`;
  body.appendChild(black_screen);
  body.appendChild(loading_screen);
}

function hidden_loading(){
  let black_screen = document.getElementsByClassName('black_screen')[0];
  let loading_screen = document.getElementsByClassName('loading_screen')[0];
  if(loading_screen != undefined){
    black_screen.parentElement.removeChild(black_screen)
    loading_screen.parentElement.removeChild(loading_screen)
  }
}



