# ts-loader
Loader for web and Cordova app. The loader will load the files based on a manifest file and creates the relevant DOM nodes to load and start the app. With the `useLocalCache` option set to `true`, the files will be written on the persistent storage of the app.

## Requirements

If using in an Cordova App, the following plugins are required:

- `cordova-plugin-file`
- `cordova-plugin-file-transfer`
- `cordova-plugin-ionic-webview@2.3.2`

## Quick Start

`npm run build` - Build ts-loader.js and ts-loader.min.js

`npm run start` - For development

## Manifest File
The loader need a manifest file to determine what files to load.

The manifest file should be named `app-manifest.json`. It should contains the following data:

- `manifestVersion` - the current version of the manifest
- `domNodes` - an array of file path and file type that will be append to the document (js or css file)
- `files` - a map of all the files to be preload

Example:
```json
{
  "manifestVersion": "2.1.0",
  "domNodes": [
    {
      "path": "scripts/test.js",
      "type": "js",
      "optional": true
    }
    {
      "path": "assets/app.js",
      "type": "js"
    },
    {
      "path": "assets/app.css",
      "type": "css"
    }
  ],
  "files": {
    "scripts/test.js": {
      "hash": "16b96a3c504dd0654252e577c573ef33",
      "name": "test.js",
      "path": "scripts/test.js",
      "size": 12000,
      "type": "js"
    },
    "assets/app.js": {
      "hash": "d7d6575842965b31c1ea8d37631b8178",
      "name": "app.js",
      "path": "assets/app.js",
      "size": 56442,
      "type": "js"
    },
    "assets/app.css": {
      "hash": "27d657584296q131c1a8d376131b8178",
      "name": "app.css",
      "path": "assets/app.css",
      "size": 26452,
      "type": "css"
    },
    "assets/icon.svg": {
      "hash": "ca309d960f602b3ae3dc1ef30f0db321",
      "name": "icon.svg",
      "path": "assets/icon.svg",
      "size": 1605,
      "type": "svg"
    }
  }
}
```

## Config
Config can be passed via data attributes.

```html
<script type="text/javascript" src="scripts/ts-loader.js"
data-app-host="https://app.example.com"
data-rewrite-sourcemaps="true"></script>
```
The available config are:

Name | Type | Default | Description
------------ | ------------- | ------------- | -------------
appHost | String | '' | The base URL of the app |
manifestFile | String | 'app-manifest.json' | The name of the manifest file |
performHash | Boolean | false | Recalculate and compare the hash of the file |
publicPath | String | '' | - |
rewriteSourcemaps | Boolean | false | Rewrite the source map URL |
supportedManifestVersion | String | '^2.0.0' | - |
statusBarBackgroundColor | String | '#282828' | The background color of the Cordova status bar |
useLocalCache | Boolean | false | Write the files to persistent storage |

## Loader
Here is the DOM structure of the loader screen

``` html
<div id="ts-splash-screen">
  <div id="ts-splash-logo">
    <div id="ts-splash-icon-container">
      <div id="ts-splash-overlap"></div>
      <div id="ts-splash-icon"></div>
      <div id="ts-splash-loader"></div>
    </div>
    <div id="ts-splash-logo-text"></div>
  </div>
</div>
```

If an error occurs then the following is appended to the body

``` html
<div id="loader-error">
  <div id="loader-error-message">An unexpected error occurred, please try again.</div>
  <button id="error-reload-button">Reload</button>
</div>
```

## Using Cached Files

In your app, if you want to load cached files like images you should use the exposed `window.cordovaFileCache` (assuming you have `useLocalCache="true"`).

An example hybrid usage in React is as follows:

```jsx
export default class Img extends PureComponent {
  static propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string
  };

  static defaultProps = {
    alt: ''
  };

  render() {
    const { src: path, alt, ...props } = this.props;
    let src;
    if (path.indexOf('http') === 0) {
      src = path;
    } else {
      src = path;
      // If we are using the cordova file cache use that service to resolve the relative url
      if (isCordova && window.cordovaFileCache) {
        src = window.cordovaFileCache.get(path);
      }
    }
    return (
      <img src={src} alt={alt} {...props} />
    );
  }
}
```
