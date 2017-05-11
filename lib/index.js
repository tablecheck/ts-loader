require('./classlist-polyfill.js');
require('./dataset-polyfill.js');

var loader = require('./loader.js');
var customSplash = require('./custom-splash.js');

var isCordova = typeof window !== 'undefined' && typeof window.cordova !== 'undefined';
var deviceReady = !isCordova;
var loaded = false;
var loading = false;

function getDiv(id) {
  var loaderError = document.getElementById(id);

  if (!loaderError) {
    loaderError = document.createElement('DIV');
    loaderError.id = id;
    document.body.appendChild(loaderError);
  }

  return loaderError;
}

function showErrorMessage(message) {
  if (loaded) {
    return;
  }

  var loaderError = getDiv('loader-error');

  loaderError.innerHTML = 'Error: ' + message;
  loaderError.style.display = 'block';

  window.setTimeout(function () {
    customSplash.hideLoader();
  }, 200);
}

function parseDataAttribute (dataAttribute) {
  if (!dataAttribute || dataAttribute.toLowerCase() === 'true') {
    return true;
  } else if (dataAttribute.toLowerCase() === 'false') {
    return false;
  }
  return dataAttribute;
}


function getConfig() {
  var scriptNodes = document.getElementsByTagName('script');
  var currentlyLoadedScript = scriptNodes[scriptNodes.length - 1];
  var dataset = Object.keys(currentlyLoadedScript.dataset || {}).reduce(function(values, key) {
    var value = currentlyLoadedScript.dataset[key];
    values[key] = parseDataAttribute(value);
    return values;
  }, {});
  return dataset;
}

function startLoading(event) {
  if (event.type === 'deviceready') {
    deviceReady = true;
  }

  if (loading || !deviceReady) {
    return;
  }

  loading = true;

  var config = getConfig();

  if (typeof window !== 'undefined' && typeof window.StatusBar !== 'undefined') {
    var statusBarBackgroundColor = config.statusBarBackgroundColor || '#282828';

    window.StatusBar.backgroundColorByHexString(statusBarBackgroundColor);
    window.StatusBar.overlaysWebView(false);
  }

  var fullHeight = document.documentElement.clientHeight;

  var statusBarTimeout = window.setTimeout(function () {
    customSplash.setStatusBarHeight(fullHeight - document.documentElement.clientHeight);
    customSplash.show();
  }, 0);

  var splashscreenTimeout = window.setTimeout(function () {
    customSplash.showLoader();
    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  }, 200);

  loader.on('loaded', function () {
    window.clearTimeout(statusBarTimeout);
    window.clearTimeout(splashscreenTimeout);

    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }

    if (window.plugins && window.plugins.notification) {
      window.plugins.notification.badge.hasPermission(function (granted) {
        if (!granted) {
          window.plugins.notification.badge.registerPermission();
        }
      });
    }

    window.setTimeout(function () {
      customSplash.hide();
    }, 200);

    loader.removeAllListeners();
    loader = null;

    loaded = true;
  });

  loader.on('error', showErrorMessage);

  loader.on('progress', function (loaded, total) {
    var progress = Math.max(Math.min(Math.round(100 * loaded / total), 100), 0) + '%';
    customSplash.setProgress(progress);
  });

  if (navigator.connection && window.Connection && navigator.connection.type === window.Connection.NONE) {
    return showErrorMessage('Please check your internet connection.');
  }

  loader.load(config);
}

document.addEventListener('deviceready', startLoading, false);
document.addEventListener('DOMContentLoaded', startLoading, false);

window.onerror = function (message) {
  showErrorMessage(message);
};

customSplash.create();
