/**
 * Created by Gan on 2017/7/11.
 */

const onvifClient = require('./onvifClient');


module.exports.getStreamUri = async function (ip, profileToken) {
  return await onvifClient.getStreamUriClient(ip, profileToken);
};

module.exports.getStreamConfig = async function (ip) {
    return await onvifClient.getStreamConfigClient(ip);
};

module.exports.getSnapshotUri =  async function (ip, ptzCmd) {
    return await onvifClient.getSnapshotUriClient(ip,ptzCmd);
};

module.exports.getVideoConfig = (req, res) => {
    onvifClient.getVideoConfigClient(req,res);
};