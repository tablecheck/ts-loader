import { EventEmitter } from 'events';
import semver from 'semver';

import objectAssign from './object-assign';
import xhrPromise from './xhr-promise';
import isCordova from './isCordova';
import cordovaLoad from './cordovaLoad';
import browserLoad from './browserLoad';

export default class Loader {
  constructor(runtimeConfig, forceReload = false) {
    this.emitter = new EventEmitter();

    // We're passing in a dataSet as runtimeConfig and Safari's Object.assign doesn't work with it
    // so we use our own objectAssign that doesn't mutate data.
    this.config = objectAssign({
      manifestFile: 'app-manifest.json',
      supportedManifestVersion: '^2.0.0'
    }, runtimeConfig);

    window.cordovaFileCache = undefined;

    this.config.appHost = this.config.appHost || '';
    this.config.appHostTablet = this.config.appHostTablet || '';

    if (!this.config.publicPath && this.config.appHost) {
      this.config.publicPath = `${this.config.appHost}/`;
      // in cordova this is set via uk.co.workingedge.phonegap.plugin.istablet cordova plugin
      if (window.isTablet) {
        this.config.publicPath = `${this.config.appHostTablet}/`;
      }
    }

    let promise;
    if (!isCordova) {
      promise = this.normalLoad();
    } else {
      promise = this.cacheLoad(!this.config.useLocalCache || forceReload);
    }

    promise.then(() => {
      this.emitter.emit('loaded');
    })
    .catch((e) => {
      console.error('loader error', e);
      if (window.Bugsnag) {
        window.Bugsnag.notifyException(e);
      }
      this.emitter.emit('error', e.message || JSON.stringify(e, null, 2));
    });

    return this.emitter;
  }

  onProgress = ({ queueIndex, queueSize }) => {
    this.emitter.emit('progress', queueIndex, queueSize);
  };

  cacheLoad = (forceReload) => {
    return this.getAppManifest()
    .then((manifest) => {
      return cordovaLoad(this.config.publicPath, !this.config.useLocalCache || forceReload, manifest, this.onProgress);
    });
  };

  normalLoad = () => {
    return this.getAppManifest()
    .then((manifest) => {
      return browserLoad(this.config.publicPath, manifest, this.onProgress);
    });
  };

  validateAppManifest = (manifest) => {
    if (!manifest) {
      throw new Error('Could not load manifest. Please check your connection and try again.');
    }

    if (!semver.satisfies(manifest.manifestVersion, this.config.supportedManifestVersion)) {
      throw new Error('Your application version is too low. Please visit the App Store and update your application.');
    }

    if (typeof manifest.files !== 'object') {
      throw new Error('Expected appManifest.files to be an object');
    }
    if (!Array.isArray(manifest.domNodes)) {
      throw new Error('Expected appManifest.domNodes to be an array');
    }
  };

  getAppManifest = () => {
    let manifest;
    const url = `${(this.config.publicPath || '')}${this.config.manifestFile}`;

    if (window.cordova && window.cordova.plugin && window.cordova.plugin.http) {
      return new Promise((resolve, reject) => {
        window.cordova.plugin.http.get(url, {}, {}, (response) => {
          resolve(JSON.parse(response.data));
        }, reject);
      });
    }

    return xhrPromise(url, { responseType: 'text' }).then((xhr) => {
      try {
        manifest = JSON.parse(xhr.response);
      } catch (e) {
        throw new Error('Failed to parse manifest.');
      }

      this.validateAppManifest(manifest);

      return manifest;
    });
  };
}
