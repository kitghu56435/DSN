
let myChart = null;
let myChart_circle = null;

function clickAction_Btn(node){
    if(node.style.color == 'white'){
        node.setAttribute('style','');
    }else{
        node.setAttribute('style','color:white;background-color:#4F4F4F');
    }
}


function setData_monitor(data){
    let ctx = document.getElementById('chart');
    let table_rank = document.getElementById('table_rank');
    let labels = [];
    let str = '';
    let datasets = [];

    
    
    if(data.PV.length != 0){
        labels = data.PV.map(row => row.label);
        datasets.push({
            label: '訪客累計數量',
            data: data.PV.map(row => row.count),
        })
    }
    if(data.Visits.length != 0){
        labels = data.Visits.map(row => row.label);
        datasets.push({
            label: '訪客造訪數量',
            data: data.Visits.map(row => row.count),
        })
    }
    if(data.UV.length != 0){
        labels = data.UV.map(row => row.label);
        datasets.push({
            label: '不重複訪客數量',
            data: data.UV.map(row => row.count),
        })
    }


    //布置chirt    
    myChart = new Chart(
        ctx,
        {
            type: 'line',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    // legend: {
                    //     display: false
                    // },
                    // tooltip: {
                    //     enabled: false
                    // }
                }
            },
            data: {
                labels: labels,
                datasets: datasets
            }
        }
    );

    if(data.Resource_ranking != undefined){
        str = '<tr><th style="width:20%">資源排名</th><th style="width:28%">資源名稱</th><th style="width:28%">資源種類</th><th style="width:24%">造訪數</th></tr>';
        if(data.Resource_ranking.length == 0){
            str += '<td colspan="4">無資料</td>'
        }else{
            for(i = 0;i<data.Resource_ranking.length;i++){
                str += `<tr><td>${data.Resource_ranking[i].rank}</td><td>${data.Resource_ranking[i].R_Name}</td><td>${data.Resource_ranking[i].D_Name}</td><td>${data.Resource_ranking[i].count}</td></tr>`;
            }
        }
        
        table_rank.innerHTML = str;
    }
    

}

function getMonitor_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                myChart.destroy();
                
                if(jsonResponse.msgbox != ''){
                    msgbox(1,'資料庫錯誤');
                }else{
                    setData_monitor(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }

    let PV_node = document.getElementById('PV');
    let Visits_node = document.getElementById('Visits');
    let UV_node = document.getElementById('UV');
    let time_range = document.getElementById('time_range').value;
    let PV = false;
    let Visits = false;
    let UV = false;
    
    if(PV_node.style.color == 'white'){PV = true;}
    if(Visits_node.style.color == 'white'){Visits = true;}
    if(UV_node.style.color == 'white'){UV = true;}


    
    httpRequest.open('POST','/backend/monitor/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('PV=' + PV + '&Visits=' + Visits + '&UV=' + UV  + '&time_range=' + time_range);
}


function setData_monitor_costomer(data){
    const ctx = document.getElementById('chart');
    let labels = [];
    let datasets = [];


    if(data.PV_Count == -1){
        setData_block(0,'--');
    }else{
        setData_block(0,data.PV_Count);
    }

    if(data.PV_Count_percentage == -1){
        setData_block(6,'--');
    }else{
        setData_block(6,data.PV_Count_percentage + '%');
    }

    if(data.Visits_Count == -1){
        setData_block(1,'--');
    }else{
        setData_block(1,data.Visits_Count);
    }

    if(data.Visits_Count_percentage == -1){
        setData_block(7,'--');
    }else{
        setData_block(7,data.Visits_Count_percentage + '%');
    }

    if(data.UV_Count == -1){
        setData_block(2,'--');
    }else{
        setData_block(2,data.UV_Count);
    }

    if(data.UV_Count_percentage == -1){
        setData_block(8,'--');
    }else{
        setData_block(8,data.UV_Count_percentage + '%');
    }


    if(data.PV_Average == -1){
        setData_block(3,'--');
    }else{
        setData_block(3,data.PV_Average);
    }

    if(data.PV_Average_percentage == -1){
        setData_block(9,'--');
    }else{
        setData_block(9,data.PV_Average_percentage + '%');
    }


    if(data.Visits_Average == -1){
        setData_block(4,'--');
    }else{
        setData_block(4,data.Visits_Average);
    }

    if(data.Visits_Average_percentage == -1){
        setData_block(10,'--');
    }else{
        setData_block(10,data.Visits_Average_percentage + '%');
    }


    if(data.UV_Average == -1){
        setData_block(5,'--');
    }else{
        setData_block(5,data.UV_Average);
    }

    if(data.UV_Average_percentage == -1){
        setData_block(11,'--');
    }else{
        setData_block(11,data.UV_Average_percentage + '%');
    }

    
    
    if(data.PV.length != 0){
        labels = data.PV.map(row => row.label);
        datasets.push({
            label: '訪客累計數量',
            data: data.PV.map(row => row.count),
        })
    }
    if(data.Visits.length != 0){
        labels = data.Visits.map(row => row.label);
        datasets.push({
            label: '訪客造訪數量',
            data: data.Visits.map(row => row.count),
        })
    }
    if(data.UV.length != 0){
        labels = data.UV.map(row => row.label);
        datasets.push({
            label: '不重複訪客數量',
            data: data.UV.map(row => row.count),
        })
    }
    
    
    myChart = new Chart(
        ctx,
        {
            type: 'line',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    // legend: {
                    //     display: false
                    // },
                    // tooltip: {
                    //     enabled: false
                    // }
                }
            },
            data: {
                labels: labels,
                datasets: datasets
            }
        }
    );
    
}


function getMonitor_costomer_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                myChart.destroy();
                
                if(jsonResponse.msgbox != ''){
                    msgbox(1,'資料庫錯誤');
                }else{
                    console.log(jsonResponse)
                    setData_monitor_costomer(jsonResponse);
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }

    let PV_node = document.getElementById('PV');
    let Visits_node = document.getElementById('Visits');
    let UV_node = document.getElementById('UV');
    let time_range = document.getElementById('time_range').value;
    let PV = false;
    let Visits = false;
    let UV = false;
    
    if(PV_node.style.color == 'white'){PV = true;}
    if(Visits_node.style.color == 'white'){Visits = true;}
    if(UV_node.style.color == 'white'){UV = true;}


    
    httpRequest.open('POST','/backend/monitor/costomer/data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('PV=' + PV + '&Visits=' + Visits + '&UV=' + UV  + '&time_range=' + time_range);
}


function setData_monitor_resource(data){
    const ctx = document.getElementById('chart');
    const circle = document.getElementById('circle');
    let table_rank = document.getElementsByClassName('table_rank')[0];
    let datasets = [];
    let circle_datasets = [];
    let labels = [];


    console.log(data.UV)


    if(data.PV.length != 0){
        labels = data.PV.map(row => row.R_Name);
        datasets.push({
            "label": '累計數量',
            "data": data.PV.map(row => row.Count),
        })
        circle_datasets.push({
            "label": '累計數量',
            "data": data.PV.map(row => row.Count),
        })

        if(data.Visits.length != 0){
            data.Visits = twoArrarysort(data.PV,data.Visits,'R_ID');
        }
        if(data.UV.length != 0){
            data.UV = twoArrarysort(data.PV,data.UV,'R_ID');
        }
    }
    if(data.Visits.length != 0){
        labels = data.Visits.map(row => row.R_Name);
        datasets.push({
            label: '造訪數量',
            data: data.Visits.map(row => row.Count),
        })
        if(data.PV.length == 0){
            if(data.UV.length != 0){
                data.UV = twoArrarysort(data.Visits,data.UV,'R_ID');
            }
        }
    }
    if(data.UV.length != 0){
        labels = data.UV.map(row => row.R_Name);
        datasets.push({
            label: '不重複數量',
            data: data.UV.map(row => row.Count),
        })
    }

    console.log(data)
    
    

    
    myChart = new Chart(
        ctx,
        {
            type: 'bar',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: labels,
                datasets: datasets
            }
        }
    );

    myChart_circle = new Chart(
        circle,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
            },
            data: {
                labels: labels,
                datasets: circle_datasets
            }
        }
    );
    let str = '<tr><th style="width:23%">排名</th><th style="width:48%">資源名稱</th><th style="width:29%">累積數</th></tr>';
    for(i = 0;i < data.Rank.length; i++){
        str += `<tr><td>${data.Rank[i].rank}</td><td>${data.Rank[i].R_Name}</td><td>${data.Rank[i].count}</td></tr>`;
    }
    table_rank.innerHTML = str;
}



function twoArrarysort(array1,array2,key){
    let new_array = []

    
    for(h = 0 ; h < array1.length;h++ ){
        for(k = 0 ;k < array2.length;k++){
            if(array1[h][key] == array2[k][key]){
                new_array.push(array2[k])
                break;
            }
        }
    }
    return new_array;
}






