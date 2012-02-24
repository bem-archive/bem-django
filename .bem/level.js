var PATH = require('bem/lib/path');

exports.getTechs = function() {
    var techs = {
        'introspection': './techs/introspection.js',
        'app': './techs/app.js',
        'model': './techs/model.js',
        'view': './techs/view.js',
        //'html': './techs/html.js',
        'bemdecl.js': 'bem/lib/techs/bemdecl.js',
        'js': 'bem/lib/techs/js',
        'css': 'bem/lib/techs/css'
    };

    for (var alias in techs) {
        var p = techs[alias];
        if (/\.{1,2}\//.test(p)) techs[alias] = PATH.absolute(p, __dirname);
    }

    return techs

};

exports.defaultTechs = ['app'];
