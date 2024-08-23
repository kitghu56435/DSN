let myChart = null;
let myChart_circle = null;


function clickAction_Btn(node){
    if(node.style.color == 'white'){
        node.setAttribute('style','');
    }else{
        node.setAttribute('style','color:white;background-color:#4F4F4F');
    }
}

function clickAction_Btn_Single(node){
    let PV = document.getElementById('PV');
    let UV = document.getElementById('UV');
    let UVisits = document.getElementById('UVisits');

    PV.setAttribute('style','');
    UV.setAttribute('style','');
    UVisits.setAttribute('style','');

    if(node.style.color == 'white'){
        node.setAttribute('style','');
    }else{
        node.setAttribute('style','color:white;background-color:#4F4F4F');
    }
}

function setSearch_data(data){
    const ctx = document.getElementById('chart');
    const circle = document.getElementById('circle');
    const search_record = document.getElementsByClassName('search_record')[0];
    let str = '';
    let labels = [];
    let datasets = [];
    let labels_pie = [];
    let datasets_pie = [];


    

    if(data.PV.length != 0){
        labels = data.PV.map(row => row.label);
        datasets.push({
            label: '搜尋累計數量',
            data: data.PV.map(row => row.count),
        })
    }
    if(data.UVisits.length != 0){
        labels = data.UVisits.map(row => row.label);
        datasets.push({
            label: '搜尋重複數量',
            data: data.UVisits.map(row => row.count),
        })
    }
    if(data.UV.length != 0){
        labels = data.UV.map(row => row.label);
        datasets.push({
            label: '不重複搜尋數量',
            data: data.UV.map(row => row.count),
        })
    }
    
    
    myChart_circle = myChart = new Chart(
        ctx,
        {
            type: 'line',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: labels,
                datasets: datasets
            }
        }
    );

    if(data.pie != undefined){
        labels_pie = data.pie.map(row => row.name);
        datasets_pie.push({
            label: '累計資訊種類比例',
            data: data.pie.map(row => row.count),
        })

        myChart_circle = new Chart(
            circle,
            {
                type: 'pie',
                options: {
                    maintainAspectRatio:false,
                },
                data: {
                    labels: labels_pie,
                    datasets: datasets_pie
                }
            }
        );
    }
    
    
    

    if(data.Record != undefined){
        str = '<tr><th style="width:33%">搜尋時間</th><th style="width:33%">需求參數</th><th style="width:34%">狀況參數</th></tr>';
        if(data.Record.length == 0){
            str += '<td colspan="3">無資料</td>'
        }else{
            for(i = 0;i<data.Record.length;i++){
                str += `<tr><td>${data.Record[i].SR_Time}</td><td>${data.Record[i].SR_Demand}</td><td>${data.Record[i].SR_Condition}</td></tr>`;
            }
        }
        
        search_record.innerHTML = str;
    }
    
}


function getSearch_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                myChart.destroy();
                
                if(jsonResponse.msgbox != ''){
                    msgbox(1,'資料庫錯誤');
                }else{
                    setSearch_data(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }

    let PV_node = document.getElementById('PV');
    let UVisits_node = document.getElementById('UVisits');
    let UV_node = document.getElementById('UV');
    let time_range = document.getElementById('time_range').value;
    let PV = false;
    let UVisits = false;
    let UV = false;
    
    if(PV_node.style.color == 'white'){PV = true;}
    if(UVisits_node.style.color == 'white'){UVisits = true;}
    if(UV_node.style.color == 'white'){UV = true;}


    
    httpRequest.open('POST','/backend/search/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('PV=' + PV + '&UVisits=' + UVisits + '&UV=' + UV  + '&time_range=' + time_range);
}



let Chart_city = null;
let Chart_demand = null;
let Chart_identity = null;
let Chart_condition = null;
let Chart_school = null;

function setSearch_proportion(data){
    const city_pie = document.getElementById('city_pie');
    const demand_pie = document.getElementById('demand_pie');
    const identity_pie = document.getElementById('identity_pie');
    const condition_pie = document.getElementById('condition_pie');
    const school_pie = document.getElementById('school_pie');
    
    let city_labels_pie = [];
    let city_datasets_pie = [];
    let demand_labels_pie = [];
    let demand_datasets_pie = [];
    let identity_labels_pie = [];
    let identity_datasets_pie = [];
    let condition_labels_pie = [];
    let condition_datasets_pie = [];
    let school_labels_pie = [];
    let school_datasets_pie = [];


    if(data.Demand_PV.length != 0){
        city_labels_pie = data.City_PV.map(row => row.name);
        city_datasets_pie.push({
            label: '搜尋累計數量',
            data: data.City_PV.map(row => row.count),
        })
        demand_labels_pie = data.Demand_PV.map(row => row.name);
        demand_datasets_pie.push({
            data: data.Demand_PV.map(row => row.count),
        })
        identity_labels_pie = data.Identity_PV.map(row => row.name);
        identity_datasets_pie.push({
            data: data.Identity_PV.map(row => row.count),
        })
        condition_labels_pie = data.Condition_PV.map(row => row.name);
        condition_datasets_pie.push({
            data: data.Condition_PV.map(row => row.count),
        })
        school_labels_pie = data.School_PV.map(row => row.name);
        school_datasets_pie.push({
            data: data.School_PV.map(row => row.count),
        })
    }
    if(data.Demand_UV.length != 0){
        city_labels_pie = data.City_UV.map(row => row.name);
        city_datasets_pie.push({
            label: '搜尋累計數量',
            data: data.City_UV.map(row => row.count),
        })
        demand_labels_pie = data.Demand_UV.map(row => row.name);
        demand_datasets_pie.push({
            data: data.Demand_UV.map(row => row.count),
        })
        identity_labels_pie = data.Identity_UV.map(row => row.name);
        identity_datasets_pie.push({
            data: data.Identity_UV.map(row => row.count),
        })
        condition_labels_pie = data.Condition_UV.map(row => row.name);
        condition_datasets_pie.push({
            data: data.Condition_UV.map(row => row.count),
        })
        school_labels_pie = data.School_UV.map(row => row.name);
        school_datasets_pie.push({
            data: data.School_UV.map(row => row.count),
        })
    }
    if(data.Demand_UVisits.length != 0){
        city_labels_pie = data.City_UVisits.map(row => row.name);
        city_datasets_pie.push({
            label: '搜尋累計數量',
            data: data.City_UVisits.map(row => row.count),
        })
        demand_labels_pie = data.Demand_UVisits.map(row => row.name);
        demand_datasets_pie.push({
            data: data.Demand_UVisits.map(row => row.count),
        })
        identity_labels_pie = data.Identity_UVisits.map(row => row.name);
        identity_datasets_pie.push({
            data: data.Identity_UVisits.map(row => row.count),
        })
        condition_labels_pie = data.Condition_UVisits.map(row => row.name);
        condition_datasets_pie.push({
            data: data.Condition_UVisits.map(row => row.count),
        })
        school_labels_pie = data.School_UVisits.map(row => row.name);
        school_datasets_pie.push({
            data: data.School_UVisits.map(row => row.count),
        })
    }

    
    if(demand_labels_pie.length == 0){
        msgbox(1,'查無資料')
    }
    
    
    Chart_city = new Chart(
        city_pie,
        {
            type: 'bar',
            options: {
            maintainAspectRatio:false,
            },
            data: {
                labels: city_labels_pie,
                datasets: city_datasets_pie
            }
        }
    );     
    
    
    
    Chart_demand = new Chart(
        demand_pie,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: demand_labels_pie,
                datasets: demand_datasets_pie
            }
        }
    );

    Chart_identity = new Chart(
        identity_pie,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: identity_labels_pie,
                datasets: identity_datasets_pie
            }
        }
    );

    Chart_condition = new Chart(
        condition_pie,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: condition_labels_pie,
                datasets: condition_datasets_pie
            }
        }
    );

    Chart_school = new Chart(
        school_pie,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: school_labels_pie,
                datasets: school_datasets_pie
            }
        }
    );
}

function getSearch_proportion(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                Chart_city.destroy();
                Chart_demand.destroy();
                Chart_identity.destroy();
                Chart_condition.destroy();
                Chart_school.destroy();
                
                if(jsonResponse.msgbox != ''){
                    msgbox(1,'資料庫錯誤');
                }else{
                    setSearch_proportion(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }

    let PV_node = document.getElementById('PV');
    let UVisits_node = document.getElementById('UVisits');
    let UV_node = document.getElementById('UV');
    let time_range = document.getElementById('time_range').value;
    let PV = false;
    let UVisits = false;
    let UV = false;
    
    if(PV_node.style.color == 'white'){PV = true;}
    if(UVisits_node.style.color == 'white'){UVisits = true;}
    if(UV_node.style.color == 'white'){UV = true;}


    
    httpRequest.open('POST','/backend/search/proportion/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('PV=' + PV + '&UVisits=' + UVisits + '&UV=' + UV  + '&time_range=' + time_range);
}


function setSearch_record(data){
    let number = document.getElementById('number');
    let table_content = document.getElementsByClassName('table_content')[0];
    let date_start = document.getElementById('date_start');
    let date_end = document.getElementById('date_end');
    date_start.value = data.today_start;
    date_end.value = data.today_end;

    let str = `<tr>
        <th style="width:15%">搜尋時間</th>
        <th style="width:15%">資源種類</th>
        <th style="width:10%">申請者身分</th>
        <th style="width:10%">申請者狀況</th>
        <th style="width:10%">在學狀況</th>
        <th style="width:10%">申請者地區</th>
    </tr>`;

    if(data != undefined){
        number.innerHTML = '數量：' + data.record.length;
        for(i = 0;i < data.record.length;i++){
            str += `
            <tr>
                <td>
                ${data.record[i].SR_Date}<br>
                ${data.record[i].SR_Time}
                </td>
                <td>${data.record[i].SR_Demand}</td>
                <td>${data.record[i].SR_Identity}</td>
                <td>${data.record[i].SR_Condition}</td>
                <td>${data.record[i].SR_School}</td>
                <td>${SR_City(data.record[i].SR_City)}${data.record[i].SR_District}</td>
            </tr>`;
        }

        if(data.record.length == 0){
            str += `<tr>
                <td colspan="6">查無搜尋紀錄</td>
            </tr>`;
        }
    }

    table_content.innerHTML = str;

}


function getSearch_record(){
    let date_start = document.getElementById('date_start').value;
    let date_end = document.getElementById('date_end').value;
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msgbox != ''){
                    msgbox(1,'資料庫錯誤');
                }else{
                    setSearch_record(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }

    
    httpRequest.open('POST','/backend/search/record/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('date_start=' + date_start + '&date_end=' + date_end);

}


function SR_City(str){
    if(str == ''){
        return '不限市'
    }else{
        return str;
    }
}