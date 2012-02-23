var myPath = require('bem/lib/path');

exports.techs = {
    'app': './techs/app.js',
    'model': './techs/model.js',
    'view': './techs/view.js',
    //'html': './techs/html.js',
    'bemdecl.js': 'bem/lib/techs/bemdecl.js',
    'css': 'bem/lib/techs/css',
};

for (var alias in exports.techs) {
    var p = exports.techs[alias];
    if (/\.{1,2}\//.test(p)) exports.techs[alias] = myPath.absolute(p, __dirname);
}

exports.defaultTechs = ['app'];
