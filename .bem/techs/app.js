var INHERIT = require('inherit'),
    PATH = require('bem/lib/path'),
    FS = require('fs'),
    Q = require('qq'),
    CP = require('child_process'),
    BEM = require('bem').api,
    Tech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(Tech, {

    create: function(prefix, vars, force) {
        var defer = Q.defer(),
            blockDir = PATH.dirname(prefix),
            levelDir = PATH.dirname(blockDir);

        // TODO: check 'force'
        FS.readdirSync(blockDir).length || FS.rmdirSync(blockDir); // should be empty dir if create new block

        CP.exec(
            'python manage.py startapp ' + vars.BlockName,
            { cwd: levelDir },
            function(err, stdout, stderr) {
                stdout && console.log(stdout);
                stderr && console.log(stderr);

                err? defer.reject(err) : defer.resolve();
            });

        return defer.promise.then(function() {

            ['models.py', 'views.py'].forEach(function(f) { FS.unlinkSync(PATH.join(blockDir, f)) });

            return Q.all([
                    ['blocks', ['css', 'js'], ['app', 'model', 'view', 'bemdecl.js']],
                    ['models', ['model'], ['app', 'view', 'bemdecl.js']],
                    ['pages', ['bemdecl.js', 'view', 'html'], ['app', 'model']]
                ].map(function(i) {
                    return BEM.create.level(
                            { dir: levelDir, level: levelDir, outputDir: blockDir, noTech: i[2] },
                            { names: i[0] }
                        ).then(function() {
                            var f = FS.openSync(PATH.join(blockDir, i[0], '.bem', 'level.js'), 'a');
                            FS.writeSync(f, '\nexports.defaultTechs = ' + JSON.stringify(i[1]) + ';\n');
                            FS.closeSync(f);
                        })
                })).then(function() {
                    console.log("Don't forget to add '" + vars.BlockName + "' app to the INSTALLED_APPS in settings.py")
                })

        });
    }


});
