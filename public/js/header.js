//window.onresize = header_nav_check;

window.addEventListener('resize', function() {
    header_nav_check();
});


function header_nav_check(){
    let nav_item = document.getElementsByClassName('nav-item');
    let nav_num = document.getElementsByClassName('nav-num');
    let logo_name = document.getElementsByTagName('span')[0];
    
    if(window.innerWidth > 768){
        for(i = 0;i<nav_num.length;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            a.setAttribute('class','nav-link nav-link-hover T-title');
            ul.setAttribute('class','nav-link-hover-menu container2');

            
            logo_name.style['display'] = 'inline';
            

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-hover-item T-text');
            }
        }
    }else{
        for(i = 0;i<nav_num.length;i++){
            let a = nav_item[i].getElementsByTagName('a')[0];
            let ul = nav_item[i].getElementsByTagName('ul')[0];
            let ul_a = ul.getElementsByTagName('a');

            if(window.innerWidth > 560){
                logo_name.style['display'] = 'none';
            }

            a.setAttribute('class','nav-link dropdown-toggle T-title');
            ul.setAttribute('class','dropdown-menu container2');

            for(j=0;j<ul_a.length;j++){
                ul_a[j].setAttribute('class','dropdown-item T-text');
            }
        }
    }
}

function getHeader_data(page_name){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status === 200){
                let jsonResponse = JSON.parse(httpRequest.responseText);
                if(jsonResponse.msg == 'dberr'){
                    alert('header資料錯誤');
                }else{
                    setHeader_data(jsonResponse);
                    header_nav_check();
                }
            }else{
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status);
            }
        }
    }
    
    httpRequest.open('POST','/static/header_data');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('Page=' + page_name);
}



function setHeader_data(data){
    //動態nav
    let collapse = document.getElementsByClassName('collapse')[0];
    collapse.innerHTML = '';
    let ul = document.createElement('ul');
    ul.setAttribute('class','navbar-nav me-auto mb-2 mb-md-0');
    let str2 = '';
    for(i = 0;i<data.data.length;i++){
        let str = '';
        
        for(j = 0;j<data.data[i].resource.length;j++){
            str += `<li><a class="dropdown-hover-item" href="#">${data.data[i].resource[j].R_Name}</a></li>`;
            if(data.data[i].resource.length-1  != j){
                str += `<li><hr class="nav-link-hr"></li>`;
            }
        }
        str2 += `
        <li class="nav-item nav-num dropdown">
            <a class="nav-link nav-link-hover" href="#" data-bs-toggle="dropdown" aria-expanded="false">${data.data[i].D_Name}</a>
            <ul class="nav-link-hover-menu">
            ${str}
            </ul>
        </li>`;
    }
    ul.innerHTML = str2;
    collapse.appendChild(ul);





    //語言選擇
    let change_language = document.createElement('ul');
    change_language.setAttribute('class','navbar-nav mb-2 mb-md-0');
    change_language.setAttribute('id','change_language');
    str = '';
    for(i = 0;i<data.lang.length;i++){
        str += `<li><a class="dropdown-item" onclick="setLanguage('${data.lang[i].L_ID}','${data.Page}')">${data.lang[i].L_Name}</a></li>`;
    }
    
    str2 = `<li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" id="language" data-bs-toggle="dropdown" aria-expanded="false">${data.L_Name}</a>
    <ul class="dropdown-menu">
        ${str}
    </ul>
    </li>`;
    change_language.innerHTML = str2;
    collapse.appendChild(change_language);


    //h050被刪掉
    //搜尋框
    let form = document.createElement('div');
    form.setAttribute('class','d-flex container2');
    form.setAttribute('role','search');
    form.innerHTML = `
    <button class="btn btn-outline-light T-text" dsnid="h051" onclick="search_window()" dsnnote="搜尋按鈕" type="submit" style="width:100%">搜尋</button>`;
    collapse.appendChild(form);





    let T_title = document.getElementsByClassName('T-title');
    let T_text = document.getElementsByClassName('T-text');
    for(i = 0;i<T_title.length;i++){
        let dsnid = T_title[i].getAttribute('dsnid');
        for(j = 0;j<data.static_data.length;j++){
            if(dsnid == data.static_data[j].RD_Template_ID){
                T_title[i].innerHTML = data.static_data[j].RD_Content;
            }
        }
    }
    for(i = 0;i<T_text.length;i++){
        let dsnid = T_text[i].getAttribute('dsnid');
        for(j = 0;j<data.static_data.length;j++){
            if(dsnid == data.static_data[j].RD_Template_ID){
                if(dsnid == 'h050' || dsnid == 'h079'){
                    T_text[i].setAttribute('placeholder',data.static_data[j].RD_Content);
                }
                T_text[i].innerHTML = data.static_data[j].RD_Content;
            }
        }
    }
}

function cookie_msg(){
    let cookie_msg = document.getElementsByClassName('cookie_msg')[0];
    let body = document.getElementsByTagName('body')[0];
    if(cookie_msg != undefined){
        cookie_msg.parentElement.removeChild(cookie_msg);
    }else{
        let msg = document.createElement('div');
        msg.setAttribute('class','cookie_msg');
        msg.innerHTML = `
        <div style="text-align: right;margin-bottom:1%"><img onclick="setCookie('delete'),cookie_msg()" src="../img/X.png"></div>
        <p>我們使用Cookie技術提供個人化的服務，提升您的使用體驗，詳細請閱讀我們的<a href="#">《Cookie政策及條款》</a></p>
        <div><button class="no" onclick="setCookie('none'),cookie_msg()">拒絕</button><button class="yes" onclick="setCookie('accept'),cookie_msg()">酷，我接受!</button></div>
        `
        body.appendChild(msg);
    }
}


function url(path){                      //轉送函數
    location.href = path;
}



function Shelf(n){
    if(n == 1){
        return '上架中'
    }else{
        return '下架中'
    }
}


function setCookie(accept){
    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status != 200){
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }
        }
    }
    
    httpRequest.open('POST','/cookie');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('accept=' + accept);
}


function setLanguage(L_ID,Page){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status != 200){
                alert('上傳搜尋資料失敗!','statues code :' + httpRequest.status,'','simple');
            }else{
                getHeader_data(Page);
                switch(Page){
                    case "index" : getIndex_data();
                    case "guideline" : getGuideline_data();
                    case "about_us" : getAbout_us_data();
                    case "cookie_policy" : getCookie_policy_data();
                    case "economy" : getEconomy_data();
                    case "law" : getLaw_data();
                    case "emergency" : getEmergency_data();
                    case "application" : getApplication_data();
                    case "psychology" : getPsychology_data();
                    case "career" : getCareer_data();
                    case "education" : getEducation_data();
                    case "medical" : getMedical_data();
                }
            }
        }
    }
    
    httpRequest.open('POST','/leng');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('L_ID=' + L_ID);
}

/*--------------- search_window ------------------*/ 

function setDistrict(){
    let city = document.getElementById('city').value;
    let district = document.getElementById('district');
    
    district.innerHTML = '';

    let cityDistrictsMap = {
        '不限縣市' : ['不限區'],
        '臺北市': ['中正區', '大同區', '中山區', '松山區', '文山區', '萬華區', '信義區', '松山區', '大安區', '南港區', '內湖區', '士林區', '北投區'],
        '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '汐止區', '樹林區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區','八里區','深坑區','石碇區','坪林區','三芝區','石門區','金山區','萬里區','平溪區','雙溪區','貢寮區','烏來區'],
        '桃園市': ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龜山區', '大園區', '觀音區', '新屋區','龍潭區','復興區'],
        '台中市': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區','和平區'],
        '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
        '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '左營區', '楠梓區', '小港區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
        '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
        '新竹市': ['東區', '北區', '香山區'],
        '新竹縣': ['竹北市', '竹東鎮', '新埔鎮','關西鎮','新豐鄉','峨眉鄉','寶山鄉','五峰鄉','橫山鄉','北埔鄉','尖石鄉','芎林鄉','湖口鄉'],
        '苗栗縣': ['苗栗市', '頭份市', '苑裡鎮', '通霄鎮', '竹南鎮', '後龍鎮', '卓蘭鎮', '大湖鄉', '公館鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '造橋鄉', '三灣鄉', '南庄鄉', '頭屋鄉','獅潭鄉','泰安鄉'],
        '彰化縣': ['彰化市', '員林市', '永靖鄉', '社頭鄉', '埔心鄉', '花壇鄉', '秀水鄉', '大村鄉', '埔鹽鄉', '鹿港鎮', '和美鎮', '線西鄉', '伸港鄉', '福興鄉', '秀水鄉', '大城鄉', '芳苑鄉', '二林鎮', '埔心鄉', '埔鹽鄉', '溪湖鎮', '北斗鎮', '田中鎮', '田尾鄉', '芬園鄉', '二水鄉'],
        '南投縣': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
        '雲林縣': ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '莿桐鄉', '林內鄉', '古坑鄉', '大埤鄉', '崙背鄉', '二崙鄉', '麥寮鄉', '台西鄉', '東勢鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉','褒忠鄉'],
        '嘉義市': ['東區', '西區'],
        '嘉義縣': ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
        '屏東縣': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉','牡丹鄉'],
        '宜蘭縣': ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
        '花蓮縣': ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
        '台東縣': ['台東市', '成功鎮', '關山鎮', '卑南鄉', '大武鄉', '太麻里鄉','東河鄉', '長濱鄉', '鹿野鄉', '池上鄉', '綠島鄉', '延平鄉', '海端鄉', '達仁鄉', '金峰鄉', '蘭嶼鄉'],
        '澎湖縣': ['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉'],
        '金門縣': ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
        '連江縣': ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']
    };

    cityDistrictsMap[city].forEach(function(value) {
        let option = document.createElement('option');
        option.value = value;
        option.text = value;
        district.add(option);
    });
}


function search_window(){
    let search_window = document.getElementsByClassName('search_window')[0];
    let search_blackscreen = document.getElementsByClassName('search_blackscreen')[0];
    
    if(search_window){
        //關閉視窗
        search_window.parentElement.removeChild(search_window);
        search_blackscreen.parentElement.removeChild(search_blackscreen);
    }else{
        let body = document.getElementsByTagName('body')[0];
        let screen = document.createElement('div');
        let window = document.createElement('div');
        screen.setAttribute('class','search_blackscreen');
        window.setAttribute('class','search_window');
        window.innerHTML = `
        <div class="title">
            <img style="float: none;margin-top: -1%;" src="../img/backend/search.png">
            <span>資源搜尋</span>
            <img onclick="search_window()" src="../img/X.png">
        </div>
        <div class="text">
            使用資源搜尋功能，快速找到符合您狀況的資源。選擇您想查詢的條件，並滑動至視窗下方點選搜尋按鈕。
        </div>
        <form>
            <div class="form_section">
                <img src="../img/search/resource.png">
                <span class="type_title">資源種類</span><br>
                <span class="type_des">(複選)選擇資源種類，讓我們提供您要的資訊。</span><br>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="economy"><label for="economy">經濟資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="law"><label for="law">法律資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="emergency"><label for="emergency">緊急資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="education"><label for="education">教育資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="career"><label for="career">職涯資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="medical"><label for="medical">醫療資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="psychology"><label for="psychology">心理資訊</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="application"><label for="application">申請文件資訊</label></span>
            </div>
            <div class="form_section">
                <img src="../img/search/member.png">
                <span class="type_title">申請者身分</span><br>
                <span class="type_des">(複選)每種身分都有屬於他們的資源。</span><br>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">新住民(子女)</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">原住民</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">中/低收入戶</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">就職青年</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">單親家庭</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">身心障礙(子女)</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">特殊境遇家庭</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">暴力/霸凌受害者</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id=""><label for="">懷孕少女</label></span>
            </div>
            <div class="form_section">
                <img src="../img/search/school.png">
                <span class="type_title">在學狀況</span><br>
                <span class="type_des">(單選)學校有許多資源讓我們去申請，讓我們知道你現在的在學狀況。</span><br>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">國小</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">國中</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">高中</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">大學</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">研究所</label></span>
                <span class="checkbox-span"><input class="form-check-input" type="checkbox" id="" ><label for="">畢業就學</label></span>
            </div>
            <div class="form_section">
                <img src="../img/search/location.png">
                <span class="type_title">申請者地區</span>
                <span class="type_des">有些資源有地區限制。</span><br>
                <div class="row">
                    <div class="col form-floating">
                        <select class="form-select" id="city" onchange="setDistrict()">
                            <option value="不限縣市">不限縣市</option>
                            <option value="臺北市">臺北市</option>
                            <option value="新北市">新北市</option>
                            <option value="基隆市">基隆市</option>
                            <option value="新竹市">新竹市</option>
                            <option value="桃園市">桃園市</option>
                            <option value="新竹縣">新竹縣</option>
                            <option value="宜蘭縣">宜蘭縣</option>
                            <option value="臺中市">臺中市</option>
                            <option value="苗栗縣">苗栗縣</option>
                            <option value="彰化縣">彰化縣</option>
                            <option value="南投縣">南投縣</option>
                            <option value="雲林縣">雲林縣</option>
                            <option value="高雄市">高雄市</option>
                            <option value="臺南市">臺南市</option>
                            <option value="嘉義市">嘉義市</option>
                            <option value="嘉義縣">嘉義縣</option>
                            <option value="屏東縣">屏東縣</option>
                            <option value="澎湖縣">澎湖縣</option>
                            <option value="花蓮縣">花蓮縣</option>
                            <option value="臺東縣">臺東縣</option>
                            <option value="金門縣">金門縣</option>
                            <option value="連江縣">連江縣</option>
                        </select>
                        <label class="floatingSelect" for="city">申請者戶籍縣市</label>
                    </div>
                    
                    <div class="col form-floating">
                        <select class="form-select" id="district"><option>不限區</option></select>
                        <label class="floatingSelect" for="district">申請者戶籍行政區</label>
                    </div>
                </div>
            </div>
            <div class="btn_area"><button class="btn btn-primary btn-lg">查詢</button></div>
        </form>
        `;
        body.appendChild(screen);
        body.appendChild(window);
    }
}



