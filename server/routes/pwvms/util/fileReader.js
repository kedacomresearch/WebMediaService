/**
 * Created by Gan on 2017/11/1.
 */

const fs = require('fs');
const Promise = require('bluebird');

const registeredDeviceListFile = './wms/util/registeredDeviceList.json';

function getRegisteredDevice() {
    return new Promise( (resolve, reject) => {
        fs.readFile(registeredDeviceListFile, 'utf8', (err, data) => {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(JSON.parse(data))
            }
        });
    });
}

module.exports = {
    getRegisteredDevice,
};