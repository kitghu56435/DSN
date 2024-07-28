const db = require('../db');
const moment = require('moment-timezone');
const {NextID,checkData,RDNextID} = require('../function');



//紀錄flow資料
async function Flow(FL_Page,FL_Cookie){
    let FL_Time = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let FL_ID = await RDNextID('Flow','FL_ID','FL');  //使用給RD專用的序號function，為了產生更多字元的代號

    
    return new Promise((resolve,reject)=>{
        if(checkData(FL_Page) && checkData(FL_Cookie)){
            db.execute(`INSERT INTO Flow VALUES(?,?,?,?);`,[FL_ID,FL_Page,FL_Time,FL_Cookie],(err,results)=>{
                if(err){
                    console.log(err);
                    reject('dberr');
                }else if(results.affectedRows == 0){
                    reject('nodata');
                }else{
                    resolve();
                }
            }) 
        }
    })
}



module.exports = {
    Flow
};