var INHERIT = require('inherit'),
    FS = require('fs'),
    Q = require('qq'),
    Template = require('bem/lib/template'),
    Tech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(Tech, {

    getSuffixes: function() { return ['py'] },

    getBuildResult: function(prefixes, suffix, outputDir, outputName) {
        return Q.shallow([
            'from django.db import models\n\n',
            this.__base(prefixes, suffix, outputDir, outputName)
        ])
    },

    getBuildResultChunk: function(relPath, path, suffix) {
        console.log(path);
        return [
            '# ' + relPath + ': begin',
            FS.readFileSync(path),
            '# ' + relPath + ': end',
            '\n'].join('\n');
    },

    getCreateResult: function(path, suffix, vars) {

        vars.Item = vars.BlockName +
            (vars.ElemName? '__' + vars.ElemName : '') +
            (vars.ModVal? '_' + vars.ModName + '_' + vars.ModVal : '');

        return Template.process([
            'class {{bemItem}}(models.Model):',
            '    # model content'],
            vars);

    }

});
