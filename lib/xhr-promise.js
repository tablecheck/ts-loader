var Promise = require('q').Promise;

function xhrPromise(url, responseType) {
  responseType = responseType || 'arraybuffer';

  return new Promise(function (resolve, reject, progress) {
    var xhr = new window.XMLHttpRequest();

    xhr.onload = function () {
      if (this.status !== 200) {
        return reject('xhr status: ' + this.status + ', url: ' + url);
      }

      return resolve({ response: this.response, contentType: this.getResponseHeader('Content-Type')});
    };

    xhr.onerror = function () {
      return reject('xhr failed: ' + url);
    };

    xhr.ontimeout = function () {
      return reject('xhr timeout: ' + url);
    };

    xhr.onabort = function () {
      return reject('xhr abort: ' + url);
    };

    xhr.addEventListener('progress', progress);

    xhr.open('GET', url, true);

    // For IE, set the responseType after open.
    xhr.responseType = responseType;

    xhr.send();
  });
}

module.exports = xhrPromise;
