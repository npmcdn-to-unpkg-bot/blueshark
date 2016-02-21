var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// should probably change '/landing' => '/', but use this for test
app.get('/landing', function(req, res) {
  res.sendFile(__dirname + '/views/landing.html');
});

// should also change this route
app.get('/dash', function(req, res) {
  res.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/:eventID', function(req, res) {
	res.sendFile(__dirname + '/views/forms.html');
	io.emit('fbEventURL', req.params.eventID);
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});

// socket.io
io.on('connection', function(socket) {
	console.log('socket.io connected');
});