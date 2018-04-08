const Koa = require('koa');

const Router = require('koa-router');
const deviceManagerRouter = require('./routes');

const app = new Koa();

// 装载所有子路由
let router = new Router();

router.use('/', deviceManagerRouter.routes(), deviceManagerRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

module.exports = app;
