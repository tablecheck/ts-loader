var Promise = window.Promise = require('q').Promise;
var LZString = require('lz-string');

var ls = window.localStorage;
var prefix = 'lspfs:';

function Writer(path, onerror) {
  this.onwriteend = function () {};
  this.onerror = onerror;
  this.write = function (blob) {
    var that = this;
    var fileReader = new FileReader();

    fileReader.onload = function(e) {
      var compressed = LZString.compressToUTF16(e.target.result);

      try {
        ls.setItem(prefix + path, compressed);
      } catch (e) {
        that.onerror(e);
      }

      that.onwriteend();
    };

    fileReader.onerror = this.onerror;

    fileReader.readAsText(blob);
  };
}

function File(path) {
  this.createWriter = function (cb, onerror) {
    cb(new Writer(path, onerror));
  };
}

function dir(path) {
  return Promise.resolve({ nativeURL: path });
}

function dirname() {
  return Promise.resolve();
}

function ensure() {
  return Promise.resolve();
}

function exists(path) {
  return Promise.resolve(ls.hasOwnProperty(prefix + path));
}

function file(path) {
  return Promise.resolve(new File(path));
}

function read(path) {
  var compressed = ls.getItem(prefix + path);

  if (compressed === null) {
    var error = new Error('no such file or directory \'' + path + '\'');
    error.code = 'ENOENT';

    return Promise.reject(error);
  }

  var decompressed = LZString.decompressFromUTF16(compressed);

  return Promise.resolve(decompressed);
}

function readJSON(path) {
  return read(path).then(function (content) {
    return JSON.parse(content);
  });
}

function remove() {
  return Promise.resolve();
}

module.exports = {
  dir: dir,
  dirname: dirname,
  ensure: ensure,
  exists: exists,
  file: file,
  read: read,
  readJSON: readJSON,
  remove: remove
};
