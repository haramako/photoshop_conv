var fs = require('fs');

(function () {
    "use strict";

    var path = require("path"),
        _generator = null,
        pluginName = path.dirname(__filename).split(path.sep).pop(),
        prefix = pluginName.replace(/[^A-Za-z0-9]/g, "");

    var states = {};

    var actions = {};

    function log(s) {
        console.log("[" + pluginName + "-" + process.pid + "] " + s);
    }

    function handleGeneratorMenuClicked(e) {
        log("menu chosen: '" + e.generatorMenuChanged.name + "'");
        //if (actions[e.generatorMenuChanged.name]) {
        //    actions[e.generatorMenuChanged.name]();
        //}
    }
	
    function init(generator) {
        _generator = generator;

        log("plugin started");

        _generator.addMenuItem("1",	'test', true, false )
				.then(
                    function () {
                        //actions[prefix + menu.id] = menu.action.bind(menu);
                    });

        _generator.onPhotoshopEvent("generatorMenuChanged", handleGeneratorMenuClicked);

		
		conv().then(function(res){
			process.exit(0);
		});
    }

	var rootPath = path.dirname(__filename);
	var jsxPath = path.join(rootPath, 'jsx');
	
	function execFile(path, param){
		var code = fs.readFileSync(path);
		return exec(code.toString(), param);
	}
	function exec(file, code, param){
		param = param || {};
		var env = {
			sep: path.sep,
			rootPath: rootPath,
			jsxPath: jsxPath,
			include: path.join(jsxPath, file)
		};

		var origCode = code;
		if( typeof(code) == 'function'){
			code = 'return (' + code.toString() + ')()';
		}

		if( file ){
			code = '$.evalFile(env.include);' + code;
		}

		var jsxCode = fs.readFileSync(path.join(jsxPath, "base.js"))
				.toString()
				.replace('$ENV', JSON.stringify(env))
				.replace('$PARAM', JSON.stringify(param))
				.replace('$CODE', code);
		return _generator.evaluateJSXString(jsxCode).then(function(res){
			log( 'exec code=' + origCode.toString().replace(/\n/,'').substr(0,40) + '...' );
			if( typeof res !== 'string' || res.substr(0,'RESULT:'.length) !== 'RESULT:' ){
				throw "error in JSX script!";
			}
			var r = JSON.parse(res.substr('RESULT:'.length));
			var logs = r.log;
			for( var i=0; i<logs.length; i++){
				log(logs[i]);
			}
			if( r.err ){
				log(r.err);
				throw "error in JSX script!";
			}
			return r.result;
		});
	}

	function conv(){
		log(path.resolve('.','test.psd'));
		return exec('to_png.js', 'hoge()', {
			file: path.resolve('.','test.psd'),
			out: path.resolve('.', 'test_*.png')
		}).then( function(res){
			log(res);
		}, function(err){
			log(err);
		});
	}

    exports.init = init;

}());
