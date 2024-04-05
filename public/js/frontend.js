function show_a(n){
    let a = document.getElementsByClassName('a')[n];
    let q_img = document.getElementsByClassName('q_img')[n];

    let height = 0;
    if(window.innerWidth <= 560){
        height = 300;
    }else if(window.innerWidth <= 768){
        height = 250;
    }else{
        height = 200;
    }

    if(a.style['height'] == '0px'){
        q_img.style['transform'] = 'rotate(180deg)';
        a.style['padding'] = `1em 1.5em 1em 1.5em`;
        a.style['height'] = height + `px`;
    }else{
        q_img.style['transform'] = 'rotate(0deg)';
        a.style['padding'] = `0`;
        a.style['height'] = `0px`;
    }

    
}


function setSearch_results(data){
    let demand = document.getElementById('demand');
    let identity = document.getElementById('identity');
    let school = document.getElementById('school');
    let condition = document.getElementById('condition');
    let R_City = document.getElementById('R_City');
    
    //搜尋條件
    demand.innerHTML = getSearch_Data_Text(data.Search_data.demand,'demand');
    identity.innerHTML = getSearch_Data_Text(data.Search_data.identity,'identity');
    condition.innerHTML = getSearch_Data_Text(data.Search_data.condition,'condition');
    school.innerHTML = getSearch_Data_Text(data.Search_data.school,'school');
    R_City.innerHTML = getSearch_Data_Text(data.Search_data.R_City,'city') + data.Search_data.R_District;


    // "R_List" : [{
    //     "D_ID" : "D000000001",
    //     "D_Name" : "經濟資訊",
    //     "R_ID" : "R000000000",
    //     "R_Name" : "範例資源名稱",
    //     "R_Depiction" : "範例資源敘述",
    //     "R_Label" : ["範例標籤","範例標籤"],  //選上的因素標籤
    //     "R_Img" : "",
    //     "Search_Type" : ""
    // }],
    //搜尋結果呈現
    let demand_ID = ['D000000001','D000000002','D000000003','D000000004'
    ,'D000000005','D000000006',"D000000007"];
    console.log(data)
    let title0 = false;   //適合資訊是否放上標題了
    let title1 = false;   //建議資訊是否放上標題了
    let suggestion = false; //是否有建議資源
    let data_html = document.getElementsByClassName('data');  // 0 是適合資訊 1 是建議資訊
    let str0 = '';
    let str1 = '';
    for(i = 0;i < demand_ID.length;i++){
        title0 = false;
        title1 = false;
        for(j = 0;j<data.R_List.length;j++){
            if(demand_ID[i] == data.R_List[j].D_ID){
                if(data.R_List[j].Search_Type == 'search' || data.R_List[j].Search_Type == 'required'){
                    if(!title0){ //先看要不要放標題
                        str0 += `<h3><div><img src="../img/index/${data.R_List[j].D_ID}.png"></div>${data.R_List[j].D_Name}</h3>
                        <div class="data_resource">`;
                        title0 = true;
                    }
                    str0 += `
                    <div class="r_box">
                        <img class="r_box_img" onclick="url('/resource?ID=${data.R_List[j].R_ID}')" src="../img/R_Img/${data.R_List[j].R_Img}">
                        <div class="r_box_text">
                            <h4>${data.R_List[j].R_Name}</h4>
                            <p>
                                ${data.R_List[j].R_Depiction}
                            </p>
                            ${getSearch_Label(data.R_List[j].R_Label)}
                        </div>
                    </div>
                    `;
                }else if(data.R_List[j].Search_Type == 'suggestion'){
                    suggestion = true;
                    if(!title1){ //先看要不要放標題
                        str1 += `<h3><div><img src="../img/index/${data.R_List[j].D_ID}.png"></div>${data.R_List[j].D_Name}</h3>
                        <div class="data_resource">`;
                        title1 = true;
                    }

                    str1 += `
                    <div class="r_box">
                        <img class="r_box_img" onclick="url('/resource?ID=${data.R_List[j].R_ID}')" src="../img/R_Img/${data.R_List[j].R_Img}">
                        <div class="r_box_text">
                            <h4>${data.R_List[j].R_Name}</h4>
                            <p>
                                ${data.R_List[j].R_Depiction}
                            </p>
                            ${getSearch_Label(data.R_List[j].R_Label)}
                        </div>
                    </div>
                    `;
                }
            }
        }
        str0 += '</div>';
        str1 += '</div>';
    }
    data_html[0].innerHTML = str0;
    
    if(suggestion){
        data_html[1].innerHTML = str1;
    }else{
        let title_area = document.getElementsByClassName('title_area')[2];
        title_area.parentElement.removeChild(title_area);
        data_html[1].parentElement.removeChild(data_html[1]);
    }
}


function getR_Label_leng(str,L_ID){
    if(L_ID == 'L000000002'){
        switch(str){
            case '強烈建議' : return 'Recommend';
            //IdentityText
            case '所有身分' : return 'All Identity';
            case '新住民' : return 'New resident';
            case '新住民子女' : return 'Children of new residents';
            case '原住民' : return 'Aboriginal people';
            case '以上皆否' : return 'None of the above';
            //Condition
            case '身心障礙' : return 'Disability';
            case '經濟弱勢' : return 'Economically disadvantaged';
            case '就職青年' : return 'Job-seeking youth';
            case '單親家庭' : return 'One-parent family';
            case '家事糾紛' : return 'Family dispute';
            case '暴力/霸凌受害者' : return 'Victims of Violence/Bullying';
            case '心理患者' : return 'Psychological patient';
            case '醫院患者' : return 'hospital patient';
            case '懷孕少女' : return 'pregnant girl';
            case '租屋者' : return 'renter';
            //SchoolText
            case '不限就學' : return 'All Study status';
            case '未就學' : return 'Not in school';
            case '國小' : return 'Elementary school';
            case '國中' : return 'junior high school';
            case '高中' : return 'high school';
            case '五專' : return 'junior college';
            case '大學' : return 'college';
            case '研究所' : return 'university';
            case '畢業就學' : return 'Study after graduation';
            //CityText
            case '所有縣市' : return 'All City';
            case '臺北市' : return 'Taipei';
            case '新北市' : return 'New Taipei';
            case '桃園市' : return 'Taoyuan';
            case '台中市' : return 'Taichung';
            case '台南市' : return 'Tainan';
            case '高雄市' : return 'Kaohsiung';
            case '基隆市' : return 'Keelung';
            case '新竹市' : return 'Hsinchu';
            case '新竹縣' : return 'Hsinchu County';
            case '苗栗縣' : return 'Miaoli';
            case '彰化縣' : return 'Changhua';
            case '南投縣' : return 'Nantou';
            case '雲林縣' : return 'Yunlin';
            case '嘉義市' : return 'Chiayi';
            case '嘉義縣' : return 'Chiayi County';
            case '屏東縣' : return 'Pingtung';
            case '宜蘭縣' : return 'Yilan';
            case '花蓮縣' : return 'Hualien';
            case '台東縣' : return 'Taitung';
            case '澎湖縣' : return 'Penghu';
            case '金門縣' : return 'Kinmen';
            case '連江縣' : return 'Lianjiang';
        }
    }else{
        //預設中文
        return str;
    }
}
function getSearch_Label(label){
    let str = '';
    for(ss = 0;ss < label.length ; ss++){
        str += `<span>${label[ss]}</span>`;
    }
    return str;
}
function getSearch_Data_Text(data,type){
    if(typeof data == 'string'){
        switch(type){
            case 'demand' : return getR_Label_leng(getDemandText(data),search_window_L_ID); break;
            case 'identity' : return getR_Label_leng(getIdentityText(data),search_window_L_ID); break;
            case 'condition' : return getR_Label_leng(getConditionText(data),search_window_L_ID); break;
            case 'school' : return getR_Label_leng(getSchoolText(data),search_window_L_ID); break;
            case 'city' : return getR_Label_leng(getCityText(data),search_window_L_ID); break;
        }
    }else if(typeof data == 'object'){
        let str = '';
        for(f = 0;f < data.length;f++){
            switch(type){
                case 'demand' : str += getR_Label_leng(getDemandText(data[f]),search_window_L_ID) + '、'; break;
                case 'identity' : str += getR_Label_leng(getIdentityText(data[f]),search_window_L_ID) + '、'; break;
                case 'condition' : str += getR_Label_leng(getConditionText(data[f]),search_window_L_ID) + '、'; break;
                case 'school' : str += getR_Label_leng(getSchoolText(data[f]),search_window_L_ID) + '、'; break;
                case 'city' : str += getR_Label_leng(getCityText(data[f]),search_window_L_ID) + '、'; break;
            }
        }

        return str.substring(0,(str.length-1));
    }else{
        return getR_Label_leng('未選擇',search_window_L_ID);
    }
}
function getDemandText(code){
    switch(code){
        case 'A1' : return `經濟資訊`;
        case 'A2' : return `法律資訊`; 
        case 'A3' : return `緊急資訊`; 
        case 'A4' : return `教育資訊`; 
        case 'A5' : return `職涯資訊`; 
        case 'A6' : return `醫療資訊`; 
        case 'A7' : return `心理資訊`; 
        default : return '無需求序號';
    }
}
function getIdentityText(code){
    switch(code){
        case 'A0' : return '所有身分';
        case 'A1' : return '新住民';
        case 'A2' : return '新住民子女';
        case 'A3' : return '原住民';
        case 'A4' : return '以上皆否';
    }
}
function getConditionText(code){
    switch(code){
        case 'A0' : return '所有狀況';
        case 'A1' : return '身心障礙';
        case 'A2' : return '經濟弱勢';
        case 'A3' : return '就職青年';
        case 'A4' : return '單親家庭';
        case 'A5' : return '家事糾紛';
        case 'A6' : return '暴力/霸凌受害者';
        case 'A7' : return '心理患者';
        case 'A8' : return '醫院患者';
        case 'A9' : return '懷孕少女';
        case 'B1' : return '租屋者';
    }
}
function getSchoolText(code){
    switch(code){
        case 'A0' : return '不限就學';
        case 'A1' : return '未就學';
        case 'A2' : return '國小';
        case 'A3' : return '國中';
        case 'A4' : return '高中';
        case 'A5' : return '五專';
        case 'A6' : return '大學';
        case 'A7' : return '研究所';
        case 'A8' : return '畢業就學';
        default : return '未選擇';
    }
}
function getCityText(code){
    switch(code){
        case 'A0' : return '所有縣市';
        case 'A1' : return '臺北市';
        case 'A2' : return '新北市';
        case 'A3' : return '桃園市';
        case 'A4' : return '台中市';
        case 'A5' : return '台南市';
        case 'A6' : return '高雄市';
        case 'A7' : return '基隆市';
        case 'A8' : return '新竹市';
        case 'A9' : return '新竹縣';
        case 'B1' : return '苗栗縣';
        case 'B2' : return '彰化縣';
        case 'B3' : return '南投縣';
        case 'B4' : return '雲林縣';
        case 'B5' : return '嘉義市';
        case 'B6' : return '嘉義縣';
        case 'B7' : return '屏東縣';
        case 'B8' : return '宜蘭縣';
        case 'B9' : return '花蓮縣';
        case 'C1' : return '台東縣';
        case 'C2' : return '澎湖縣';
        case 'C3' : return '金門縣';
        case 'C4' : return '連江縣';
    }
}