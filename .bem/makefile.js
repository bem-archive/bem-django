var Q = require('qq'),
    PATH = require('path'),
    FS = require('fs'),
    CP = require('child_process'),
    UTIL = require('util'),
    bemUTIL = require('bem/lib/util'),
    BEM = require('bem').api,
    createLevel = require('bem/lib/level').createLevel;

require('coa').Cmd()
    .name(PATH.basename(process.argv[1]))
    .title('GNUmakefile generator.')
    .helpful()
    .opt()
        .name('version').title('Show version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() {
            return JSON.parse(require('fs').readFileSync(
                PATH.join(__dirname, '..', 'package.json')))
                    .version;
        })
        .end()
    .opt()
        .name('output').title('Output file (default: stdout)')
        .short('o').long('output')
        .output()
        .end()
    .opt()
        .name('prjLevel').short('p').long('projectLevel')
        .title('project level, cwd by default')
        .def(process.cwd())
        .val(function (l) { return typeof l == 'string'? createLevel(l) : l })
        .end()
    .act(function(opts, args) {
        var defer = Q.defer();

        CP.exec(
            'ls -d */*/.bem',
            { cwd: opts.prjLevel.dir },
            function(err, stdout, stderr) {
                stderr && console.log(stderr);

                var apps = {};
                stdout.split('\n').forEach(function(a) {
                    if(a) {
                        a = PATH.dirname(PATH.dirname(a));
                        apps[a] || (apps[a] = a);
                    }
                })

                defer.resolve(apps)

                err && defer.reject(err);
            });


        return defer.promise
            .then(function(apps) {
                return buildAppsTargets(apps, opts, args);
            })
            .then(function(res) {
                var output = opts.output;
                output.write(res.join('\n'));
                output === process.stdout ? output.write('\n') : output.end();
            });
    })
    .run()


function buildAppsTargets(apps, opts) {
    apps = Object.keys(apps);
    return Q.all(apps.map(function(a) {
            return Q.all(['blocks', 'models', 'pages'].map(function(i) {
                return BEM.create.block(
                    { forceTech: 'introspection', levelDir: PATH.join(a, i) },
                    { names: 'ALL' })
            }))
        })).then(function(res) {
            var res = [ '.PHONY:', 'all: ' + apps.join(' ')];
            res.push.apply(res, apps.map(function(a) {
                var byPagesTechs = buildPagesTechsTargets(a, opts),
                    prjDir = opts.prjLevel.dir,
                    pagesLevel = createLevel(PATH.join(a, 'pages')),
                    modelsLevel = createLevel(PATH.join(a, 'models')),
                    techs = bemUTIL.extend({}, pagesLevel.getTechs()),
                    declTech = pagesLevel.getTech('bemdecl.js');
                    introspectionTech = modelsLevel.getTech('introspection');

                return ['', '.PHONY:',
                    ['', ': ', '/models.py ', '/views.py ', '/pages/ALL/ALL.bemdecl.js'].join(a) + ' ' + byPagesTechs[0].join(' '),
                    '',
                    a + '/models.py: ' +
                        buildIntrospectionPrerequisits(prjDir, introspectionTech, modelsLevel.get('block', ['ALL']), 'model'),
                    ['\tbem build -d $< -o ', ' -n models -t model -l ', '/models'].join(a),
                    '',
                    a + '/views.py: ' +
                        buildIntrospectionPrerequisits(prjDir, introspectionTech, pagesLevel.get('block', ['ALL']), 'view'),
                    ['\tbem build -d $< -o ', ' -n views -t view -l ', '/pages'].join(a),
                    '',
                    buildDeclMergeTarget(a, prjDir, introspectionTech, pagesLevel.get('block', ['ALL']), 'bemdecl.js'),
                    '',
                    byPagesTechs[1]
                ].join('\n')
            }));
            return res;
        })
}

function buildPagesTechsTargets(app, opts) {
    var prjDir = opts.prjLevel.dir,
        pagesLevel = createLevel(PATH.join(app, 'pages')),
        blocksLevel = createLevel(PATH.join(app, 'blocks')),
        techs = bemUTIL.extend({}, pagesLevel.getTechs()),
        declTech = pagesLevel.getTech('bemdecl.js');
        introspectionTech = blocksLevel.getTech('introspection'),
        blocksAllPrefix = blocksLevel.get('block', ['ALL']);

    delete techs['bemdecl.js'];
    delete techs.introspection;
    delete techs.view;
    delete techs.html;

    var prerequisits = [],
        targets = pagesLevel.getDeclByIntrospection().map(function(p) {

            return Object.keys(techs).map(function(t) {

                t = pagesLevel.getTech(t);
                var itemPrefix = pagesLevel.get('block', [p.name]);

                return t.getSuffixes().map(function(suffix) {
                    var path = PATH.relative(prjDir, t.getPath(itemPrefix));

                    prerequisits.push(path);

                    return [
                        path + ': ' +
                            PATH.relative(prjDir, declTech.getPath(itemPrefix)) +
                            ' ' + buildIntrospectionPrerequisits(prjDir, introspectionTech, blocksAllPrefix, suffix),
                        '\tbem build' +
                            ' -t ' + t.getTechName() +
                            ' -o $(@D) -n $(basename $(@F)) -d $<' +
                            ' -l ' + PATH.relative(prjDir, blocksLevel.dir),
                        ''
                    ].join('\n')

                }).join('\n');

            }).join('\n')

        }).join('\n');

        return [prerequisits, targets]
}

function buildIntrospectionPrerequisits(prjDir, introspectionTech, blocksAllPrefix, suffix) {
    var res = [PATH.relative(prjDir, introspectionTech.getPath(blocksAllPrefix))];
    readFileContent(introspectionTech.getPath(blocksAllPrefix, suffix + '.introspection'))
        .split('\n').forEach(function(f) {
            f && f.indexOf('ALL') && res.push(PATH.relative(prjDir, PATH.join(blocksAllPrefix, '..', f)))
        });
    return res.join(' ')
}

function buildDeclMergeTarget(a, prjDir, introspectionTech, blocksAllPrefix, suffix) {
    var prerequisits = buildIntrospectionPrerequisits(prjDir, introspectionTech, blocksAllPrefix, suffix);
    return prerequisits.split(' ').length > 1 ?
        [
            a + '/pages/ALL/ALL.bemdecl.js: ' + prerequisits,
            '\tbem decl merge -o $@ $(foreach d,$(subst $<,,$^), -d $d)'
        ].join('\n') : ''
}

function readFileContent(path) {
    return String(PATH.existsSync(path) ? FS.readFileSync(path) : '')
}

