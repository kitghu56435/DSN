//寫道這

function setData_search(){
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


function setData_search_data(){
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