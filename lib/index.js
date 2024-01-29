import 'classlist-polyfill';
import 'element-dataset';

import Loader from './Loader';
import customSplash from './custom-splash';
import isCordova from './isCordova';

const UNKNOWN_ERROR = 'An unknown error occurred';

let deviceReady = !isCordova;
let loaded = false;
let loading = false;
let config;

function createElement(id, type) {
  const element = document.createElement(type || 'DIV');
  element.id = id;
  return element;
}

function getErrorLoaderDiv() {
  const loaderId = 'loader-error';
  const loaderMessageId = 'loader-error-message';
  let loaderError = document.getElementById(loaderId);
  let loaderMessage = document.getElementById(loaderMessageId);

  const api = {
    setMessage: (message) => {
      loaderMessage.innerHTML = `${message}, please try again.`;
    },
    show: () => {
      loaderError.style.display = 'block';
    },
    hide: () => {
      loaderError.style.display = 'none';
    }
  };

  if (!loaderError) {
    loaderError = createElement(loaderId);
    loaderMessage = createElement(loaderMessageId);
    const reloadButton = createElement('error-reload-button', 'button');

    reloadButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" style="fill: currentColor;"><g id="budicon-reload-ui"><path d="M25,12.5A12.4961,12.4961,0,0,0,1,7.6162V1.5a.5.5,0,0,0-1,0v7A.5.5,0,0,0,.5,9h7a.5.5,0,0,0,0-1H1.9285A11.4931,11.4931,0,0,1,24,12.5l0,0,0,0V13.5a.5.5,0,0,0,1,0v-.9985l0-.001Z"/><path d="M24.5,16h-7a.5.5,0,0,0,0,1h5.5715A11.4931,11.4931,0,0,1,1,12.5l0,0,0,0V11.5a.5.5,0,0,0-1,0v.9985L0,12.5l0,0a12.4961,12.4961,0,0,0,24,4.8838V23.5a.5.5,0,0,0,1,0v-7A.5.5,0,0,0,24.5,16Z"/></g></svg>';
    loaderMessage.innerHTML = 'An unexpected error occurred, please try again.';

    reloadButton.onclick = () => {
      api.hide();
      // It's in a callback so it will be defined when it's called
      // eslint-disable-next-line no-use-before-define
      startLoading();
    };

    loaderError.appendChild(loaderMessage);
    loaderError.appendChild(reloadButton);
    document.body.appendChild(loaderError);
  }

  return api;
}

function showErrorMessage(message) {
  loading = false;
  if (loaded) {
    return;
  }

  const loaderError = getErrorLoaderDiv();
  console.error(message);
  if (typeof message === 'string') {
    loaderError.setMessage(message);
  } else {
    loaderError.setMessage(UNKNOWN_ERROR);
  }
  loaderError.show();

  window.setTimeout(() => {
    customSplash.hideLoader();
  }, 200);
}

function parseDataAttribute(dataAttribute) {
  if (!dataAttribute || dataAttribute.toLowerCase() === 'true') {
    return true;
  }
  if (dataAttribute.toLowerCase() === 'false') {
    return false;
  }
  return dataAttribute;
}

function getConfig() {
  const scriptNodes = document.getElementsByTagName('script');
  const currentlyLoadedScript = scriptNodes[scriptNodes.length - 1];
  return Object.keys(currentlyLoadedScript.dataset || {}).reduce(
    (values, key) => {
      const value = currentlyLoadedScript.dataset[key];
      values[key] = parseDataAttribute(value);
      return values;
    },
    {}
  );
}

function startLoading(event) {
  if (event.type === 'deviceready') {
    deviceReady = true;
  }

  if (loading || !deviceReady) {
    return;
  }

  if (
    navigator.connection &&
    window.Connection &&
    navigator.connection.type === window.Connection.NONE
  ) {
    showErrorMessage('Please check your internet connection');
    return;
  }

  loading = true;

  const loader = new Loader(config).emitter;

  if (
    typeof window !== 'undefined' &&
    typeof window.StatusBar !== 'undefined'
  ) {
    const statusBarBackgroundColor =
      config.statusBarBackgroundColor || '#282828';

    window.StatusBar.backgroundColorByHexString(statusBarBackgroundColor);
    window.StatusBar.overlaysWebView(false);
  }

  const fullHeight = document.documentElement.clientHeight;

  const statusBarTimeout = window.setTimeout(() => {
    customSplash.setStatusBarHeight(
      fullHeight - document.documentElement.clientHeight
    );
    customSplash.show();
  }, 0);

  const splashscreenTimeout = window.setTimeout(() => {
    customSplash.showLoader();
    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  }, 200);

  loader.on('loaded', () => {
    window.clearTimeout(statusBarTimeout);
    window.clearTimeout(splashscreenTimeout);

    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }

    if (window.plugins && window.plugins.notification) {
      window.plugins.notification.badge.hasPermission((granted) => {
        if (!granted) {
          window.plugins.notification.badge.registerPermission();
        }
      });
    }

    window.setTimeout(() => {
      customSplash.hide();
    }, 200);

    loader.removeAllListeners();
    loaded = true;
    loading = false;
  });

  loader.on('error', () => {
    showErrorMessage(UNKNOWN_ERROR);
  });

  loader.on('progress', (current, total) => {
    const progress = Math.max(
      Math.min(Math.round((100 * Number(current)) / Number(total)), 100),
      0
    );
    customSplash.setProgress(`${progress}%`);
  });
}

function firstLoad(event) {
  config = getConfig();
  startLoading(event);
}

document.addEventListener('deviceready', firstLoad, false);
document.addEventListener('DOMContentLoaded', firstLoad, false);

window.onerror = (message) => {
  showErrorMessage(message);
};

customSplash.create();
