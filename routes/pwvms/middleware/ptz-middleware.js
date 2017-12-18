/**
 * Created by Gan on 2017/7/11.
 */


const onvifClient = require('./onvifClient');
const Promise = require('bluebird');

module.exports.getNodes = (req, res) => {
    onvifClient.getNodesClient(req,res);
};

module.exports.ptzCommand = async function(ip, ptzCmd){
    try
    {
        console.log('ptzCmd:');
        console.log(ptzCmd);

        let panVelocity;
        if(ptzCmd.pan && ptzCmd.pan.direction && ptzCmd.pan.speed)
        {
            switch (ptzCmd.pan.direction.toUpperCase())
            {
                case 'LEFT':
                    panVelocity = Number(`-${ptzCmd.pan.speed}`);
                    break;
                case 'RIGHT':
                    panVelocity = Number(`${ptzCmd.pan.speed}`);
                    break;
            }
        }
        let tiltVelocity;
        if(ptzCmd.tilt && ptzCmd.tilt.direction && ptzCmd.tilt.speed)
        {
            switch (ptzCmd.tilt.direction.toUpperCase())
            {
                case 'UP':
                    tiltVelocity = Number(`${ptzCmd.tilt.speed}`);
                    break;
                case 'DOWN':
                    tiltVelocity = Number(`-${ptzCmd.tilt.speed}`);
                    break;
            }
        }
        let zoomVelocity;
        if(ptzCmd.zoom && ptzCmd.zoom.direction && ptzCmd.zoom.speed)
        {
            switch (ptzCmd.zoom.direction.toUpperCase())
            {
                case 'OUT':
                    zoomVelocity = Number(`-${ptzCmd.zoom.speed}`);
                    break;
                case 'IN':
                    zoomVelocity = Number(`${ptzCmd.zoom.speed}`);
                    break;
            }
        }
        let options, stopOptions;

        options = {
            x: panVelocity ? panVelocity : null,
            y: tiltVelocity ? tiltVelocity : null,
            zoom: zoomVelocity ? zoomVelocity : null
        };
        stopOptions = {
            panTilt: (panVelocity || tiltVelocity) ? false : true,
            zoom: zoomVelocity ? false : true
        };

        let promiseArray = [];
        if(stopOptions)
        {
            let promise = onvifClient.stopMoveClient(stopOptions, ip);
            promiseArray.push(promise);
        }
        if(options)
        {
            let x = options.x;
            let y = options.y;
            let zoom = options.zoom;
            if( x < -1 || x > 1 || y < -1 || y > 1 || zoom < -1 || zoom > 1)
            {
                return Promise.reject(Error('request error'));
            }
            let promise = onvifClient.continuousMoveClient(options, ip);
            promiseArray.push(promise);
        }
        return Promise.all(promiseArray);
    }
    catch (err)
    {
        return Promise.reject(err);
    }
};