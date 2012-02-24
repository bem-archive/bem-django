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
Run `npm install` for install all dependencies from `package.json`.

#### Build
Just run `make` and it builds only what's needed.

### What can you do?

#### Create apps
Django apps is blocks on project root level. So you can run `bem create block <appname>` for create new app with all BEM specifics inside.

#### Create models
Models is blocks on `<appname>/models` level. So you can run `bem create block -l <appname>/models <modelname>` for create new model.

#### Create views
Views is blocks on `<appname>/pages` level. So you can run `bem create block -l <appname>/pages <modelname>` for create new model.

### Development

#### Tune templates
All templates for create new files defined in `.bem/techs/*.js`.
