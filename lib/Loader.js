import { EventEmitter } from 'events';
import semver from 'semver';

import DomNode from './DomNode';
import objectAssign from './object-assign';
import xhrPromise from './xhr-promise';

export default class Loader {
  constructor(runtimeConfig) {
    this.emitter = new EventEmitter();

    // We're passing in a dataSet as runtimeConfig and Safari's Object.assign doesn't work with it
    // so we use our own objectAssign that doesn't mutate data.
    this.config = objectAssign(
      {
        manifestFile: 'app-manifest.json',
        supportedManifestVersion: '^2.0.0'
      },
      runtimeConfig
    );

    this.config.appHost = this.config.appHost || '';
    this.config.appHostTablet = this.config.appHostTablet || '';

    if (!this.config.publicPath && this.config.appHost) {
      this.config.publicPath = `${this.config.appHost}/`;
      // in cordova this is set via uk.co.workingedge.phonegap.plugin.istablet cordova plugin
      if (window.isTablet) {
        this.config.publicPath = `${this.config.appHostTablet}/`;
      }
    }

    this.load()
      .then(() => {
        this.emitter.emit('loaded');
      })
      .catch((e) => {
        console.error('loader error', e);
        if (window.Bugsnag) {
          window.Bugsnag.notifyException(e);
        }
        this.emitter.emit('error', e.message || JSON.stringify(e, null, 2));
      });
  }

  onProgress = ({ queueIndex, queueSize }) => {
    this.emitter.emit('progress', queueIndex, queueSize);
  };

  load = () => {
    return this.getAppManifest().then((manifest) => {
      let completedCount = 0;
      const { publicPath } = this.config;
      const { domNodes } = manifest;
      const queueSize = domNodes.length;

      const promises = domNodes.map((nodeInfo) => {
        if (!nodeInfo.path.match(/^http(s|):\/\//)) {
          nodeInfo.path = `${publicPath}${nodeInfo.path}`;
        }

        const domNode = new DomNode(nodeInfo);
        return domNode.createRemoteNode().then(() => {
          completedCount += 1;
          this.onProgress({ queueIndex: completedCount, queueSize });
        });
      });

      return Promise.all(promises);
    });
  };

  validateAppManifest = (manifest) => {
    if (!manifest) {
      throw new Error(
        'Could not load manifest. Please check your connection and try again.'
      );
    }

    if (
      !semver.satisfies(
        manifest.manifestVersion,
        this.config.supportedManifestVersion
      )
    ) {
      throw new Error(
        'Your application version is too low. Please visit the App Store and update your application.'
      );
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
    const url = `${this.config.publicPath || ''}${this.config.manifestFile}`;

    if (window.cordova && window.cordova.plugin && window.cordova.plugin.http) {
      return new Promise((resolve, reject) => {
        window.cordova.plugin.http.get(
          url,
          {},
          {},
          (response) => {
            resolve(JSON.parse(response.data));
          },
          reject
        );
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
