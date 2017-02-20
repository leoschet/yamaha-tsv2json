'use strict';

const
	express = require('express'),
	socketio = require('socket.io'),
	csvParser = require('./routes/csv2json.js'),
	pug = require('pug'),
	bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 5000);

app.set('views', './public/views');
app.set('view engine', 'pug');
app.engine('pug', pug.__express);

app.use(express.static('./public/static'));
app.use(bodyParser.json());

app.use('/parse', csvParser.router);

app.get('/', function(req, res) {
	res.render('index');
});

// Start server
var server = app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {
	console.log('New client connected.');
// 	socket.on('improve', function() {
// 		vision.improveResults(socket);
// 	});

});

app.set('socketio', io);

module.exports = app;