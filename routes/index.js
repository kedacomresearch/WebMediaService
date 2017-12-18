/**
 * Created by GanChao on 2017/12/14.
 */

const Router = require('koa-router');
const router = new Router();
const webmediaRouter = require('./wms/routes');
const pwvmsRouter = require('./pwvms/routes');
const deviceRouter = require('./device/routes');

router.get('/', async (ctx, next) => {
    await ctx.render('index');
});

router.use('/wms/webmedia', webmediaRouter.routes(), webmediaRouter.allowedMethods());
router.use('/wms/pwvms', pwvmsRouter.routes(), pwvmsRouter.allowedMethods());
router.use('/wms/device', deviceRouter.routes(), deviceRouter.allowedMethods());

module.exports = router;
