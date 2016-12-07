var icon, iconContainer, loaderBox, logo, overlap, splash, text; // dom elements
var timeout;

function checkOrientation() {
  if (window.orientation == 0 || window.orientation == 180) { // portrait
    icon.classList.add('portrait');
  } else { //landscape
    icon.classList.remove('portrait');
  }
}

window.addEventListener('orientationchange', checkOrientation);

function show() {
  window.clearTimeout(timeout);
  splash.style.display = '';
  splash.style.transition = '';
  splash.style.webkitTransition = '';
  splash.style.opacity = 1;
}

function hide() {
  hideLoader();

  window.clearTimeout(timeout);
  timeout = window.setTimeout(function () {
    splash.style.transition = 'opacity 300ms linear';
    splash.style.webkitTransition = 'opacity 300ms linear';
    splash.style.opacity = 0;

    timeout = window.setTimeout(function () {
      splash.style.display = 'none';
    }, 300);
  }, 300);
}

function setProgress(value) {
  loaderBox.textContent = value;
}

function setProgressScale(scale) {
  loaderBox.style.webkitTransform = 'scale(' + scale + ')';
  loaderBox.style.transform = 'scale(' + scale + ')';
}

function showLoader() {
  setProgressScale(1);
}

function hideLoader() {
  setProgressScale(0);
}

function setStatusBarHeight(height) {
  splash.style.marginTop =  -height + 'px';
}

function create() {
  splash = document.createElement('div');
  splash.id = 'ts-splash-screen';

  logo = document.createElement('div');
  logo.id = 'ts-splash-logo';
  splash.appendChild(logo);

  iconContainer = document.createElement('div');
  iconContainer.id = 'ts-splash-icon-container';
  logo.appendChild(iconContainer);

  overlap = document.createElement('div');
  overlap.id = 'ts-splash-overlap';
  iconContainer.appendChild(overlap);

  icon = document.createElement('div');
  icon.id = 'ts-splash-icon';
  iconContainer.appendChild(icon);

  loaderBox = document.createElement('div');
  loaderBox.id = 'ts-splash-loader';
  iconContainer.appendChild(loaderBox);

  text = document.createElement('div');
  text.id = 'ts-splash-logo-text';
  logo.appendChild(text);

  document.body.appendChild(splash);

  checkOrientation();
}

module.exports = {
  create: create,
  show: show,
  hide: hide,
  setProgress: setProgress,
  showLoader: showLoader,
  hideLoader: hideLoader,
  setStatusBarHeight: setStatusBarHeight
};
