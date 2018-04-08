const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const mediaRouter = require('./routes');

const app = new Koa();

app.use(bodyParser());

// 装载所有子路由
let router = new Router();

router.use('/', mediaRouter.routes(), mediaRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

module.exports = app;
