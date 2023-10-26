# ts-loader
Loader for web and Cordova app. The loader will load the files based on a manifest file and creates the relevant DOM nodes to load and start the app.

## Requirements

If using in an Cordova App, the following plugins are required:

- `cordova-plugin-advanced-http`
- `cordova-plugin-statusbar` (optional)
- `phonegap-istablet` (optional)

## Quick Start

`npm run build` - Build ts-loader.js and ts-loader.min.js

`npm run start` - For development

## Manifest File
The loader need a manifest file to determine what files to load.

The manifest file should be named `app-manifest.json`. It should contains the following data:

- `manifestVersion` - the current version of the manifest
- `domNodes` - an array of file path and file type that will be append to the document (js or css file)

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
  ]
}
```

## Config
Config can be passed via data attributes.

```html
<script type="text/javascript" src="scripts/ts-loader.js"
data-app-host="https://mobile.app.example.com"
data-app-host-tablet="https://app.example.com"
data-status-bar-background-color="#282828"
></script>
```
The available config are:

Name | Type | Default | Description
------------ | ------------- | ------------- | -------------
appHost | String | '' | The base URL of the app |
appHostTablet | String | '' | The base URL of the tablet app |
manifestFile | String | 'app-manifest.json' | The name of the manifest file |
supportedManifestVersion | String | '^2.0.0' | - |
statusBarBackgroundColor | String | '#282828' | The background color of the Cordova status bar |

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

## Upgrading to v4

We removed the `useLocalCache` functionality in v4 which uses unmaintained plugins `cordova-file-cache` and `cordova-plugin-file-transfer`,
utilizing browser cache should be sufficient.

Please check the app and remove `window.cordovaFileCache` usage.
