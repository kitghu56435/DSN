const express = require('express');
const router = express.Router();
const {readFileSync,writeFile,unlink} = require('fs');
const db = require('../db');
const {Administrator_verafication,setMsgbox,NextID,checkData} = require('../function');
const moment = require('moment-timezone');

router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier.html','utf-8');
    let msgbox = '';
    let all_s = 0; //靜態數量
    let data = {
        "supplier" : []
    }
    
    db.execute(`SELECT * FROM Supplier ORDER BY S_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            all_s = results.length;
            for(i = 0;i<results.length;i++){
                data.supplier.push({
                    "S_ID" : results[i].S_ID,
                    "S_Name" : results[i].S_Name,
                    "S_Resource" : [],
                    "S_Web" : results[i].S_Web,
                    "S_Date" : results[i].S_Date
                })
            }
        }
    })
    db.execute(`SELECT Supplier_binding.*,RD_Content FROM Supplier_binding,Resources,Resource_data WHERE Supplier_binding.R_ID = Resource_data.R_ID 
    AND Supplier_binding.R_ID = Resources.R_ID AND L_ID = 'L000000001'AND RD_Type = 2 AND R_Delete = 0 ORDER BY S_ID;`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                for(j = 0;j<data.supplier.length;j++){
                    if(results[i].S_ID == data.supplier[j].S_ID){
                        data.supplier[j].S_Resource.push(results[i].RD_Content);
                        break;
                    }
                }
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setData_block(0,${all_s});
        setSupplier(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
    
})
router.post('/delete',(req,res)=>{
    let S_ID = req.body.S_ID;
    let data = {
        "msg" : "success",
        "supplier" : []
    }

    if(checkData(S_ID)){
        db.execute(`DELETE FROM Supplier_binding WHERE S_ID = ?;`,[S_ID],(err)=>{
            if(err){
                res.json({"msg" : "dberr"});
                console.log(err);
            }
        })
        db.execute(`DELETE FROM Supplier WHERE S_ID = ?;`,[S_ID],(err)=>{
            if(err){
                res.json({"msg" : "dberr"});
                console.log(err);
            }else{
                db.execute(`SELECT * FROM Supplier ORDER BY S_ID;`,(err,results)=>{
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
                    }else{
                        for(i = 0;i<results.length;i++){
                            data.supplier.push({
                                "S_ID" : results[i].S_ID,
                                "S_Name" : results[i].S_Name,
                                "S_Resource" : [],
                                "S_Web" : results[i].S_Web,
                                "S_Date" : results[i].S_Date
                            })
                        }
                    }
                })
                db.execute(`SELECT Supplier_binding.*,RD_Content FROM Supplier_binding,Resources,Resource_data WHERE Supplier_binding.R_ID = Resource_data.R_ID 
                AND Supplier_binding.R_ID = Resources.R_ID AND L_ID = 'L000000001'AND RD_Type = 2 AND R_Delete = 0 ORDER BY S_ID;`,(err,results)=>{
                    if(err){
                        console.log(err);
                        res.json({"msg" : "dberr"});
                    }else{
                        for(i = 0;i<results.length;i++){
                            for(j = 0;j<data.supplier.length;j++){
                                if(results[i].S_ID == data.supplier[j].S_ID){
                                    data.supplier[j].S_Resource.push(results[i].RD_Content);
                                    break;
                                }
                            }
                        }
                    }
            
            
                    res.json(data);
                })
            }
        })
    }else{
        res.json({"msg" : "dataerr"});
    }
    
})


router.get('/add',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier_add.html','utf-8');
    let msg = req.query.data;
    let msgbox = '';
    let data = {
        "resource" : []
    }
    
    switch(msg){
        case 'err' : msgbox = '資料輸入錯誤';break;
        case 'create_err' : msgbox = '新增模組錯誤';break;
    }

    db.execute(`SELECT Demand.D_Name,Resources.R_ID,Resource_data.RD_Content FROM Resources,Resource_data,Demand WHERE Resources.R_ID = Resource_data.R_ID 
    AND Demand.D_ID = Resources.D_ID AND R_Delete = 0 AND RD_Type = 2 AND Resource_data.L_ID = 'L000000001' AND Demand.L_ID = 'L000000001';`,(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                data.resource.push({
                    "D_Name" : results[i].D_Name,
                    "R_ID" : results[i].R_ID,
                    "R_Name" : results[i].RD_Content,
                })
            }
        }


        html += `<script>
        ${setMsgbox(msgbox)}
        setSupplier_Add(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
    
})
router.post('/add/data',(req,res)=>{
    if(checkData(req.body.S_Name)){
        new Promise((resolve,reject)=>{
            resolve(create_Supplier(req.body));
        }).then(()=>{
            res.writeHead(303,{Location:'/backend/supplier'});
            res.end();
        }).catch(()=>{
            res.writeHead(303,{Location:'/backend/supplier/add?data=create_err'});
            res.end();
        })
    }else{
        res.writeHead(303,{Location:'/backend/supplier/add?data=err'});
        res.end();
    }
})


router.get('/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/edit/supplier_edit.html','utf-8');
    let S_ID = req.query.S_ID;
    let msgbox = '';
    let data = {
        "S_ID" : "",
        "S_Name" : "",
        "S_Phone" : "",
        "S_Web" : "",
        "S_Manager" : "",
        "S_Manager_phone" : "",
        "S_Remark" : "",
    }
    
    db.execute(`SELECT * FROM Supplier WHERE S_ID = ?`,[S_ID],(err,results)=>{
        if(err){
            console.log(err);
            msgbox += '資料庫錯誤<br>';
        }else{
            data.S_ID = results[0].S_ID;
            data.S_Name = results[0].S_Name;
            data.S_Phone = results[0].S_Phone;
            data.S_Web = results[0].S_Web;
            data.S_Manager = results[0].S_Manager;
            data.S_Manager_phone = results[0].S_Manager_phone;
            data.S_Remark = results[0].S_Remark;
            
        }

        html += `<script>
        ${setMsgbox(msgbox)}
        setSupplier_edit(${JSON.stringify(data)})
        </script>
        `;
        res.end(html)
    })
})
router.get('/resource',(req,res)=>{
    res.end();
})












async function create_Supplier(data){
    let S_ID = await NextID('Supplier','S_ID','S');
    let S_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
    let R_ID = data.R_ID;

    
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
                reject();
            }else{
                resolve();
            }
        })
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




module.exports = router;