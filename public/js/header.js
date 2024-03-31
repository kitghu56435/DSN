//window.onresize = header_nav_check;

window.addEventListener('resize', function() {
    header_nav_check();
});

let catalogue_page = ['economy','emergency','law','education','career','medical','psychology','application'];
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
            a.setAttribute('onclick',`url('/static/${catalogue_page[i]}')`);
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
            a.setAttribute('onclick','');
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
            str += `<li><a class="dropdown-hover-item" style="white-space: normal;" href="/resource?ID=${data.data[i].resource[j].R_ID}">${data.data[i].resource[j].R_Name}</a></li>`;
            if(data.data[i].resource.length-1  != j){
                str += `<li><hr class="nav-link-hr"></li>`;
            }
        }
        str2 += `
        <li class="nav-item nav-num dropdown">
            <a class="nav-link nav-link-hover" href="#" onclick="url('/static/${catalogue_page[i]}')" data-bs-toggle="dropdown" aria-expanded="false">${data.data[i].D_Name}</a>
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
    let str = '';
    for(i = 0;i<data.lang.length;i++){
        str += `<li><a class="dropdown-item" onclick="setLanguage('${data.lang[i].L_ID}','${data.Page}'),setSearch_window_L_ID('${data.lang[i].L_ID}')">${data.lang[i].L_Name}</a></li>`;
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
                    case "index" : getIndex_data(); break;
                    case "guideline" : getGuideline_data(); break;
                    case "about_us" : getAbout_us_data(); break;
                    case "cookie_policy" : getCookie_policy_data(); break;
                    case "economy" : getEconomy_data(); break;
                    case "law" : getLaw_data(); break;
                    case "emergency" : getEmergency_data(); break;
                    case "application" : getApplication_data(); break;
                    case "psychology" : getPsychology_data(); break;
                    case "career" : getCareer_data(); break;
                    case "education" : getEducation_data(); break;
                    case "medical" : getMedical_data(); break;
                    case "search" : getSearch_data(); break;
                    case "search_results" : getSearch_results_data(); break;
                    case "notfound" : getNotFound(); break;
                    default : getTemplate_data(Page);break; //資源頁面
                }
            }
        }
    }
    
    httpRequest.open('POST','/leng');
    httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    httpRequest.send('L_ID=' + L_ID);
}

/*--------------- search_window ------------------*/ 

let search_window_L_ID = 'L000000001';  //預設是英文搜尋彈跳視窗

function setSearch_window_L_ID(L_ID){
    search_window_L_ID = L_ID;
}

function check_search_data(){
    let demand = document.getElementsByName('demand');
    let aa = document.getElementById('aa');
    let data_form = document.getElementById('data_form');
    let checked = false;
    for(i = 0;i < demand.length;i++){
        if(demand[i].checked){
            checked = true
            break;
        }        
    }
    
    if(checked){
        data_form.submit();
    }else{
        aa.click();
        alert('請至少選一種資源種類');
        
    }
}

function setDistrict(){
    let city = document.getElementsByName('R_City');
    let district = document.getElementsByClassName('district');
    
    
    let cityDistrictsMap = {};
    
    if(search_window_L_ID == 'L000000001'){
        cityDistrictsMap = {
            'A0' : ['不限區'],  
            'A1': ['中正區', '大同區', '中山區', '文山區', '萬華區', '信義區', '松山區', '大安區', '南港區', '內湖區', '士林區', '北投區'],
            'A2': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '汐止區', '樹林區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區','八里區','深坑區','石碇區','坪林區','三芝區','石門區','金山區','萬里區','平溪區','雙溪區','貢寮區','烏來區'],
            'A3': ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龜山區', '大園區', '觀音區', '新屋區','龍潭區','復興區'],
            'A4': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區','和平區'],
            'A5': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
            'A6': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '左營區', '楠梓區', '小港區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
            'A7': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
            'A8': ['東區', '北區', '香山區'],
            'A9': ['竹北市', '竹東鎮', '新埔鎮','關西鎮','新豐鄉','峨眉鄉','寶山鄉','五峰鄉','橫山鄉','北埔鄉','尖石鄉','芎林鄉','湖口鄉'],
            'B1': ['苗栗市', '頭份市', '苑裡鎮', '通霄鎮', '竹南鎮', '後龍鎮', '卓蘭鎮', '大湖鄉', '公館鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '造橋鄉', '三灣鄉', '南庄鄉', '頭屋鄉','獅潭鄉','泰安鄉'],
            'B2': ['彰化市', '員林市', '永靖鄉', '社頭鄉', '埔心鄉', '花壇鄉', '大村鄉', '埔鹽鄉', '鹿港鎮', '和美鎮', '線西鄉', '伸港鄉', '福興鄉', '秀水鄉', '大城鄉', '芳苑鄉', '二林鎮', '埔心鄉', '埔鹽鄉', '溪湖鎮', '北斗鎮', '田中鎮', '田尾鄉', '芬園鄉', '二水鄉'],
            'B3': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
            'B4': ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '莿桐鄉', '林內鄉', '古坑鄉', '大埤鄉', '崙背鄉', '二崙鄉', '麥寮鄉', '臺西鄉', '東勢鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉','褒忠鄉'],
            'B5': ['東區', '西區'],
            'B6': ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
            'B7': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉','牡丹鄉'],
            'B8': ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
            'B9': ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
            'C1': ['台東市', '成功鎮', '關山鎮', '卑南鄉', '大武鄉', '太麻里鄉','東河鄉', '長濱鄉', '鹿野鄉', '池上鄉', '綠島鄉', '延平鄉', '海端鄉', '達仁鄉', '金峰鄉', '蘭嶼鄉'],
            'C2': ['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉'],
            'C3': ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
            'C4': ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']
        }
    }else if(search_window_L_ID == 'L000000002'){
        cityDistrictsMap = {
            'A0' : ['Not limited'],  
            'A1': ['Zhongzheng', 'Datong', 'Zhongshan', 'Wenshan', 'Wanhua', 'Xinyi', 'Songshan', 'Da’an', 'Nangang', 'Neihu', 'Shilin', 'Beitou'],
            'A2': ['Banqiao', 'Sanchong', 'Zhonghe', 'Yonghe', 'Xinzhuang', 'Xindian', 'Tucheng', 'Luzhou', 'Xizhi', 'Shulin', 'Y ingge', 'Sanxia', 'Tamsui ', 'Ruifang', 'Wugu', 'Taishan', 'Linkou','Bali','Shenkeng','Shiding','Pinglin','Sanzhi','Shimen','Jinshan','W anli','Pingxi','Shuangxi','Gongliao','Wulai'],
            'A3': ['Taoyuan', 'Zhongli', 'Pingzhen', 'Bade', 'Yangmei', 'Luzhu', 'Daxi', 'Guishan', 'Dayuan', 'Guanyin', 'Xinwu','Longtan','Fuxing'],
            'A4': ['Central', 'East', 'South', 'West', 'North', 'Beitun', 'Xitun', 'Nantun', 'Taiping', 'Dali', 'Wufeng', 'Wuri', 'Fengyuan', 'Houli', 'Shigang', 'Dongshi', 'Xinshe', 'Tanzi', 'Daya', 'Shengang', 'Dadu', 'Shalu', 'Longjing', 'Wuqi', 'Qingshui', 'Dajia', 'Waipu', 'Da’an','Heping'],
            'A5': ['West Central', 'East', 'South', 'North', 'Anping', 'Annan', 'Yongkang', 'Guiren', 'Xinhua', 'Zuozhen', 'Yujing', 'Nanxi', 'Nanhua', 'Rende', 'Guanmiao', 'Guanmiao', 'Guantian', 'Madou', 'Jiali', 'Xigang', 'Qigu', 'Jiangjun', 'Xuejia', 'Beimen', 'Xinying', 'Houbi', 'Baihe', 'Dongshan', 'Liujia', 'Xiaying', 'Liuying', 'Yanshui', 'Shanhua', 'Danei', 'Shanshang', 'Xinshi', 'Anding'],
            'A6': ['Xinxing', 'Qianjin', 'Lingya', 'Yancheng', 'Gushan', 'Qijin', 'Qianzhen', 'Sanmin', 'Zuoying', 'Nanzi', 'Xiaogang', 'Renwu', 'Dashe', 'Gangshan', 'Luzhu', 'Alian', 'Alian', 'Yanchao', 'Qiaotou', 'Ziguan', 'Mituo', 'Yong’an', 'Hunei', 'Fengshan', 'Daliao', 'Linyuan', 'Niaosong', 'Dashu', 'Qishan', 'Meinong', 'Liugui', 'Neimen', 'Shanlin', 'Jiaxian', 'Taoyuan', 'Namaxia', 'Maolin', 'Qieding'],
            'A7': ['Ren’ai', 'Xinyi', 'Zhongzheng', 'Zhongshan', 'Anle', 'Nuannuan', 'Qidu'],
            'A8': ['East', 'North', 'Xiangshan'],
            'A9': ['Zhubei', 'Zhudong', 'Xinpu','Guanxi','Xinfeng','Emei','Baoshan','Wufeng','Hengshan','Beipu','Jianshi','Qionglin','Hukou'],
            'B1': ['Miaoli', 'Toufen', 'Yuanli', 'Tongxiao', 'Zhunan', 'Houlong', 'Zhuolan', 'Dahu', 'Gongguan', 'Tongluo', 'Sanyi', 'Xihu', 'Zaoqiao', 'Sanwan', 'Nanzhuang', 'Touwu','Shitan','Tai’an'],
            'B2': ['Changhua', 'Yuanlin', 'Yongjing', 'Shetou', 'Puxin', 'Huatan', 'Dacun', 'Puyan', 'Lukang', 'Hemei', 'Hemei', 'Shengang', 'Fuxing', 'Xiushui', 'Dacheng', 'Fangyuan', 'Erlin', 'Puxin', 'Puyan', 'Xihu', 'Beidou', 'Tianzhong', 'Tianwei', 'Fenyuan', 'Ershui'],
            'B3': ['Nantou', 'Puli', 'Caotun', 'Zhushan', 'Jiji', 'Mingjian', 'Lugu', 'Zhongliao', 'Yuchi', 'Guoxing', 'Shuili', 'Xinyi', 'Ren’ai'],
            'B4': ['Douliu', 'Dounan', 'Huwei', 'Xiluo', 'Tuku', 'Beigang', 'Citong', 'Linnei', 'Gukeng', 'Dapi', 'Lunbei', 'Erlun', 'Mailiao', 'Taixi', 'Dongshi', 'Yuanzhang', 'Sihu', 'Kouhu', 'Shuilin','Baozhong'],
            'B5': ['East', 'West'],
            'B6': ['Taibao', 'Puzi', 'Budai', 'Budai', 'Minxiong', 'Xikou', 'Xingang', 'Liujiao', 'Dongshi', 'Yizhu', 'Lucao', 'Shuishang', 'Zhongpu', 'Zhuqi', 'Meishan', 'Fanlu', 'Dapu', 'Alishan'],
            'B7': ['Pingtung', 'Chaozhou', 'Donggang', 'Hengchun', 'Wandan', 'Changzhi', 'Linluo', 'Jiuru', 'Ligang', 'Yanpu', 'Gaoshu', 'Wanluan', 'Neipu', 'Zhutian', 'Xinpi', 'Fangliao', 'Xinyuan', 'Kanding', 'Linbian', 'Nanzhou', 'Jiadong', 'Liuqiu', 'Checheng', 'Manzhou', 'Fangshan', 'Sandimen', 'Wutai', 'Majia', 'Taiwu', '來義鄉', 'Laiyi', 'Shizi','Mudan'],
            'B8': ['Yilan', 'Luodong', 'Su’ao', 'Toucheng', 'Jiaoxi', 'Zhuangwei', 'Yuanshan', 'Dongshan', 'Wujie', 'Sanxing', 'Datong', 'Nan’ao'],
            'B9': ['Hualien', 'Fenglin', 'Yuli', 'Xincheng', 'Ji’an', 'Shoufeng', 'Guangfu', 'Fengbin', 'Ruisui', 'Fuli', 'Xiulin', 'Wanrong', 'Zhuoxi'],
            'C1': ['Taitung', 'Chenggong', 'Guanshan', 'Beinan', 'Dawu', 'Taimali','Donghe', 'Changbin', 'Luye', 'Chishang', 'Lüdao', 'Yanping', 'Haiduan', 'Daren', 'Jinfeng', 'Lanyu'],
            'C2': ['Magong', 'Huxi', 'Baisha', 'Xiyu', 'Wang’an', 'Qimei'],
            'C3': ['Jincheng', 'Jinhu', 'Jinsha', 'Jinning', 'Lieyu', 'Wuqiu'],
            'C4': ['Nangan', 'Beigan', 'Juguang', 'Dongyin']
        }
    }
    
    if(district.length == 2){   //應付再搜尋頁面打開搜尋視窗 出現兩個district的狀況
        district[1].innerHTML = '';
        cityDistrictsMap[city[1].value].forEach(function(value) {
            let option = document.createElement('option');
            option.value = value;
            option.text = value;
            district[1].add(option);
        });
    }else{
        district[0].innerHTML = '';
        cityDistrictsMap[city[0].value].forEach(function(value) {
            let option = document.createElement('option');
            option.value = value;
            option.text = value;
            district[0].add(option);
        });
    }
    
}

function SchoolCheck(n){
    let school_check = document.getElementsByClassName('school_check');
    
    if(school_check[n].checked){
        for(i = 0;i < school_check.length;i++){
            school_check[i].checked = false;
        }
        school_check[n].checked = true;
    }
    
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

        if(search_window_L_ID == 'L000000001'){
            window.innerHTML = `
            <div class="title">
                <img style="float: none;margin-top: -1%;" src="../img/backend/search.png">
                <span>資源搜尋</span>
                <img onclick="search_window()" src="../img/X.png">
            </div>
            <div class="text">
                使用資源搜尋功能，快速找到符合您狀況的資源。選擇您想查詢的條件，並滑動至視窗下方點選搜尋按鈕。
            </div>
            <form class="data_form" id="data_form" method="post" action="/static/search_results">
                <div class="form_section">
                    <img src="../img/search/resource.png">
                    <span class="type_title">資源種類</span><br>
                    <span class="type_des">(必填)請至少選擇一種資源種類，讓我們提供您要的資訊。</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A1" id="economy"><label for="economy">經濟資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A2" id="law"><label for="law">法律資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A3" id="emergency"><label for="emergency">緊急資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A4" id="education"><label for="education">教育資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A5" id="career"><label for="career">職涯資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A6" id="medical"><label for="medical">醫療資訊</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A7" id="psychology"><label for="psychology">心理資訊</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/member.png">
                    <span class="type_title">申請者身分</span><br>
                    <span class="type_des">(複選)每種身分都有屬於他們的資源。</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A1" id="identity1"><label for="identity1">新住民</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A2" id="identity2"><label for="identity2">新住民子女</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A3" id="identity3"><label for="identity3">原住民</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A4" id="identity4"><label for="identity4">以上皆否</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/condition.png">
                    <span class="type_title">申請者狀況</span><br>
                    <span class="type_des">(複選)給我們更多您的狀況，讓我們給你更精確地資訊。</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A1" id="condition0"><label for="condition0">身心障礙</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A2" id="condition1"><label for="condition1">經濟弱勢</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A3" id="condition2"><label for="condition2">就職青年</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A4" id="condition3"><label for="condition3">單親家庭</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A5" id="condition4"><label for="condition4">家事糾紛</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A6" id="condition5"><label for="condition5">暴力/霸凌受害者</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A7" id="condition6"><label for="condition6">心理患者</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A8" id="condition7"><label for="condition7">醫院患者</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A9" id="condition8"><label for="condition8">懷孕少女</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="B1" id="condition9"><label for="condition9">租屋者</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/school.png">
                    <span class="type_title">在學狀況</span><br>
                    <span class="type_des">(單選)學校有許多資源讓我們去申請，讓我們知道你現在的在學狀況。</span><br>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A1" id="school1" onclick="SchoolCheck(0)"><label for="school1">未就學</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A2" id="school2" onclick="SchoolCheck(1)"><label for="school2">國小</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A3" id="school3" onclick="SchoolCheck(2)"><label for="school3">國中</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A4" id="school4" onclick="SchoolCheck(3)"><label for="school4">高中</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A5" id="school5" onclick="SchoolCheck(4)"><label for="school5">五專</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A6" id="school6" onclick="SchoolCheck(5)"><label for="school6">大學</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A7" id="school7" onclick="SchoolCheck(6)"><label for="school7">研究所</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A8" id="school8" onclick="SchoolCheck(7)"><label for="school8">畢業就學</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/location.png">
                    <span class="type_title">申請者地區</span>
                    <span class="type_des">有些資源有地區限制。</span><br>
                    <div class="row">
                        <div class="col form-floating">
                            <select class="form-select" name="R_City" id="city" onchange="setDistrict()">
                                <option value="A0">不限縣市</option>
                                <option value="A1">臺北市</option>
                                <option value="A2">新北市</option>
                                <option value="A3">桃園市</option>
                                <option value="A4">台中市</option>
                                <option value="B5">台南市</option>
                                <option value="B6">高雄市</option>
                                <option value="A7">基隆市</option>
                                <option value="A8">新竹市</option>
                                <option value="A9">新竹縣</option>
                                <option value="B1">苗栗縣</option>
                                <option value="B2">彰化縣</option>
                                <option value="B3">南投縣</option>
                                <option value="B4">雲林縣</option>               
                                <option value="B5">嘉義市</option>
                                <option value="B6">嘉義縣</option>
                                <option value="B7">屏東縣</option>
                                <option value="B8">宜蘭縣</option>
                                <option value="B9">花蓮縣</option>
                                <option value="C1">台東縣</option>
                                <option value="C2">澎湖縣</option>
                                <option value="C3">金門縣</option>
                                <option value="C4">連江縣</option>
                            </select>
                            <label class="floatingSelect" for="city">申請者戶籍縣市</label>
                        </div>
                        
                        <div class="col form-floating">
                            <select class="form-select district" name="R_District" id="district"><option>不限區</option></select>
                            <label class="floatingSelect" for="district">申請者戶籍行政區</label>
                        </div>
                    </div>
                </div>
                <div class="btn_area">
                    <a style="display: none" id="aa" href="#data_form"></a>
                    <button type="button" onclick="check_search_data()" class="btn btn-primary btn-lg">查詢</button>
                </div>
            </form>
            `;
        }else if(search_window_L_ID == 'L000000002'){
            window.innerHTML = `
            <div class="title">
                <img style="float: none;margin-top: -1%;" src="../img/backend/search.png">
                <span>Resource search</span>
                <img onclick="search_window()" src="../img/X.png">
            </div>
            <div class="text">
                Use the resource search function to quickly find resources that match your situation. Select the conditions you want to query.
            </div>
            <form class="data_form" id="data_form" method="post" action="/static/search_results">
                <div class="form_section">
                    <img src="../img/search/resource.png">
                    <span class="type_title">Resource type</span><br>
                    <span class="type_des">(Required) Please select at least one resource type to let us provide the information you want.</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A1" id="economy"><label for="economy">Economy</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A2" id="law"><label for="law">law</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A3" id="emergency"><label for="emergency">Emergency</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A4" id="education"><label for="education">Education</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A5" id="career"><label for="career">Career</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A6" id="medical"><label for="medical">Medical</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="demand" value="A7" id="psychology"><label for="psychology">Psychology</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/member.png">
                    <span class="type_title">Applicant identity</span><br>
                    <span class="type_des">(Choices) Each identity has its own resources.</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A1" id="identity1"><label for="identity1">New resident </label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A2" id="identity2"><label for="identity2">Children of new residents </label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A3" id="identity3"><label for="identity3">Aboriginal people</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="identity" value="A4" id="identity4"><label for="identity4">None of the above</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/condition.png">
                    <span class="type_title">Applicant status</span><br>
                    <span class="type_des">(Choices) Give us more information about your situation so we can give you more accurate information.</span><br>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A1" id="condition0"><label for="condition0">Disability</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A2" id="condition1"><label for="condition1">Economically disadvantaged</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A3" id="condition2"><label for="condition2">Job-seeking youth</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A4" id="condition3"><label for="condition3">one-parent family</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A5" id="condition4"><label for="condition4">Family dispute</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A6" id="condition5"><label for="condition5">Victims of Violence/Bullying</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A7" id="condition6"><label for="condition6">Psychological patient</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A8" id="condition7"><label for="condition7">hospital patient</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="A9" id="condition8"><label for="condition8">pregnant girl</label></span>
                    <span class="checkbox-span"><input class="form-check-input" type="checkbox" name="condition" value="B1" id="condition9"><label for="condition9">renter</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/school.png">
                    <span class="type_title">Study status</span><br>
                    <span class="type_des">(Single choice) The school has many resources for us to apply for. Let us know your current study status.</span><br>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A1" id="school1" onclick="SchoolCheck(0)"><label for="school1">Not in school</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A2" id="school2" onclick="SchoolCheck(1)"><label for="school2">Elementary school</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A3" id="school3" onclick="SchoolCheck(2)"><label for="school3">junior high school</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A4" id="school4" onclick="SchoolCheck(3)"><label for="school4">high school</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A5" id="school5" onclick="SchoolCheck(4)"><label for="school5">junior college</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A6" id="school6" onclick="SchoolCheck(5)"><label for="school6">college</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A7" id="school7" onclick="SchoolCheck(6)"><label for="school7">university</label></span>
                    <span class="checkbox-span"><input class="form-check-input school_check" type="checkbox" name="school" value="A8" id="school8" onclick="SchoolCheck(7)"><label for="school8">Study after graduation</label></span>
                </div>
                <div class="form_section">
                    <img src="../img/search/location.png">
                    <span class="type_title">Applicant's area</span>
                    <span class="type_des">Some resources have regional restrictions.</span><br>
                    <div class="row">
                        <div class="col form-floating">
                            <select class="form-select" name="R_City" id="city" onchange="setDistrict()">
                                <option value="A0">Not limited</option>
                                <option value="A1">Taipei</option>
                                <option value="A2">New Taipei</option>
                                <option value="A3">Taoyuan</option>
                                <option value="A4">Taichung</option>
                                <option value="B5">Tainan</option>
                                <option value="B6">Kaohsiung</option>
                                <option value="A7">Keelung</option>
                                <option value="A8">Hsinchu</option>
                                <option value="A9">Hsinchu County</option>
                                <option value="B1">Miaoli</option>
                                <option value="B2">Changhua</option>
                                <option value="B3">Nantou</option>
                                <option value="B4">Yunlin</option>               
                                <option value="B5">Chiayi</option>
                                <option value="B6">Chiayi County</option>
                                <option value="B7">Pingtung</option>
                                <option value="B8">Yilan</option>
                                <option value="B9">Hualien</option>
                                <option value="C1">Taitung</option>
                                <option value="C2">Penghu</option>
                                <option value="C3">Kinmen</option>
                                <option value="C4">Lianjiang</option>
                            </select>
                            <label class="floatingSelect" for="city">Applicant’s county or city of residence</label>
                        </div>
                        
                        <div class="col form-floating">
                            <select class="form-select district" name="R_District" id="district"><option>Not limited</option></select>
                            <label class="floatingSelect" for="district">Applicant’s administrative region of residence</label>
                        </div>
                    </div>
                </div>
                <div class="btn_area">
                    <a style="display: none" id="aa" href="#data_form"></a>
                    <button type="button" onclick="check_search_data()" class="btn btn-primary btn-lg">search</button>
                </div>
            </form>
            `;
        }
        

        body.appendChild(screen);
        body.appendChild(window);
    }
}



