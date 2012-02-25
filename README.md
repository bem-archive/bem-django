## BEM for Django

### How to use?

#### Get NodeJS and NPM
* [NodeJS](http://nodejs.org/#download)
* [NPM](http://npmjs.org/)

#### Get BEM Tools
[BEM Tools](https://github.com/bem/bem-tools/)

#### Copy files
Copy `.bem`, `GNUmakefile`, `package.json` to your Django project root.

#### Install dependencies
Run `npm install` to install all dependencies specified in `package.json`.

#### Build
Just run `make` and it will build only what's needed.

### What can you do?

#### Create apps
Django apps are blocks on the project root level. So you can run `bem create block <appname>` to create new app with all BEM related features inside.

#### Create models
Models are blocks on `<appname>/models` level. So you can run `bem create block -l <appname>/models <modelname>` to create new model.

#### Create views
Views are blocks on `<appname>/pages` level. So you can run `bem create block -l <appname>/pages <modelname>` to create new view.

### Development

#### Tune templates
All templates that are used to create new files are defined in `.bem/techs/*.js` files. Feel free to modify them.
