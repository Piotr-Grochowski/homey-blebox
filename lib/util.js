const Homey = require('homey');
const http = require('http.min');


exports.sendGetCommand = function (endpoint, address) {
  return new Promise(function (resolve, reject) {
    http.get('http://'+ address + endpoint)
      .then(checkStatus)
      .then(res => JSON.parse(res))
      .then(json => {
        return resolve(json);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

function checkStatus(res) {
  if (res.response.statusCode==200) {
    return res.data;
  } else {
    throw new Error(res.response.statusCode);
  }
}