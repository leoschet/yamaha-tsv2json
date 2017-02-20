var socket = io.connect('http://localhost:5000');

var resultsDiv = document.getElementById('results-div');

socket.on('res', function(result) {
	console.log('dsakjdsndnsa');

	resultsDiv.innerHTML = result;
});