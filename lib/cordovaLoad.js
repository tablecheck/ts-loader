import CordovaPromiseFS from 'cordova-promise-fs';
import CordovaFileCache from 'cordova-file-cache';
import throater from 'throat';
import DomNode from './DomNode';

const throat = throater(Promise);

export default function cordovaLoad(serverRoot, forceReload, manifest, onProgress) {
  const files = Object.keys(manifest.files).map(fileName => manifest.files[fileName])
    .filter(file => file && file.type !== 'css')
    .map(({ path }) => path);

  const cache = new CordovaFileCache({
    fs: new CordovaPromiseFS({
      Promise
    }),
    mode: 'mirror',
    serverRoot
  });
  window.cordovaFileCache = {
    get: (path) => {
      return window.Ionic.WebView.convertFileSrc(cache.get(path));
    }
  };

  return cache.ready.then(() => {
    if (forceReload) {
      return cache.clear();
    }
    return Promise.resolve();
  }).then(() => {
    cache.add(files);

    if (cache.isDirty()) {
      return cache.download(onProgress);
    }
    return Promise.resolve();
  })
  .then(() => {
    return Promise.all(manifest.domNodes.map(throat(1, (nodeInfo) => {
      if (nodeInfo.type === 'css') {
        if (!nodeInfo.path.match(/^http(s|):\/\//)) {
          nodeInfo.path = window.Ionic.WebView.convertFileSrc(`${serverRoot}${nodeInfo.path}`);
        }
      } else {
        const cachePath = cache.get(nodeInfo.path);
        nodeInfo.path = window.Ionic.WebView.convertFileSrc(cachePath);
      }
      return new DomNode(nodeInfo);
    })));
  });
}
