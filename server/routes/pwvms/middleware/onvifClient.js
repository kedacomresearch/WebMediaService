/**
 * Created by Gan on 2017/7/11.
 */

const onvif = require('onvif');
const Promise = require('bluebird');

var Cam = onvif.Cam;

// const ipListCache = require('./ip-list-cache');
const ipListCache = null;

module.exports.getStreamConfigClient = function (ip) {
    return new Promise( (resolve, reject) => {
        if(ip && typeof ip === 'string')
        {
            let options = {
                hostname: ip
            };
            let ipc = new Cam(options);
            ipc.connect(function (err) {
                if(err)
                {
                    reject(err);
                }
                let profiles = ipc.profiles,
                    videoConfig = [];

                if(profiles) {
                    for(let profile of profiles) {
                        let profileToken = profile.$.token,
                            resolution = profile.videoEncoderConfiguration.resolution.height;
                        videoConfig.push({
                            profileToken,
                            resolution
                        })
                    }
                }
                ipc.getNodes(function(err, data) {
                    if(err)
                    {
                        resolve({
                            videoConfig: videoConfig,
                            ptzEnabled: false
                        });
                    }
                    console.log(`getNodes:`);
                    console.log(data);
                    console.log(`\n`);
                    resolve({
                        videoConfig: videoConfig,
                        ptzEnabled: Boolean(data ) === true
                    });
                });
            });
        }
        else
        {
            reject(new Error('NotFound'));
        }
    });
};

module.exports.getStreamUriClient = function (ip, profileToken) {
    return new Promise( (resolve, reject) => {
        if(ip && typeof ip === 'string')
        {
            let options = {
                hostname: ip
            };
            let ipc = new Cam(options);
            ipc.connect(function (err) {
                if(err)
                {
                    reject(err);
                }

                ipc.getStreamUri({
                    protocol: 'RTSP',
                    profileToken: profileToken
                }, function (err, stream) {
                    if(err)
                    {
                        reject(err);
                    }
                    if(stream)
                    {
                        console.log(stream.uri);
                        resolve(stream.uri);
                    }
                })
            });
        }
        else
        {
            reject(new Error('NotFound'));
        }
    });
};

module.exports.getSnapshotUriClient = function (req,res) {
    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if(ip == undefined)
        {
            notFoundResponse(res);
            return;
        }
        getSnapUri(ip, res);
    }).catch(err => {
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    })
}


function getSnapUri(ip, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        cam.getSnapshotUri({protocol:'RTSP'},function(err, stream) {
            if(err)
            {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
            console.log(stream.uri);
            res.send({snapshot: stream.uri});
        });
    });
}

module.exports.getNodesClient = function (req,res) {
    let ip = req.query.ip;

    if(ip)
    {
        getNodes(ip, res);
    }
    else
    {
        notFoundResponse(res);
    }



/*    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if(ip == undefined)
        {
            notFoundResponse(res);
            return;
        }
        getNodes(ip, res);
    }).catch(err => {
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    })*/
}


function getNodes(ip, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        cam.getNodes(function(err, data) {
            if(err)
            {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
            res.send({ptzNodes: data});
        });
    });
}

module.exports.getPresetsClient = (req, res) => {
    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if(ip == undefined)
        {
            notFoundResponse(res);
            return;
        }
        getPresets(ip, res);
    }).catch(err => {
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    })
};

function getPresets(ip, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        cam.getPresets(function(err, data) {
            let itemlist = [];
            for (let key of Object.keys(data)) {
                let obj = {};
                obj.ID = data[key];
                obj.name = key;
                itemlist.push(obj);
            }
            res.send({preset: itemlist});
        });
    });
}

module.exports.relativeMoveClient = function (req,res) {
    let panTiltZoom = req.body.ptz;
    let x = panTiltZoom.x;
    let y = panTiltZoom.y;
    let zoom = panTiltZoom.zoom;
    if( x < -1 || x > 1 || y < -1 || y > 1 || zoom < -1 || zoom > 1)
    {
        res.statusCode = 400;
        return res.json({message: 'Bad Request'});
    }


    let ptzObj = {x: x, y:y, zoom: zoom};
    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if(ip == undefined)
        {
            notFoundResponse(res);
            return;
        }
        relativeMove(ip, ptzObj, res);
    }).catch(err => {
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    })
}

function relativeMove(ip, ptzObj, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        cam.relativeMove(ptzObj, function(err, data) {
            if(err)
            {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
            res.end();
        });
    });
}

module.exports.absoluteMoveClient = function (req,res) {
    let panTiltZoom = req.body.ptz;
    let x = panTiltZoom.x;
    let y = panTiltZoom.y;
    let zoom = panTiltZoom.zoom;
    if( x < -1 || x > 1 || y < -1 || y > 1 || zoom < -1 || zoom > 1)
    {
        res.statusCode = 400;
        return res.json({message: 'Bad Request'});
    }

    let ptzObj = {x: x, y:y, zoom: zoom};
    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if(ip == undefined)
        {
            notFoundResponse(res);
            return;
        }
        absoluteMove(ip, ptzObj, res);
    }).catch(err => {
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    })
}

function absoluteMove(ip, ptzObj, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err)
        {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        cam.absoluteMove(ptzObj, function(err, data) {
            if(err)
            {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
            res.send(data);
        });
    });
}

module.exports.continuousMoveClient = function (options, ip) {
    return new Promise( (resolve, reject) => {
        console.log('ip:%s', ip);
        let cam = new Cam({
            hostname: ip
        });

        cam.connect(function(err){
            if(err) {
                reject(err);
            }
            console.log('continuousMove:');
            console.log(options);
            cam.continuousMove(options, function(err, data) {
                if(err) {
                    console.log('continuousMove:');
                    console.log(err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

module.exports.stopMoveClient = function (options, ip) {
    return new Promise( (resolve, reject) => {
        console.log('ip:%s', ip);
        let cam = new Cam({
            hostname: ip
        });

        cam.connect(function(err){
            if(err) {
                reject(err);
            }
            console.log('stopMove:');
            console.log(options);
            cam.stop(options, function(err, data) {
                if(err) {
                    console.log('stopMove:');
                    console.log(err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

module.exports.gotoPresetClient = (req, res) => {
    if (req.body.presetID && req.body.presetName) {
        ipListCache.getIpByuuid(req.params.uuid).then(ip => {
            console.log('ip:%s', ip);
            if (ip == undefined) {
                notFoundResponse(res);
                return;
            }
            gotoPreset(ip, req, res);
        }).catch(err => {
            if(err) {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
        });
    }
    else {
        res.statusCode = 400;
        return res.json({message: 'Bad Request'});
    }

};

function gotoPreset(ip, req, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err) {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        cam.gotoPreset( {preset: req.body.presetID}, function(err, data) {
            if(err) {
                res.statusCode = 500;
                return res.json({message: err.message ? err.message : 'Internal Server Error.'});
            }
            res.end();
        });
    });
}

module.exports.getVideoConfigClient = (req, res) => {
    ipListCache.getIpByuuid(req.params.uuid).then(ip => {
        console.log('ip:%s', ip);
        if (ip == undefined) {
            notFoundResponse(res);
            return;
        }
        getVideoConfig(ip, res);
    }).catch(err => {
        if(err) {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
    });
};

function getVideoConfig(ip, res) {
    let cam = new Cam({
        hostname: ip
    });

    cam.connect(function(err){
        if(err) {
            res.statusCode = 500;
            return res.json({message: err.message ? err.message : 'Internal Server Error.'});
        }
        let itemlist = [];
        for (let [index, item] of cam.activeSources.entries()) {
            let obj = {};
            obj.streamName = item.sourceToken;
            obj.encType = item.encoding;
            obj.resolution = {height:item.height, width: item.width};
            itemlist.push(obj);
        }
        res.send({itemlist: itemlist});
    });
}