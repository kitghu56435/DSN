const express = require('express');
const app = express();
const port = 3008 || process.env.PORT;
const {readFileSync} = require('fs');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')
const {setCookie} = require('./function');
const cookie_time = 1000 * 60 * 60 * 4 //四小時


const sign_in = require('./router/sign_in');
const sign_out = require('./router/sign_out');
const resource = require('./router/resource');
const resourceInfo = require('./router/resourceInfo');
const static = require('./router/static');
const language = require('./router/language');
const supplier = require('./router/supplier');
const message = require('./router/message');
const search = require('./router/search');


app.use(express.static('public'));
app.use(express.urlencoded({extended:false,limit:'300M'}));
app.use(cookieParser(process.env.cookieSecret));
app.use(setCookie);   //初始化cookie
app.use(bodyParser.json());
app.use(cookieSession({
    name:'session',
    keys:['key1'],

    maxAge: cookie_time,
    sameSite : 'lax'
}));




app.use('/sign_in',sign_in);
app.use('/sign_out',sign_out);
app.use('/resource',resourceInfo);
app.use('/static',static);
app.use('/backend/resource',resource);
app.use('/backend/language',language);
app.use('/backend/supplier',supplier);
app.use('/backend/message',message);
app.use('/search',search);



app.get('/',(req,res)=>{
    let html = readFileSync('./public/html/index.html','utf-8');
    html += `<script>setSearch_window_L_ID('${req.cookies.leng}')</script>`;
    if(req.cookies.accept == 'null'){
        html +=  `<script>cookie_msg()</script>`;
    }
    res.end(html);
})



app.post('/cookie',(req,res)=>{
    let accept = req.body.accept
    if(accept == 'none'){
        res.cookie('accept', accept,{
            httpOnly : true,
            maxAge : 1000 * 60 * 60 * 24 * 356   //一年
        });
    }else if(accept == 'delete'){
        res.cookie('accept', accept,{
            httpOnly : true,
            maxAge : 1000 * 60 * 60 * 24 * 356   //一年
        });
    }else if(accept == 'accept'){
        res.cookie('accept', accept,{
            httpOnly : true,
            maxAge : 1000 * 60 * 60 * 24 * 356   //一年
        });
    }
    
    res.end();
})
app.post('/leng',(req,res)=>{
    let L_ID = req.body.L_ID;
    res.cookie('leng', L_ID,{
        httpOnly : true,
        maxAge : 1000 * 60 * 60 * 24 * 356   //一年
    });
    
    res.end();
})





app.listen(port,()=>{
    console.log('the DSN is running on the port ' + port);
})




