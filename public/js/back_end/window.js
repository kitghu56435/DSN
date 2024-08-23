/*---------------------all the window useing-------------------------------------------- */ 

let window_input1 = undefined;     //指定回傳值
let window_input2 = undefined;     //指定回傳值2
let window_input_row_data = '';
let window_type = '';

function end_window(window){
    let win = document.getElementsByClassName(window);
    let black = document.getElementsByClassName('black_screen');
    if(win[0] != undefined){
        win[0].parentElement.removeChild(win[0]);
    }
    if(black[0] != undefined){
        black[0].parentElement.removeChild(black[0]);
    }
    
}


async function open_window(window,input1,input2,type,data){
    let body = document.getElementsByTagName('body')[0];
    window_input1 = document.getElementById(input1);
    window_input2 = document.getElementById(input2);
    let black = document.createElement('div');
    let form = document.createElement('div');
    form.setAttribute('class',window);
    black.setAttribute('class','black_screen');
    window_input_row_data = input1;
    window_type = type;
    
    
    await window_search(window,data).then(()=>{
        
        body.appendChild(black);
        switch(window){
            case 'selectR' : form.innerHTML = selectR(selectR_data); break;
        }
        body.appendChild(form); 
    }).catch(()=>{
        
    })     
}


function msgbox(mode,str,func){
    let msgbox = document.getElementsByClassName('msgbox')[0];
    let black_screen = document.getElementsByClassName('black_screen')[0];
    let body = document.getElementsByTagName('body')[0];


    if(msgbox != undefined){
        msgbox.parentElement.removeChild(msgbox);
        if(black_screen != undefined){
            black_screen.parentElement.removeChild(black_screen);
        }
    }else if(mode == 1){
        let msg = document.createElement('div');
        let black_screen = document.createElement('div');
        msg.setAttribute('class','msgbox');
        black_screen.setAttribute('class','black_screen');
        msg.innerHTML = `
            <div class="title" style="text-align: center">系統通知<img onclick="msgbox()" src="/img/X.png"></div>
            <hr>
            <p>${str}</p>
            <hr>
            <div class="btn_a"><button onclick="msgbox()">確認</button></div>
        `
        body.appendChild(black_screen);
        body.appendChild(msg);
    }else if(mode == 2){
        let msg = document.createElement('div');
        let black_screen = document.createElement('div');
        msg.setAttribute('class','msgbox');
        black_screen.setAttribute('class','black_screen');
        msg.innerHTML = `
            <div class="title" style="text-align: center">系統通知<img onclick="msgbox()" src="/img/X.png"></div>
            <hr>
            <p>${str}</p>
            <hr>
            <div class="btn_a"><button onclick="msgbox()">取消</button><button onclick="${func}">確認</button></div>
        `
        body.appendChild(black_screen);
        body.appendChild(msg);
    }
}


async function window_search(window){     //window視窗一律從此函數往後台尋找資料
    
    return new Promise((resovle,reject)=>{
        let path = '';
        let parameter = '';
        let httpRequest = new XMLHttpRequest();
        
        httpRequest.onreadystatechange = function(){
            show_loading()
            if(httpRequest.readyState === 4){
                hidden_loading()
                if(httpRequest.status === 200){
                    let jsonResponse = JSON.parse(httpRequest.responseText);
                    if(jsonResponse.msg == 'dberr'){
                        msgbox(1,'伺服器錯誤');
                        reject()
                    }else if(jsonResponse.msg == 'iderr'){
                        msgbox(1,'職員認證錯誤');
                        reject()
                    }else if(jsonResponse.msg == 'nodata'){
                        alert(1,'無資料建檔');
                        reject()
                    }else if(jsonResponse.msg == 'sherr'){
                        alert(1,'商家認證錯誤');
                        reject()
                    }else{

                        switch(window){
                            case "selectR" : if(page_update){selectR_data = jsonResponse;} break;
                        }
                        page_update = false
                        resovle()
                    }
                }else{
                    alert('資料上傳失敗!','statues code :' + httpRequest.status,'','simple');
                    reject()
                }
            }
        }
    
    
        switch(window){
            case 'selectR' : path = '/backend/window/selectR_data/'; break;
        }
    
        
        httpRequest.open('POST', path); 
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        httpRequest.send(parameter);   

    })
}










/*---------------------selectR-------------------------------------------- */ 

let page_update = true;
let selectR_data = [
    {
        "R_ID" : "R000000001",
        "R_Name" : "資源名稱1",
        "Check" : false
    },
    {
        "R_ID" : "R000000002",
        "R_Name" : "資源名稱2",
        "Check" : false
    }
];

function selectR(data){
    let str = `
    <img src="../../../img/X.png" class="window_X" onclick="end_window('selectR')">
        <div class="title">選擇資源</div>
        <div class="content">
            <div class="block1">
                <input placeholder="請輸入資源名稱" oninput="selectR_search(this.value)">
            </div>
            <div class="block2">
        <div class="F">
            <table><tr>
                <td style="width:20%"><input type="checkbox" class="input_box" onclick="checkboxAll_Click(this,'selectR',selectR_data)" ${setAllCheckbox(selectR_data)}></td>
                <td style="width:60%">資源全選</td>
                <td style="width:20%"></td>
            </tr></table>
        </div> `;
    for(i = 0;i < data.length;i++){
        str += `
        <div class="F">
            <table><tr>
                <td style="width:20%"><input type="checkbox" class="input_box" onclick="checkbox_Click(this,${i})" ${setCheckbox(selectR_data[i].Check)} value="${data[i].R_ID}"></td>
                <td style="width:60%">${data[i].R_Name}</td>
                <td style="width:20%"></td>
            </tr></table>
        </div> 
        `
    }

    str +=   `</div>
        </div>
    <div class="btn_area"><button onclick="selectR_done()">確認</button></div>
    `;


    return str;
}

function selectR_search(str){
    let selectR = document.getElementsByClassName('selectR')[0];
    let block2 = selectR.getElementsByClassName('block2')[0];
    let return_text = '';
    let match_num = str.length;
    let count = 0;
    let founded = false;

    if(str == ''){
        return_text += `
            <div class="F">
                <table><tr>
                    <td style="width:20%"><input type="checkbox" class="input_box" onclick="checkboxAll_Click(this,'selectR',selectR_data)" ${setAllCheckbox(selectR_data)}></td>
                    <td style="width:60%">資源全選</td>
                    <td style="width:20%"></td>
                </tr></table>
            </div> 
        `
        for(i = 0;i < selectR_data.length;i++){
            return_text += `
            <div class="F">
                <table><tr>
                    <td style="width:20%"><input type="checkbox" class="input_box" onclick="checkbox_Click(this,${i})" ${setCheckbox(selectR_data[i].Check)} value="${selectR_data[i].R_ID}"></td>
                    <td style="width:60%">${selectR_data[i].R_Name}</td>
                    <td style="width:20%"></td>
                </tr></table>
            </div> 
            `
        }

        block2.innerHTML = return_text;
    }else{

        for(i = 0;i < selectR_data.length;i++){
            let temp_str = selectR_data[i].R_Name;
            for(k = 0;k<temp_str.length;k++){
                if(founded){
                    founded = false;
                    break;
                }else{
                    for(j = 0;j<str.length;j++){
                        if(temp_str[k+j] == str[j]){
                            count++;
                            if(count == match_num){   //找到了
                                return_text += `
                                <div class="F">
                                    <table><tr>
                                        <td style="width:20%"><input type="checkbox" class="input_box" onclick="checkbox_Click(this,${i})" ${setCheckbox(selectR_data[i].Check)} value="${selectR_data[i].R_ID}"></td>
                                        <td style="width:60%">${selectR_data[i].R_Name}</td>
                                        <td style="width:20%"></td>
                                    </tr></table>
                                </div> 
                                ` 
                                count = 0;
                                founded = true;   
                                break; 
                            }
                        }else{
                            count = 0;
                            break;
                        }
                    }
                }
                
            }                
        }


    
        if(return_text == ''){
            return_text = `
            <div class="F">
                <table style="width:100%"><tr>
                    <td style="text-align:center">搜尋「${str}」，查無資料</td>
                </tr></table>
            </div>
            `
        }
        block2.innerHTML = return_text;
    }
}

function selectR_done(){
    let httpRequest = new XMLHttpRequest();
    let resource_text = document.getElementById('resource_text');
    let range = document.getElementById('range');

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            end_window('selectR')
            if(httpRequest.status === 200){

                try{
                    if(myChart.destroy() == undefined){
                        myChart.destroy();
                        myChart_circle.destroy();
                    }    
                }catch(e){
                    
                }
                


                let jsonResponse = JSON.parse(httpRequest.responseText);
                setData_monitor_resource(jsonResponse);
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    let PV_node = document.getElementById('PV');
    let Visits_node = document.getElementById('Visits');
    let UV_node = document.getElementById('UV');
    let PV = false;
    let Visits = false;
    let UV = false;
    
    if(PV_node.style.color == 'white'){PV = true;}
    if(Visits_node.style.color == 'white'){Visits = true;}
    if(UV_node.style.color == 'white'){UV = true;}



    let formObject = {
        "PV" : PV,
        "Visits" : Visits,
        "UV" : UV,
        "range" : range.value,
        "R_ID" : []
    };

    let count = 0;
    resource_text.value = '';
    for(i = 0;i < selectR_data.length;i++){
        if(selectR_data[i].Check){
            count++;
            formObject.R_ID.push(selectR_data[i].R_ID);
            if(count < 6){
                resource_text.value += selectR_data[i].R_Name + ',';
            }
        }
    }

    

    
    httpRequest.open('POST','/backend/monitor/resource/data');
    httpRequest.setRequestHeader('Content-Type','application/json');
    httpRequest.send(JSON.stringify(formObject));
}


function setselectR_data(data){
    selectR_data = data;
    page_update = false;
    selectR_done();
}






/*----------------------------------------------------------------------- */ 

function checkboxAll_Click(node,window,Array){
    let window_node = document.getElementsByClassName(window)[0];
    let input = window_node.getElementsByClassName('input_box');
    if(node.checked){
        for(g = 0;g < Array.length;g++){
            input[g].checked = true;
            Array[g].Check = true;
        }
    }else{
        for(g = 0;g < Array.length;g++){
            input[g].checked = false;
            Array[g].Check = false;
        }
    }
    
    
}

function setCheckbox(bool){
    if(bool){
        return 'checked';
    }else{
        return '';
    }
}

function setAllCheckbox(Array){
    bool = true;
    for(s = 0;s < Array.length;s++){
        if(!Array[s].Check){
            bool = false;
        }
    }

    if(bool){
        return 'checked';
    }else{
        return '';
    }
}

function checkbox_Click(node,n){
    selectR_data[n].Check = node.checked;
}