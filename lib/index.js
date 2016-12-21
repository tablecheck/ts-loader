var loader = require('./loader.js');
var customSplash = require('./custom-splash.js');

var isCordova = typeof window !== 'undefined' && typeof window.cordova !== 'undefined';
var deviceReady = !isCordova;
var loaded = false;
var loading = false;

function detectNavigatorLocale() {
  var language = window.navigator.language;

  if (language.match(/^en/i)) {
    return 'en';
  } else if (language.match(/^fr/i)) {
    return 'fr';
  } else if (language.match(/^it/i)) {
    return 'it';
  } else if (language.match(/^ko/i)) {
    return 'ko';
  } else if (language.match(/^(zh[_-]tw|zh[_-]hk)/i)) {
    return 'zh-TW';
  } else if (language.match(/^zh/i)) {
    return 'zh-CN';
  } else {
    return 'ja';
  }
}

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

function getConfig() {
  var scriptNodes = document.getElementsByTagName('script');
  var currentlyLoadedScript = scriptNodes[scriptNodes.length - 1];
  return currentlyLoadedScript.dataset;
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

    if (typeof window.I18n !== 'undefined') {
      window.I18n.locale = detectNavigatorLocale();
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
