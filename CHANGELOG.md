# ts-loader CHANGELOG

## v2.8.2 - 2017-07-05
- Read local files as buffer to avoid encoding issue

## v2.8.1 - 2017-05-29
- Removed babel-polyfill in favor of a more specific polyfill for Promise

## v2.8.0 - 2017-05-22
- Changed code to ES6 syntax
- Use stricter eslint rules
- Cleaned up some code
- Externalized dataset and classlist polyfill
- Fixed a bug with loading style for Cordova

## v2.7.2 - 2017-05-16
- [FIX] Missing return

## v2.7.1 - 2017-05-15
- Avoid the download of unecessary file for browsers

## v2.7.0 - 2017-05-11
- [FIX] Remove detectNavigatorLocale
- [FIX] Add polyfills
- [README] Add more information to README

## v2.6.0 - 2017-04-25
- [AppHost] Removed the use of localStorage
- [FIX] Parsing dataset properly
- [FIX] Avoid crash for md5 parsing of empty files


## v2.5.0 - 2017-01-12
- [AppHost] If localStorage is set, use that before appPreferences
- [DevDependencies] Update to latest webpack and eslint
- [CHANGELOG] Use proper markdown format

## v2.4.0 - 2017-01-06
- appPreferences plugin promise usage does not support Android 4
- Fallback to localStorage for appHost config if no plugin support

## v2.3.0 - 2016-12-26
- Use cached version of app-manifest if we cannot load a new one
- Rename performMD5 to performHash

## v2.2.0 - 2016-12-22
- Remove annoying webpack performance warnings
- Update spark-md5 to 3.0.0
- Update throat to 3.0.0

## v2.1.0 - 2016-12-21
- Remove assert for size control
- Add cordova-promise-fs
- Unify loader start between browser and cordova
- Create loader-error div instead of relying on index.html
- Configure statusBarBackgroundColor at runtime
- Cleanup loader after loaded
- Do not show error messages if loaded
- Extract public path from fs
- Change file not found error code
- Download all files from manifest
- Set public path on all javascript nodes
- Do not skip map files in domnodes
- Log all errors while loading

## v2.0.0 - 2016-12-07
- New logo layout
- Use q for promises
- Remove config in package.json
- Remove semver check for supported app version
- Fix percentage bug
- Add eslint
- Fix lint bugs
- Move webpack into dev dependency
- q-io was unused
- Upgrade webpack to v2
- Move webpack config into proper files
- Update README to explain new way to run

## v1.2.0 - 2016-07-11
- Remove cordova disconnect logic
- Update semver from 5.1.0 to 5.2.0
- Add CHANGELOG

## v1.1.0 - 2016-03-29
- Improve style
- Add sourcemaps for css
