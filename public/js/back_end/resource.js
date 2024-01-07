

function show_feedback(n){
    let msg_text = document.getElementsByClassName('msg_text')[n];  //padding:2%;
    let msg_title = document.getElementsByClassName('msg_title')[n];  //padding:2%;
    let text = msg_title.getElementsByClassName('text')[0]; 
    let div = msg_text.getElementsByTagName('div')[0];     //padding:1%;

    if(msg_text.style['padding'] == '2%'){
        msg_text.setAttribute('style','padding:0%;height:0');
        div.setAttribute('style','padding:0%;height:0');
        text.setAttribute('style',' opacity: 1;');
    }else{
        msg_text.setAttribute('style','padding:2%;height:auto;');
        div.setAttribute('style','padding:1%;height:auto;');
        text.setAttribute('style',' opacity: 0;');
    }

}




function setResource(data){
    let d_table_div = document.getElementsByClassName('d_table')[0];
    let d_table = d_table_div.getElementsByTagName('table')[0];
    let t_table_div = document.getElementsByClassName('t_table')[0];
    let t_table = t_table_div.getElementsByTagName('table')[0];
    let str = '';

    if(data == undefined){
        d_table.innerHTML = `
        <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
        t_table.innerHTML = `
        <tr><th>模板名稱</th><th>使用數量</th></tr>
        <tr><td colspan="2">無資料</td></tr>`;
    }else{
        if(data.Demand.length == 0){
            d_table.innerHTML = `
            <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>需求名稱</th><th>需求資源數</th><th>上架數量</th><th>下架數量</th><th>刪除</th></tr>`;
            for(i = 0;i<data.Demand.length;i++){
                str += `<tr><td>${data.Demand[i].D_Name}</td><td>${data.Demand[i].D_Resource}</td><td>${data.Demand[i].D_On_Shelf}</td><td>${data.Demand[i].D_Down_Shelf}</td><td><img src="../../img/bin.png"></td></tr>`
            }
            d_table.innerHTML = str;
        }


        if(data.Template.length == 0){
            str.innerHTML = `
            <tr><th>模板名稱</th><th>使用數量</th></tr>
            <tr><td colspan="2">無資料</td></tr>`;
        }else{
            str = `
            <tr><th>模板名稱</th><th>使用數量</th></tr>`;
            for(i = 0;i<data.Template.length;i++){
                str += `<tr><td>${data.Template[i].T_Name}</td><td>${data.Template[i].T_Use}</td></tr>`
            }
            t_table.innerHTML = str;
        }
        
    }
}




function setDemand(data){
    let r_table_div = document.getElementsByClassName('r_table')[0];
    let r_table = r_table_div.getElementsByTagName('table')[0];
    let str = '';
    
    if(data == undefined){
        r_table.innerHTML = `
        <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>
        <tr><td colspan="5">無資料</td></tr>`;
    }else{
        if(data.length == 0){
            r_table.innerHTML = `
            <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>
            <tr><td colspan="5">無資料</td></tr>`;
        }else{
            str = `
            <tr><th style="width:30%">資源名稱</th><th style="width:15%">套用模板</th><th style="width:15%">資源狀態</th><th style="width:30%">上次更新</th><th style="width:10%">刪除</th></tr>`;
            for(i = 0;i<data.length;i++){
                str += `<tr><td>${data[i].R_Name}</td><td>${data[i].T_Name}</td><td>${Shelf(data[i].R_Shelf)}</td><td>${data[i].R_Update}</td><td><img src="../../img/bin.png"></td></tr>`
            }
            r_table.innerHTML = str;
        }
    }
}









