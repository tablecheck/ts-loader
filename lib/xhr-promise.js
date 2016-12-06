var Promise = require('q').Promise;

function xhrPromise(url, responseType) {
  responseType = responseType || 'arraybuffer';

  return new Promise(function (resolve, reject, progress) {
    var xhr = new window.XMLHttpRequest();

    xhr.onload = function (e) {
      if (this.status !== 200) {
        return reject('xhr status: ' + this.status + ', url: ' + url);
      }

      resolve({ response: this.response, contentType: this.getResponseHeader('Content-Type')});
    };

    xhr.onerror = function (e) {
      reject('xhr failed: ' + url);
    }
    xhr.ontimeout = function () {
      reject('xhr timeout: ' + url)
    };
    xhr.onabort = function () {
      reject('xhr abort: ' + url)
    };
    xhr.addEventListener('progress', progress);

    xhr.open('GET', url, true);

    // For IE, set the responseType after open.
    xhr.responseType = responseType;

    xhr.send();
  });
}

module.exports = xhrPromise;
