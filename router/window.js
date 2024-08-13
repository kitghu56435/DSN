const express = require('express');
const router = express.Router();
const db = require('../db');
const {Administrator_verafication} = require('../function');


router.use(Administrator_verafication);


/*--------- selectR -----------------------------------------------------------*/ 



router.post('/selectR_data',(req,res)=>{
    let selectR_data = []

    db.execute(`SELECT Resource_data.R_ID,RD_Content FROM Resources,Resource_data WHERE Resources.R_ID = Resource_data.R_ID AND RD_Type = 2 AND L_ID = 'L000000001' AND R_Delete = 0;`,(err,result)=>{
        if(err){
            res.json({'msg':'dberr'});
        }else{
            for(i = 0;i < result.length;i++){
                selectR_data.push({
                    "R_ID" : result[i].R_ID,
                    "R_Name" : result[i].RD_Content,
                    "Check" : false
                })
            }


            res.json(selectR_data);
        }
    })
})



/*-----------------------------------------------------------------------------*/ 



module.exports = router;