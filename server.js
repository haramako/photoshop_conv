"use strict";

let express = require('express');
let multer = require('multer');
let morgan = require('morgan');
let path = require('path');
let main = require('./main');
let fs = require('fs-extra');
let archiver = require('archiver');

let app = express();
app.use(morgan("dev", {immediate: true}));

var server;
let upload = multer({dest: './tmp/uploaded'});
let workDir = './tmp/conv';

app.get('/', (req, res)=>{
	res.send('Photoshop Converter Server');
});

app.post('/split', upload.single('file'), (req,res)=>{
	console.log(`originalname: ${req.file.originalname}`);
	console.log(`path: ${req.file.path}`);

	let outDir = path.join(workDir, path.basename(req.file.path));
	let tmpFile = path.join(workDir, req.file.originalname);
	let outFile = path.join(outDir, req.file.originalname.replace('.psd', '_*.psd'));
	fs.mkdirsSync(outDir);
	fs.copySync(req.file.path, tmpFile);

	main.exec('to_png.js', 'hoge()', {
		file: path.resolve(tmpFile),
		out: path.resolve(outFile)
	}).then( function(result){
		// zip にする
		var zipFile = outDir + '.zip';
		var archive = archiver.create('zip', {});
		var output = fs.createWriteStream(zipFile);
		archive.pipe(output);
		archive.directory(outDir, '.');
		output.on('close', function(){
			var buf = fs.readFileSync(zipFile);
			res.send(buf, {'Content-Type': 'application/zip'}, 200);
		});
		archive.finalize();
	}, function(err){
		res.send(JSON.stringify({ok: false, err: err.toString()}));
	});
});

function start(){
	server = app.listen(3000);
	fs.mkdirsSync(workDir);
}

exports.start = start;
