const express = require('express');
const router = express.Router();
const {readFileSync} = require('fs');
const supplier = require('../model/supplier');
const db = require('../db');
const {Administrator_verafication,setMsgbox,NextID,checkData} = require('../function');
const moment = require('moment-timezone');


router.use(Administrator_verafication);


router.get('/',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier/supplier.html','utf-8');
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

    supplier.Delete_Supplier(S_ID).then(()=>{
        db.execute(`SELECT * FROM Supplier ORDER BY S_ID;`,(err,results)=>{
            if(err){
                console.log(err);
                data.msg = "dberr";
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
                data.msg = "dberr";
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
    }).catch((info)=>{
        res.json({"msg":info})
    })    
})


router.get('/add',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier/supplier_add.html','utf-8');
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
    
    supplier.Create_Supplier(req.body).then(()=>{
        res.writeHead(303,{Location:'/backend/supplier'});
        res.end();
    }).catch((info)=>{
        if(info == 'dberr'){
            res.writeHead(303,{Location:'/backend/supplier/add?data=create_err'});
        }else{
            res.writeHead(303,{Location:'/backend/supplier/add?data=err'});
        }
        res.end();
    })
})


router.get('/edit',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier/supplier_edit.html','utf-8');
    let S_ID = req.query.S_ID;

    html += `
    <script>
    getSupplier_edit('${S_ID}');
    </script>`
    res.end(html);
})


router.post('/edit/data',(req,res)=>{
    let S_ID = req.body.S_ID;
    let data = {
        "S_ID" : "",
        "S_Name" : "",
        "S_Phone" : "",
        "S_Web" : "",
        "S_Manager" : "",
        "S_Manager_phone" : "",
        "S_Remark" : "",
        "msgbox" : "",
    }
    
    db.execute(`SELECT * FROM Supplier WHERE S_ID = ?`,[S_ID],(err,results)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤<br>';
        }else{
            data.S_ID = results[0].S_ID;
            data.S_Name = results[0].S_Name;
            data.S_Phone = results[0].S_Phone;
            data.S_Web = results[0].S_Web;
            data.S_Manager = results[0].S_Manager;
            data.S_Manager_phone = results[0].S_Manager_phone;
            data.S_Remark = results[0].S_Remark;
            
        }

        
        res.json(data);
    })
})


router.post('/edit/save',(req,res)=>{
   

    supplier.Edit_Supplier(req.body).then(()=>{
        res.json({"msg" : "success"});
    }).catch((info)=>{
        res.json({"msg" : info});
    })

    // if(checkData(S_ID) && checkData(S_Name)){
    //     db.execute(`SELECT S_ID FROM Supplier WHERE S_ID = ?;`,[S_ID],(err,results)=>{  //確認是否有此供應商續號
    //         if(err){
    //             console.log(err);
    //             res.json({"msg" : "dberr"})
    //         }else if(results.length == 0){
    //             res.json({"msg" : "nodata"});
    //         }else{
    //             new Promise((resolve,reject)=>{
    //                 resolve(update_Supplier(req.body));
    //             }).then((result)=>{
    //                 res.json({"msg" : "success"});
    //             }).catch((re)=>{
    //                 res.json({"msg" : re});
    //             })              
    //         }
    //     })
    // }else{
    //     res.json({"msg" : "dataerr"})
    // }
})





router.get('/resource',(req,res)=>{
    let html = readFileSync('./public/html/back_end/supplier/supplier_r.html','utf-8');
    let S_ID = req.query.S_ID;
    
    html += `
    <script>
    getSupplier_r('${S_ID}');
    </script>`
    res.end(html);
})


router.post('/resource/data',(req,res)=>{
    let S_ID = req.body.S_ID;
    let data = {
        "S_ID" : S_ID,
        "S_Name" : "",
        "R_List" : [],
        "msgbox" : "",
    }
    
    db.execute(`SELECT S_Name FROM Supplier WHERE S_ID = ?`,[S_ID],(err,results)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤<br>';
        }else{
            data.S_Name = results[0].S_Name;
        }
    })
    db.execute(`SELECT D_Name,Resources3.R_ID,RD_Content,SB_ID FROM (SELECT Resources2.R_ID,Resources2.D_ID,SB_ID FROM (SELECT * FROM Resources WHERE R_Delete = 0) Resources2 LEFT JOIN 
    (SELECT * FROM Supplier_binding WHERE S_ID = ?) Supplier_binding ON Supplier_binding.R_ID = Resources2.R_ID) Resources3,Demand,
    Resource_data WHERE Resources3.D_ID = Demand.D_ID AND Resource_data.R_ID = Resources3.R_ID AND RD_Type = 2 AND Resource_data.L_ID = 'L000000001'
    AND Demand.L_ID = 'L000000001';`,[S_ID],(err,results)=>{
        if(err){
            console.log(err);
            data.msgbox += '資料庫錯誤<br>';
        }else{
            for(i = 0;i<results.length;i++){
                if(results[i].SB_ID == null || results[i].SB_ID == 'null'){
                    data.R_List.push({
                        "D_Name" : results[i].D_Name,
                        "R_ID" : results[i].R_ID,
                        "R_Name" : results[i].RD_Content,
                        "R_Check" : true
                    })
                }else{
                    data.R_List.push({
                        "D_Name" : results[i].D_Name,
                        "R_ID" : results[i].R_ID,
                        "R_Name" : results[i].RD_Content,
                        "R_Check" : false
                    })
                }
                
            }
            
        }

        res.json(data)
    })
})


router.post('/resource/save',(req,res)=>{
    let S_ID = req.body.S_ID;

    if(checkData(S_ID)){
        db.execute(`SELECT S_ID FROM Supplier WHERE S_ID = ?;`,[S_ID],(err,results)=>{  //確認是否有此供應商續號
            if(err){
                console.log(err);
                res.json({"msg" : "dberr"})
            }else if(results.length == 0){
                res.json({"msg" : "nodata"});
            }else{
                new Promise((resolve,reject)=>{
                    resolve(update_Supplier(req.body));
                }).then((result)=>{
                    res.json({"msg" : "success","num" : req.body.R_ID.length});
                })            
            }
        })
    }else{
        res.json({"msg" : "dataerr"})
    }
})



















module.exports = router;