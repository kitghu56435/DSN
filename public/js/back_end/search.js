let myChart = null;
let myChart_circle = null;


function clickAction_Btn(node){
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


function setSearch_proportion(){
    const ctx = document.getElementById('chart');
    const c1 = document.getElementById('circle1');
    const c2 = document.getElementById('circle2');
    const c3 = document.getElementById('circle3');
    const c4 = document.getElementById('circle4');
    
    const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
        { year: 2017, count: 28 },
        { year: 2018, count: 28 },
        { year: 2019, count: 28 },
    ];
    
    
    new Chart(
        ctx,
        {
            type: 'bar',
            options: {
            maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            data: {
                labels: data.map(row => row.year),
                datasets: [
                {
                    label: 'Acquisitions by year',
                    data: data.map(row => row.count)
                }
                ]
            }
        }
    );
    
    
    new Chart(
        c1,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            data: {
                labels: data.map(row => row.year),
                datasets: [
                    {
                        label: 'Acquisitions by year',
                        data: data.map(row => row.count)
                    }
                ]
            }
        }
    );

    new Chart(
        c2,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            data: {
                labels: data.map(row => row.year),
                datasets: [
                    {
                        label: 'Acquisitions by year',
                        data: data.map(row => row.count)
                    }
                ]
            }
        }
    );

    new Chart(
        c3,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            data: {
                labels: data.map(row => row.year),
                datasets: [
                    {
                        label: 'Acquisitions by year',
                        data: data.map(row => row.count)
                    }
                ]
            }
        }
    );

    new Chart(
        c4,
        {
            type: 'pie',
            options: {
                maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            data: {
                labels: data.map(row => row.year),
                datasets: [
                    {
                        label: 'Acquisitions by year',
                        data: data.map(row => row.count)
                    }
                ]
            }
        }
    );
}