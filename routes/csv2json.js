const
	express = require('express'),
	fs = require('fs'),
	busboy = require('express-busboy'),
	router = express.Router();

busboy.extend(router, {
	upload: true,
	allowedPath: /./
});

router.post('/', function(req, res) {
	console.log('Detection form request recieved.');
	var fileloader = req.files.fileloader;
	
	var io = req.app.get('socketio');

	if (!io)
		console.log('socket.io could not be reachead.');

	fs.readFile(fileloader.file, function(err, data) {
		if(err) {
			console.log(err)
			res.render('index', { output: err });
		}
		else {
			console.log('Data from file recieved. Pre-processing the data.');
			var file = data.toString().trim().split('\n');
			console.log('Data pre-processed.');
			console.log('Types: ' + file[0]);

			console.log('Parsing file to json.');
			var result = convert(file[0].split('\t'), file.slice(1));
			
			res.render('index', { output: result });
		}
	});
	
});

function convert(types, datas) {
	var result = '';

	console.log(types)
	console.log(types.length)
	console.log(types[types.length-1])

	for (var i = 0; i < datas.length; i++) {
		result += convertSingle(types, datas[i].split('\t'));
		result += '\n\n';
	}

	console.log(result);

	return result;
}

function convertSingle(types, data) {
	var json = {};
	
	var propName;
	var dataInf;

	var galery = [];
	var versions = [];
	var info = [];
	var especs = '';
	
	var auxArray;
	var auxIndex;
	var auxName;

	for (var i = 0; i < types.length; i++) {

		propName = types[i].toString().replace('\r', '').trim().toLowerCase();
		dataInf = data[i].toString().replace('\r', '').trim();

		if (dataInf !== '-') {

			if(propName === 'produto')
				json.name = dataInf;
			else if(propName === 'url')
				json.image = dataInf;
			else if(propName === 'descrição')
				json.description = dataInf;
			else if(propName === 'ficha técnica')
				especs = dataInf;
			else if(propName === 'tipo')
				json.tempo = dataInf;
			else {
				if(propName.includes('galeria')) {
					auxArray = propName.split(' ');
					auxIndex = parseInt(auxArray[(auxArray.length - 1)]);

					galery.push({ image_id: auxIndex, url: dataInf });

				} else if(propName.includes('versão')) {
					auxArray = propName.split(' ');
					auxIndex = parseInt(auxArray[(auxArray.length - 1)]) - 1;

					if(!versions[auxIndex])
						versions[auxIndex] = {};

					if(propName.includes('nome'))
						versions[auxIndex].name = dataInf;
					else if(propName.includes('url'))
						versions[auxIndex].image = dataInf;
				
				} else if(propName.includes('técnica')) {
					if(propName.includes('motor'))
						auxName = 'motor';
					else if(propName.includes('chassi'))
						auxName = 'chassi';
					else if(propName.includes('dimensões'))
						auxName = 'dimensions';
					else if(propName.includes('geral'))
						auxName = 'geral';
					else
						auxName = propName;

					info.push({ info_id: auxName, url: dataInf });

				} else {
					// if the tag didn't match with any option, let it be as it came.
					propName[propName] = dataInf;
				}
			}
		}
	}

	if(galery.length > 0)
		json.album = galery;
	
	if(versions.length > 0)
		json.versions = versions;

	if(info.length > 0)
		json.info = info;
	else
		json.especs = especs;

	return JSON.stringify(json);
}

module.exports = {
	router: router
};