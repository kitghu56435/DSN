const db = require('../db');
const {NextID,checkData,RDNextID} = require('../function');
const moment = require('moment-timezone');
const {readFileSync} = require('fs');


//寫到這 供應商模組

//新增語言
async function Create_Language(L_Name){
    let L_ID = await NextID('Languages','L_ID','L');
    let L_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');



    return new Promise((resolve,reject)=>{

        if(checkData(L_Name)){
            db.execute(`INSERT INTO Languages VALUES(?,?,?)`,[L_ID,L_Name,L_Date],(err)=>{
                if(err){
                    reject('create_err');
                }else{
                    resolve();
                }
            })
        }else{
            reject('dataerr')
        }
    })
}



module.exports = {
    
};