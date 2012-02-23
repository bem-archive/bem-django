var INHERIT = require('inherit'),
    FS = require('fs'),
    Q = require('qq'),
    Template = require('bem/lib/template'),
    Tech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(Tech, {

    getSuffixes: function() { return ['py'] },

    getBuildResultChunk: function(relPath, path, suffix) {
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
            'def {{bemItem}}(request):',
            '    # view content',
            '    return ""'],
            vars);

    }

});
