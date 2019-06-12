const Homey = require('homey');
const fetch = require('node-fetch');

exports.sendGetCommand = function (endpoint, address) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address + endpoint, {
        method: 'GET',
        headers: {'Authorization': 'None'}
      })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        return resolve(json);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.sendPostCommand = function (endpoint, address, params) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address + endpoint, {
      method: 'POST',
      body:    JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
      })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        return resolve(json);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.status);
  }
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}