const db = require('../db');


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









module.exports = {
    Delete_Message,
};