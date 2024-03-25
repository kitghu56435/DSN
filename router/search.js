const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {setMsgbox,checkData,NextID} = require('../function');
const moment = require('moment-timezone');

//搜尋資訊分成三種 一是強制資源 二是適合資訊 三是建議資訊 四是其他可能資料
//強制資訊是依據某些使用者身分來強制給予某些資料資訊
//用使用者指定的需求來判定適合資訊
//建議資訊則是用使用者的身分與在學狀況來判定，並依據選擇的需求以外的資源來嘗試尋找資源，成為建議資訊。
//建議資源的建議需求選取可以用人工或是某種機器學習的演算法去實現
//其他可能資料是透過某種關聯，找到其他可能資料















async function searchResource(demand,identity,school,R_City,R_District){
    let parameter = [R_City,R_District];
    let application = false;
    let str = `SELECT * FROM Resources WHERE R_Delete = 0 AND R_City = ? AND R_District = ? `;
    let identity_code = getIdentityCode(identity);

    if(Number(identity_code) != 0){
        str += `AND R_Identity = ? `;
        parameter.push(identity_code);
    }
    if(typeof demand == 'string'){
        str += Demand_Code(demand);
        if(demand == 'A8') application = true;
    }else if(typeof demand == 'object'){
        for(i = 0;i<demand.length;i++){
            str += Demand_Code(demand[i]);
            if(demand[i] == 'A8') application = true;
        }
    }
    if(school != undefined){
        str += `AND R_School LIKE ? `;
        parameter.push( '%' + school + '%');
    }
    
    console.log(str)
    console.log(application);
}
function getIdentityCode(identity){
    let str = '';
    let latter = ['A','B','C']
    if(typeof identity == 'object'){  //是陣列

        let count = 0;
        let number = 1;
        let upnumber = 0;
        let match = false;
        while(true){
            if(count == identity_num) break;
            if(number > 9){
                number = 1; 
                upnumber++;
            } 
            for(i = 0;i<identity.length;i++){
                if(identity[i] == (latter[upnumber] + number)){
                    str += identity[i];
                    match = true;
                    break;
                }
            }
            if(!match){
                str += '00';
            }
            match = false;
            count++;
            number++;
        }

    }else if(typeof identity == 'string'){
        
        let count = 0;
        let number = 1;
        let upnumber = 0;
        let match = false;
        while(true){
            if(count == identity_num) break;
            if(number > 9){
                number = 1; 
                upnumber++;
            } 
            if(identity == (latter[upnumber] + number)){
                str += identity;
                match = true;
            }
            if(!match){
                str += '00';
            }
            match = false;
            count++;
            number++;
        }
    }else{
        for(i = 0;i<identity_num;i++){
            str += '00';
        }
    }
    return str;
}
function getSchoolCode(school){
    let str = '';
    let latter = ['A','B','C']
    if(typeof school == 'object'){  //是陣列

        let count = 0;
        let number = 1;
        let upnumber = 0;
        let match = false;
        while(true){
            if(count == school_num) break;
            if(number > 9){
                number = 1; 
                upnumber++;
            } 
            for(i = 0;i<school.length;i++){
                if(school[i] == (latter[upnumber] + number)){
                    str += school[i];
                    match = true;
                    break;
                }
            }
            if(!match){
                str += '00';
            }
            match = false;
            count++;
            number++;
        }

    }else if(typeof school == 'string'){
        
        let count = 0;
        let number = 1;
        let upnumber = 0;
        let match = false;
        while(true){
            if(count == school_num) break;
            if(number > 9){
                number = 1; 
                upnumber++;
            } 
            if(school == (latter[upnumber] + number)){
                str += school;
                match = true;
            }
            if(!match){
                str += '00';
            }
            match = false;
            count++;
            number++;
        }
    }else{
        for(i = 0;i<school_num;i++){
            str += '00';
        }
    }
    return str;
}

module.exports = router;