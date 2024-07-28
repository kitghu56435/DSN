


function clickAction_Btn(node){
    if(node.style.color == 'white'){
        node.setAttribute('style','');
    }else{
        node.setAttribute('style','color:white;background-color:#4F4F4F');
    }
}


function setData_monitor(data){
    const ctx = document.getElementById('chart');
    let datasets = [];
    let labels = ["0am","1am","2am","3am","4am","5am","6am","7am","8am","9am",
        "10am","11am","12pm","13pm","14pm","15pm","16pm","17pm","18pm","19pm",
        "20pm","21pm","22pm","23pm"
    ];
    if(data.PV){
        labels = data.PV.map(row => row.label);
        datasets.push({
            label: '訪客累計數量',
            data: data.PV.map(row => row.count),
        })
    }
    if(data.Visits){
        labels = data.Visits.map(row => row.label);
        datasets.push({
            label: '訪客造訪數量',
            data: data.Visits.map(row => row.count),
        })
    }
    if(data.UV){
        labels = data.UV.map(row => row.label);
        datasets.push({
            label: '不重複訪客數量',
            data: data.UV.map(row => row.count),
        })
    }


    




    
    new Chart(
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

function getMonitor_data(){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                
                if(jsonResponse.msgbox == 'dberr'){
                    msgbox(1,'資料庫錯誤');
                }else{
                    console.log('good')
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





function setData_monitor_costomer(){
    const ctx = document.getElementById('chart');

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
            type: 'line',
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


function setData_monitor_resource(){
    const ctx = document.getElementById('chart');
    const c = document.getElementById('circle');

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
        c,
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
