const Router = require('koa-router');
const router = new Router();
const fileReader = require('../util/fileReader');

router.get('/registered', async (ctx, next) => {
    let list = await fileReader.getRegisteredDevice();
    if(list instanceof Array === true ) {
        ctx.body = list;
        ctx.status = 200;
    } else {
        ctx.body = [];
    }
});

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        obj[k] = v;
    }
    return obj;
}

module.exports = router;
