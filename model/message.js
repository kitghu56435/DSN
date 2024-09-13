const db = require('../db');
const moment = require('moment-timezone');
const {NextID} = require('../function');

//刪除留言
async function Delete_Message(RF_ID){
    
    return new Promise((resolve,reject)=>{
        db.execute(`DELETE FROM Resource_feedback WHERE RF_ID = ?`,[RF_ID],(err,results)=>{
            if(err){
                console.log(err);
                reject('dberr');
            }else if(results.affectedRows == 0){
                reject('nodata');
            }else{
                resolve();
            }
            
        }) 
    })
}


//新增留言
async function createResource_feedback(msg,utoken,R_ID){
    
    let RF_ID = await NextID('Resource_feedback','RF_ID','RF');
    
    let RF_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
   
    if(R_ID == undefined || R_ID == 'undefined'){
        R_ID = null;
    }

    

    return new Promise((resolve,reject)=>{


        db.execute(`INSERT INTO Resource_feedback VALUES(?,?,?,?,?);`,[RF_ID,R_ID,msg,RF_Date,utoken],(err,results)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve()
            }
        })
    })
}









module.exports = {
    createResource_feedback,
    Delete_Message,
};