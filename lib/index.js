var loader = require('./loader');
var customSplash = require('./splashscreen');

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

function showErrorMessage(message) {
  var error = document.getElementById('loader-error');
  error.style.display = 'block';
  error.innerHTML = 'Error: ' + message;
  window.setTimeout(function () {
    customSplash.hideLoader();
  }, 200);
}

var loading = false;

function getConfig() {
  var scriptNodes = document.getElementsByTagName('script');
  var currentlyLoadedScript = scriptNodes[scriptNodes.length - 1];
  var config = currentlyLoadedScript.dataset;
  return config;
}

function startLoading() {
  if (loading) {
    return;
  }

  loading = true;

  if (window.StatusBar) {
    window.StatusBar.backgroundColorByHexString('#282828');
    window.StatusBar.overlaysWebView(false);
  }

  var fullHeight = document.documentElement.clientHeight;

  customSplash.setStatusBarHeight(fullHeight - document.documentElement.clientHeight);
  customSplash.show();

  var splashscreenTimeout = window.setTimeout(function () {
    customSplash.showLoader();
    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  }, 200);

  loader.on('loaded', function () {
    window.clearTimeout(splashscreenTimeout);

    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }

    if (window.cordova) {
      window.cordova.plugins.notification.badge.hasPermission(function (granted) {
        if (!granted) {
          window.cordova.plugins.notification.badge.registerPermission();
        }
      });
    }

    if (window.I18n) {
      window.I18n.locale = detectNavigatorLocale();
    }

    window.setTimeout(function () {
      customSplash.hide();
    }, 200);
  });

  loader.on('error', showErrorMessage);

  loader.on('progress', function (loaded, total) {
    var progress = Math.max(Math.min(Math.round(100 * loaded / total), 100), 0) + '%';
    customSplash.setProgress(progress);
  });

  if (navigator.connection && window.Connection && navigator.connection.type === Connection.NONE) {
    return showErrorMessage('Please check your internet connection.');
  }

  var config = getConfig();

  loader.load(config);
}

document.addEventListener('deviceready', startLoading, false);
document.addEventListener('DOMContentLoaded', startLoading, false);

customSplash.create();
