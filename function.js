var sha = require('sha256');
const db = require('./db');


//搜尋資訊分成三種 一是強制資源 二是適合資訊 三是建議資訊 四是其他可能資料(未設計)
//強制資訊是依據某些使用者狀況來強制給予某些資料資訊，並直接成為適合資源
//用使用者指定的需求來判定適合資訊
//建議資訊則是用使用者的身分與在學狀況來判定，並依據選擇的需求以外的資源來嘗試尋找資源，成為建議資訊。
//建議資源的建議需求選取可以用人工或是某種機器學習的演算法去實現
//其他可能資料是透過某種關聯，找到其他可能資料

let Required_Resource = {  //強制資源清單
    "A1" : ['R000000008'],   //身心障礙
    "A2" : ['R000000001','R000000003'],   //經濟弱勢
    "A3" : ['R000000030','R000000031','R000000032'],   //就職青年
    "A4" : ['R000000001'],   //單親家庭
    "A5" : [],   //家事糾紛
    "A6" : ['R000000024'],   //暴力/霸凌受害者
    "A7" : [],   //心理患者
    "A8" : ['R000000040'],   //醫院患者
    "A9" : ['R000000023'],   //懷孕少女
    "B1" : ['R000000007'],   //租屋者
}

const Administrator_verafication = (req,res,next) => {
    
    if(req.session == null || req.session.Session_ID == undefined){
        res.writeHead(303,{Location:'/sign_in?info=none'});
        res.end();
    }else{
        db.execute(`SELECT AD_Session_ID FROM Administrator WHERE AD_Session_ID = ?;`,[req.session.Session_ID],(err,result)=>{
            if(err){
                console.log(err);
                res.writeHead(303,{Location:'/sign_in?info=none'});
                res.end();
            }else{
                if(result.length != 0){
                    if(result[0].AD_Session_ID == req.session.Session_ID){
                        next();
                    }else{
                        res.writeHead(303,{Location:'/sign_in?info=none'});
                        res.end();
                    }
                }else{
                    res.writeHead(303,{Location:'/sign_in?info=none'});
                    res.end();
                }
            }
        })
    }
}

//coolie變數設置
//leng 語言序號
//utoken 使用者序號
//accept 對cookie的接受程度 none/accept/null/delete

const setCookie = (req,res,next) =>{
    if(req.cookies.leng == undefined){
        res.cookie('leng', 'L000000001',{
            httpOnly : true,
            sameSite : 'lax',
        });
    }
    if(req.cookies.accept == undefined){
        res.cookie('accept', 'null',{
            httpOnly : true,
            sameSite : 'lax',
        });
    }
    if(req.cookies.utoken == undefined){
        res.cookie('utoken', create_utoken(),{
            httpOnly : true,
            sameSite : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
    }
    next();
}

function create_utoken(){
    let date = new Date();
    let number1 = date.getSeconds();  //秒
    let number2 = date.getDate();  //日
    let number3 = Math.random();  //日
    let key = ((number1*number2)/number3)*number2-number3; 
    let session = sha(String(key));


    return session;
}

async function create_Sessionid(){
    let date = new Date();
    let number1 = date.getSeconds();  //秒
    let number2 = date.getDate();  //日
    let number3 = Math.random();  //日
    let key = ((number1*number2)/number3)*number2-number3; 
    let session = await CheckSessionRepeat(sha(String(key)));
    
    return session;
}

async function CheckSessionRepeat(session){
    return new Promise((resolve)=>{
        db.execute('SELECT AD_Session_ID FROM Administrator WHERE AD_Session_ID = ?',[session],(err,results)=>{
            if(err){
                console.log(err);
                resolve('dberr');
            }else{
                if(results.length == 0){
                    resolve(session);
                }
            }
        })
    })
}

function delete_Sessionid(Userid,Sessionid){
    db.execute(`UPDATE Administrator SET AD_Session_ID = null WHERE AD_ID = ? AND AD_Session_ID = ?`,[Userid,Sessionid],(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('刪除成功')
        }
    })
    return;
}


//console.log(getClientIP(req.rawHeaders,'X-Real-IP'));
function getClientIP(header,key){
    let ip = '127.0.0.1';
    for(i = 0;i<header.length;i++){
        if(header[i] == key){
            ip = header[i+1];
        }
    }
    return ip;
}


async function NextID(table,ID_Name,ID_Type){
    return new Promise((resolve,reject)=>{
        db.execute(`SELECT ${ID_Name} FROM ${table};`,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                if(results.length == 0){
                    resolve(addID(ID_Type));
                }else{
                    resolve(addID(ID_Type,results[results.length - 1][ID_Name]));
                }
            }
        })
    }).catch(()=>{
        console.log('dberr');
    })
}

function addID(ID_Type,Now_ID){
    let return_value = '';    

    if(Now_ID == undefined){                  //第一個序號
        return_value = ID_Type;
        for(c = 0;c < ((10-ID_Type.length)-1);c++){
            return_value += '0';
        }
        return_value += '1';
    }else{
        let ID_Type_length = ID_Type.length;
        let Now_ID_length = Now_ID.length
        let Now_Num = '';
        for(i = ID_Type_length;i<Now_ID_length;i++){       //將數字與字串隔開
            Now_Num += Now_ID[i];
        }
        let New_Num = (Number(Now_Num) + 1);              //獲得數字並加1  
        let New_Num_str = String(New_Num);      
        let New_Num_length = New_Num_str.length;
        
    
        if((Now_ID_length-ID_Type_length) < New_Num_length){
            return 'over-max';
            
        }else{
            return_value += ID_Type;
            for(j = 0;j < (Now_ID_length-ID_Type_length-New_Num_length);j++){
                return_value += '0';
            }
            return_value += New_Num_str;
        }
    }
    

    return return_value;
}



async function RDNextID(table,ID_Name,ID_Type){
    return new Promise((resolve,reject)=>{
        db.execute(`SELECT ${ID_Name} FROM ${table};`,(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                if(results.length == 0){
                    resolve(RDaddID(ID_Type));
                }else{
                    resolve(RDaddID(ID_Type,results[results.length - 1][ID_Name]));
                }
            }
        })
    }).catch(()=>{
        console.log('dberr');
    })
}

function RDaddID(ID_Type,Now_ID){
    let return_value = '';    

    if(Now_ID == undefined){                  //第一個序號
        return_value = ID_Type;
        for(c = 0;c < ((20-ID_Type.length)-1);c++){
            return_value += '0';
        }
        return_value += '1';
    }else{
        let ID_Type_length = ID_Type.length;
        let Now_ID_length = Now_ID.length
        let Now_Num = '';
        for(i = ID_Type_length;i<Now_ID_length;i++){       //將數字與字串隔開
            Now_Num += Now_ID[i];
        }
        let New_Num = (Number(Now_Num) + 1);              //獲得數字並加1  
        let New_Num_str = String(New_Num);      
        let New_Num_length = New_Num_str.length;
        
    
        if((Now_ID_length-ID_Type_length) < New_Num_length){
            return 'over-max';
            
        }else{
            return_value += ID_Type;
            for(j = 0;j < (Now_ID_length-ID_Type_length-New_Num_length);j++){
                return_value += '0';
            }
            return_value += New_Num_str;
        }
    }
    

    return return_value;
}


function setMsgbox(msg){
    if(msg == ''){
        return '';
    }else{
        return `msgbox(1,'${msg}');`;
    }
}

function find(str,content){    //簡單文字爬蟲 回傳布林值
    
    if(str == '' || str == null || str == undefined || content == '' || content == null || content == undefined){
        return false;
    }else{
        let count = 0;
        let match_num = str.length;
        let founded = false;
        if(content == null){
            return founded;
        }
        for(k = 0;k<content.length;k++){
            if(founded){
                break;
            }else{
                for(p = 0;p<str.length;p++){
                    if(content[k+p] == str[p]){
                        count++;
                        if(count == match_num){
                            founded = true;   
                            break;                                                      
                        }
                    }else{
                        count = 0;
                        break;
                    }
                }
            }
        }
    
        return founded;
    }
    
}


function find_Count(str,content){    //連續文字爬蟲  返回數字
    let count = 0;
    let match_num = str.length;
    let founded = false;
    if(content == null){
        return founded;
    }
    for(k = 0;k<content.length;k++){
        if(founded){
            break;
        }else{
            for(j = 0;j<str.length;j++){
                if(content[k+j] == str[j]){
                    count++;
                    if(count == match_num){
                        console.log('找到了');   
                        count = 0;     
                        break;
                    }
                }else{
                    count = 0;
                    break;
                }
            }
        }
    }

    return founded;
}


function checkData(data){
    if(typeof data == 'string'){
        switch(data){
            case "" :
            case null : 
            case 'null' :
            case undefined : 
            case "undefined" : return false;
            default : return true;
        }
    }else if(typeof data == 'object'){
        for(u = 0;u<data.length;u++){
            switch(data){
                case "" :
                case null : 
                case 'null' :
                case undefined : 
                case "undefined" : return false;
            }
        }
        return true;
    }
}


function EOM(year,month){   //月底日期產生函數
    let day = 0;

    if(year%4 == 0 && month == 2){
        day = 29;
    }else{
        switch(month){
            case 1 : day = 31;
            case 2 : day = 28;
            case 3 : day = 31;
            case 4 : day = 30;
            case 5 : day = 31;
            case 6 : day = 30;
            case 7 : day = 31;
            case 8 : day = 31;
            case 9 : day = 30;
            case 10 : day = 31;
            case 11 : day = 30;
            case 12 : day = 31;
        }
    }

    if(month < 10){
        month = '0' + month;
    }
    return `${year}-${month}-${day} 23:59:59`;
}
function SOM(year,month){    //月初日期產生函數
    if(month < 10){
        month = '0' + month;
    }
    return `${year}-${month}-01 00:00:00`;
}
function Proportion(all,n){  //回傳百分比(%)
    return Math.round((n/all)*100)
}







module.exports = {
    getClientIP,
    NextID,
    RDNextID,
    addID,
    create_Sessionid,
    CheckSessionRepeat,
    delete_Sessionid,
    Administrator_verafication,
    setMsgbox,
    find,
    find_Count,
    checkData,
    setCookie,
    EOM,
    SOM,
    Proportion,
    Required_Resource
}