var INHERIT = require('inherit'),
    FS = require('fs'),
    PATH = require('bem/lib/path'),
    Q = require('qq'),
    Template = require('bem/lib/template'),
    bemUTIL = require('bem/lib/util'),
    BEM = require('bem').api,
    Tech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(Tech, {

    getSuffixes: function() { return [] },

    create: function(prefix, vars, force) {
        var techName = this.getTechName(),
            level = this.context.levels[0],
            defer = Q.defer(),
            bemdecl = level.getDeclByIntrospection();

        writeIfNew(
            prefix + '.' + techName,
            'exports.blocks = ' + JSON.stringify(bemdecl),
            force,
            function() {
                var techs = bemUTIL.extend({}, level.getTechs());
                for(var t in techs) {
                    if(t == techName) delete techs[t];
                    techs[t] = [];
                }

                declForEach({ blocks: bemdecl }, function(type, args, item) {

                    item.techs && item.techs.forEach(function(t) {
                        var itemPrefix = level.get(type, args),
                            tech = level.getTech(t.name);

                        tech.getSuffixes().forEach(function(suffix) {
                            var path = tech.getPath(itemPrefix, suffix);
                            PATH.existsSync(path) && techs[t.name].push(PATH.relative(prefix, path));
                        });
                    })

                });

                for(var t in techs) {
                    writeIfNew([prefix, t, techName].join('.'), techs[t].join('\n'), force);
                }

            });
        defer.resolve();


        return defer.promise
    }

});

function writeIfNew(path, content, force, fn) {
    if((PATH.existsSync(path) ? FS.readFileSync(path) : '') != content || force) {
        //console.log('write %j', path);
        FS.writeFileSync(path, content);
        fn && fn(content);
        return true
    }
    return false
}

// TODO: move to bem/lib
function declForEach(decl, fn) {

    var forItemWithMods = function(block, elem) {
            var item = elem || block,
                type = elem? 'elem' : 'block',
                args = elem? [block.name, elem.name] : [block.name];

            // for block and element
            fn(type, args, item);

            // for each modifier
            item.mods && item.mods.forEach(function(mod) {

                // for modifier
                fn(type + '-mod', args.concat(mod.name), mod);

                // for each modifier value
                mod.vals && mod.vals.forEach(function(val, i) {
                    if (!val.name) {
                        val = { name: val };
                        mod.vals[i] = val;
                    }
                    fn(type + '-mod-val', args.concat(mod.name, val.name), val);
                });

            });
        },
        forBlockDecl = function(block) {
            // for block
            forItemWithMods(block);

            // for each block element
            block.elems && block.elems.forEach(function(elem) {
                forItemWithMods(block, elem);
            });
        },
        forBlocksDecl = function(blocks) {
            // for each block in declaration
            blocks.forEach(forBlockDecl);
        };

    decl.name && forBlockDecl(decl);
    decl.blocks && forBlocksDecl(decl.blocks);

};
