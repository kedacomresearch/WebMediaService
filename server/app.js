/**
 * Created by GanChao on 2017/12/13.
 */

const Koa = require('koa');
const loggerAsync = require('./middleware/logger-async');
const errorHandler = require('./middleware/error-handler');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const views = require('koa-views');
const static = require('koa-static');
const router = require('./routes');


const https = require('https');
const http = require('http');
const fs = require("fs");

const privateKey  = fs.readFileSync('./public/sslfiles/private.pem', 'utf8');
const certificate = fs.readFileSync('./public/sslfiles/file.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const app = new Koa();

app.use(bodyParser());
app.use(errorHandler());

app.use(logger());

app.use(views(__dirname + '/public/views',{ extension: 'html' }));
app.use(static(__dirname + '/public'));

app.use(loggerAsync());

app.use(router.routes()).use(router.allowedMethods());

app.on('error', function(err, ctx){
    console.log('server error', err, ctx);
    ctx.status = 500;
});

https.createServer(credentials,app.callback()).listen(5003, () => {
    console.log('WMS https server listening on port 5003');
});

http.createServer(app.callback()).listen(5002, () => {
    console.log('WMS http server listening on port 5002');
});
