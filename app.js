const express = require('express');
const app = express();
const port = 3008 || process.env.PORT;
const {readFileSync} = require('fs');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cookie_time = 1000 * 60 * 60 * 4 //四小時


const sign_in = require('./router/sign_in');
const sign_out = require('./router/sign_out');
const resource = require('./router/resource');
const language = require('./router/language');


app.use(express.static('public'));
app.use(express.urlencoded({extended:false,limit:'350kb'}));
app.use(bodyParser.json());
app.use(cookieSession({
    name:'session',
    keys:['key1'],

    maxAge: cookie_time,
    sameSite : 'lax'
}));

app.use('/sign_in',sign_in);
app.use('/sign_out',sign_out);
app.use('/backend/resource',resource);
app.use('/backend/language',language);



app.get('/',(req,res)=>{
    let html = readFileSync('./public/html/index.html','utf-8');
    res.end(html);
})





app.listen(port,()=>{
    console.log('the DSN is running on the port ' + port);
})




