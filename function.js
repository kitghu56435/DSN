var sha = require('sha256');
const db = require('./db');


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




module.exports = {
    getClientIP,
    NextID,
    addID,
    create_Sessionid,
    CheckSessionRepeat,
    delete_Sessionid,
    Administrator_verafication
}