const db = require('../db');
const {NextID,checkData,RDNextID} = require('../function');
const moment = require('moment-timezone');
const {readFileSync} = require('fs');



//新增供應商
async function Create_Supplier(data){
    let S_ID = await NextID('Supplier','S_ID','S');
    let S_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let R_ID = data.R_ID;


    if(checkData(S_ID)){
        if(checkData(R_ID)){
            if(typeof R_ID == 'object'){
                for(c = 0;c<R_ID.length;c++){
                    await create_Supplier_binding(R_ID[c],S_ID);
                }
            }else{
                await create_Supplier_binding(R_ID,S_ID);
            }
        } 

        return new Promise((resolve,reject)=>{
            db.execute(`INSERT INTO Supplier VALUES(?,?,?,?,?,?,?,?)`,
            [S_ID,data.S_Name,data.S_Phone,data.S_Web,S_Date,data.S_Remark,data.S_Manager,data.S_Manager_phone],(err)=>{
                if(err){
                    console.log(err)
                    reject('dberr');
                }else{
                    resolve();
                }
            })
        })
    }else{
        return new Promise((resolve,reject)=>{
            reject('dataerr');
        })
    }
}


//刪除供應商
async function Delete_Supplier(S_ID){
    

    return new Promise((resolve,reject)=>{

        if(checkData(S_ID)){
            db.execute(`DELETE FROM Supplier_binding WHERE S_ID = ?;`,[S_ID],(err)=>{
                if(err){
                    resolve("dberr");
                    console.log(err);
                }
            })
            db.execute(`DELETE FROM Supplier WHERE S_ID = ?;`,[S_ID],(err)=>{
                if(err){
                    resolve("dberr");
                    console.log(err);
                }else{
                    resolve();
                }
            })
        }else{
            resolve("dataerr");
        }
    })
}


//修改供應商
async function Edit_Supplier(data){
    let S_ID = data.S_ID;
    let S_Name = data.S_Name;



    return new Promise((resolve,reject)=>{
        if(checkData(S_ID) && checkData(S_Name)){
            db.execute(`SELECT S_ID FROM Supplier WHERE S_ID = ?;`,[S_ID],(err,results)=>{  //確認是否有此供應商續號
                if(err){
                    console.log(err);
                    reject("dberr")
                }else if(results.length == 0){
                    reject('nodata')
                }else{
                    update_Supplier(data).then(()=>{
                        resolve('success')
                    }).catch((info)=>{
                        reject(info)
                    })             
                }
            })
        }else{
            reject("dataerr");
        }
    })
}






async function create_Supplier_binding(R_ID,S_ID){
    let SB_ID = await NextID('Supplier_binding','SB_ID','SB');

    new Promise((resolve,reject)=>{
        db.execute(`INSERT INTO Supplier_binding VALUES(?,?,?);`,[SB_ID,R_ID,S_ID],(err)=>{
            if(err){
                console.log(err);
                reject();
            }else{
                resolve();
            }
        })
    })
}
async function update_Supplier(data){
    let S_ID = data.S_ID;
    let R_ID = data.R_ID;

    await delete_Supplier_binding(S_ID)  //先刪除目前綁定的資源

    if(checkData(R_ID)){    //重新綁定
        if(typeof R_ID == 'object'){
            for(c = 0;c<R_ID.length;c++){
                await create_Supplier_binding(R_ID[c],S_ID);
            }
        }else{
            await create_Supplier_binding(R_ID,S_ID);
        }
    } 



    return new Promise((resolve,rejects)=>{
        resolve();
    })
}
async function delete_Supplier_binding(S_ID){
    return new Promise((resolve)=>{
        db.execute(`DELETE FROM Supplier_binding WHERE S_ID = ?`,[S_ID],(err)=>{
            if(err){
                console.log(err);
            }
            resolve();
        })
    })
}




module.exports = {
    Delete_Supplier,
    Create_Supplier,
    Edit_Supplier
};