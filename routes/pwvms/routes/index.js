const Router = require('koa-router');
const router = new Router();
const querystring = require('querystring');

const mediaMiddleware = require('../middleware/media-middleware');
const ptzMiddleware = require('../middleware/ptz-middleware');

router.get('/media/streamuri', async (ctx, next) => {
    let queryObj = querystring.parse(ctx.querystring),
        ip = queryObj.ip,
        profileToken = queryObj.profileToken;
    console.log(`streamuri, ip: ${ip}`);
    console.log(`streamuri, profileToken: ${profileToken}`);


    let streamuri = await mediaMiddleware.getStreamUri(ip, profileToken);
    console.log(`streamuri:`);
    console.log(streamuri);
    ctx.body = streamuri;
    ctx.status = 200;
});

router.get('/media/streamconfig', async (ctx, next) => {

    let ip = querystring.parse(ctx.querystring).ip;
    console.log(`streamconfig, ip: ${ip}`);


    let videoConfig = await mediaMiddleware.getStreamConfig(ip);
    console.log(`videoConfig:`);
    console.log(videoConfig);
    ctx.body = videoConfig;
    ctx.status = 200;
});

router.post('/ptz/command', async (ctx, next) => {
    let ip = querystring.parse(ctx.querystring).ip,
        body  = ctx.request.body;
    console.log(`ptzCommand, ip: ${ip}`);
    let res = await ptzMiddleware.ptzCommand(ip, body.ptzCmd);
    if(res instanceof Error) {
        ctx.status = 400;
    } else {
        ctx.status = 200;
    }
});



module.exports = router;
