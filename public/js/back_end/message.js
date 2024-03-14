function setMessage(data){
    let d_table_div = document.getElementsByClassName('d_table')[0];
    let d_table = d_table_div.getElementsByTagName('table')[0];
    let t_table_div = document.getElementsByClassName('t_table')[0];
    let t_table = t_table_div.getElementsByTagName('table')[0];
    let str = '';

    if(data == undefined){
        d_table.innerHTML = `
        <tr><th>資源名稱</th><th>總留言數</th><th>今日留言數</th><th>本月留言數</th><th>留言占比</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
        t_table.innerHTML = `
        <tr><th>留言時間</th><th>內容</th></tr>
        <tr><td colspan="2">無資料</td></tr>`;
    }else{

        
        if(data.R_Message.length == 0){
            d_table.innerHTML = `
            <tr><th>資源名稱</th><th>總留言數</th><th>今日留言數</th><th>本月留言數</th><th>留言占比</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>資源名稱</th><th>總留言數</th><th>今日留言數</th><th>本月留言數</th><th>留言占比</th></tr>`;
            for(i = 0;i<data.R_Message.length;i++){
                str += `<tr onclick="url('/backend/resource/demand/feedback?R_ID=${data.R_Message[i].R_ID}')"><td>${data.R_Message[i].R_Name}</td><td>${data.R_Message[i].RF_Num}</td><td>${data.R_Message[i].RF_Day_Num}</td><td>${data.R_Message[i].RF_Mon_Num}</td><td>${data.R_Message[i].RF_Proportion}%</td></tr>`
            }
            d_table.innerHTML = str;
        }


        if(data.Page_Message.length == 0){
            t_table.innerHTML = `
            <tr><th>留言時間</th><th>內容</th></tr>
            <tr><td colspan="2">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>留言時間</th><th>內容</th></tr>`;
            for(i = 0;i<data.Page_Message.length;i++){
                str += `<tr onclick="url('/backend/message/record/page')"><td>${data.Page_Message[i].RF_Date}</td><td>${data.Page_Message[i].RF_Content}</td></tr>`
            }
            t_table.innerHTML = str;
        }
        
    }
}



function setMessage_record_r(data){
    let content = document.getElementsByClassName('content')[0];
    let str = '';
    
    content.innerHTML = '';
    if(data == undefined){
        content.innerHTML += `
        <p class="lable_area">
        <span>總留言數量：0</span>
        </p>`;
    }else if(data.feedback.length == 0){
        content.innerHTML += `
        <p class="lable_area">
        <span>總留言數量：0</span>
        </p>`;
    }else{
        str += `
        <p class="lable_area">
        <span>總留言數量：${data.feedback.length}</span>
        </p>`;
        for(i = 0;i < data.feedback.length;i++){
            str += `<div class="container_msg">  
                <div class="msg_title"  onclick="show_feedback(${i})">
                    <span style="margin-right: 3%;">${data.feedback[i].D_Name}-${data.feedback[i].R_Name}</span>
                    <span>${data.feedback[i].RF_Date}</span>
                    <span class="text">${data.feedback[i].RF_Content.substring(0,6)}....</span>
                    <img onclick="handleChildClick(event),msgbox(2,'即將刪除${data.feedback[i].RF_ID}此留言','deleteRecordMessage(` + '`' + data.feedback[i].RF_ID + '`' + `,` + '`resource`' + `)')" src="../../../img/backend/bin.png">
                </div>
                <div class="msg_text">
                    <div>
                        ${data.feedback[i].RF_Content}
                    </div>
                </div>
            </div>`
        }

        content.innerHTML = str;
    }
}



function setMessage_record_p(data){
    let content = document.getElementsByClassName('content')[0];
    let str = '';
    
    content.innerHTML = '';
    if(data == undefined){
        content.innerHTML += `
        <p class="lable_area">
        <span>頁面留言數量：0</span>
        </p>`;
    }else if(data.feedback.length == 0){
        content.innerHTML += `
        <p class="lable_area">
        <span>頁面留言數量：0</span>
        </p>`;
    }else{
        str += `
        <p class="lable_area">
        <span>頁面留言數量：${data.feedback.length}</span>
        </p>`;
        for(i = 0;i < data.feedback.length;i++){
            str += `<div class="container_msg">
                <div class="msg_title"  onclick="show_feedback(${i})">
                    <span style="margin-right:3%">頁面留言</span>
                    <span>${data.feedback[i].RF_Date}</span>
                    <span class="text">${data.feedback[i].RF_Content.substring(0,6)}....</span>
                    <img onclick="handleChildClick(event),msgbox(2,'即將刪除${data.feedback[i].RF_ID}此留言','deleteRecordMessage(` + '`' + data.feedback[i].RF_ID + '`' + `,` + '`page`' + `)')" src="../../../img/backend/bin.png">
                </div>
                <div class="msg_text">
                    <div>
                        ${data.feedback[i].RF_Content}
                    </div>
                </div>
            </div>`
        }

        content.innerHTML = str;
    }
}


function deleteRecordMessage(RF_ID,page){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                
                msgbox();
                if(jsonResponse.msgbox == 'dberr'){
                    msgbox(1,'資料庫錯誤');
                }else if(jsonResponse.msgbox == 'nodata'){
                    msgbox(1,'查無留言資料');
                }else{
                    if(jsonResponse.page == 'resource'){
                        setMessage_record_r(jsonResponse);
                    }else if(jsonResponse.page == 'page'){
                        setMessage_record_p(jsonResponse);
                    }else{
                        msgbox(1,'參數錯誤');
                    }
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/backend/message/record/delete');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('RF_ID=' + RF_ID + '&page=' + page);
}


function handleChildClick(event) {
    event.stopPropagation();
} 