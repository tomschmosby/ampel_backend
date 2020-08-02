// Diese Datei bildet den lokalen Backend Server. Von hier aus wird ein Tunnel durch das Wlan Netz zum Zentralen Verwaltungs Server gelegt. über diesen Tunnel können der Socket Client im Frontend und der Socket client im Backend Kommunizieren.

//Requires
const SerialPort = require('serialport') //Um den Serial port vom arduino auslesen zu können muss er hier angemeldet werden
const Readline = require('@serialport/parser-readline') // über den parser-readline kann das Backend an den Arduino Nachrichten senden

//Starte das Backend und Bohre den tunnel über ssh mit diesem Befehl
//ssh -L 5000:localhost:8080 -N -i /Users/tombuerkle/Desktop/HfG/2_semester/frontend_dev/steuerung/iot2-robot-base-rpi-master/id_rsa bitnami@63.32.119.241

//DONTCHANGEME - AWS-Serververbindung via SSH Tunnel
var socket = require('socket.io-client')('http://localhost:5000'); // hier wird ein socket Client auf dieser Adresse eingerichtet
require('dotenv').config({ path: '/home/pi/ROBO_CONFIG.cfg' }) 

//Setup Serialport START
//CHANGEME - Serieller Port zu Arduino9090
const port = new SerialPort("/dev/tty.usbmodem143101", { //hier wird auf dem der Kommunikationsweg des Sockets über den SerialPort des Arduino 
	baudRate: 9600 //die Baudrate ist die Frequenz mit der die Daten ausgelesen werden Diese muss im Arduino Sketch matchen
})
console.log("Port init"); //gibt eine kontroll String in der Konsole aus 
// Der Parser ist der schreiber der Die Befehle im Arduino Sketch eingibt 
const parser = new Readline({delimiter: '\r\n',}) 
port.pipe(parser) //
//Setup Serialport ENDE

//Variablen
let lastdata = "";
let isConnected = false;

//eigener "Raumname" ist aus Robotername und "_control zusammengesetzt"
const ownRoom = "33333.ampel"; //hier wird in einer Variable die Adresse für meinen Kommunikationsweg gespeichert. also der "Slackchannel" in dem die Socket sich befinden müssen um miteinander zu kommunizierenö.

//Socket.io Handling - das ist der Kern!
socket.on('connect', function () { //Diese funktion definiert, dass der Socket bei einer Verbindung auf einkommende Nachrichten Hören soll und in der Konsole ausgeben dass er verbunden ist 

	console.log("Connected to Master");
	isConnected = true;

	// Verbunden, registiere für jeweiligen Bot-"Raum"
	socket.emit('register_bot', { //Diese Funktion registriert den Socket client im Bot Raum Also er geht in den "slackchannel" um dort Nachrichten zu versenden
		room: "ampel", //Name des "Slack Channels"
		port: "33333" //Adresse des "Slack Channels" 
	});

	// Eingehende Serialevents an zentralen SIO Server senden (für Debugging etc.)
	parser.on('data', line => { // Mit dieser Funktion können Die über den SerialPort des Arduino einkommende Nachrichten verarbeitet werden.
		console.log(`> ${JSON.stringify(line)}`); // zum Debuggen wird hier Die JSON Datei als Text in der Console ausgegeben 
		if (line === 'rot') {    // //auserdem soll auf das Event der eingehenden Nachricht vom Serialport direkt über den Socket eine Nachricht mit dem Namen Farbwert in den "Slackchannel" gepostet werden Die Nachricht Welche Nachricht in den Channel gesendet wird Ist hier für die Jeweilige Farbe Defineirt. 
			socket.emit('farbe', '#FF0000'); // wenn die Rote LED leuchtet, soll der Hexcode für rot gesendet werden
			console.log(1);//gib einen String aus für zum Debuggen
			} else if (line === 'gruen') {
			socket.emit('farbe', '#00FF00');//wenn die Grüne LED leuchtet, soll der Hexcode für grün gesendet werden
			console.log(2);//gib einen String aus für zum Debuggen
			} else if (line === 'blau') {
			socket.emit('farbe', '#0000FF');//wenn die blaue LED leuchtet, soll der Hexcode für blau gesendet werden
			console.log(3);//gib einen String aus für zum Debuggen
			}
	})

	// Eingehende SIO Events an serialport via Arduino weiterleiten
	socket.on('serialevent', function (data) {//bei einem Serial Event soll das object in einen String umgewandelt werden
		port.write(data.toString())
		console.log("Wrote " + data);//gib einen String aus für zum Debuggen
	});

	// CHANGEME - Hier könnte eure eigene Logik stehen, nur ein Beispiel ----------
	//

	socket.on("lichtA", function(data) {//hört auf Nachrichten im "Channel" die "lichtA" heisen 
		console.log("Aus ", data)//gib einen String aus für zum Debuggen
		port.write(`a${data}\n`); //schreibt über den Port die Nachricht 'a' in die Readline des Arduino, dieser reagiert auf diesen Wert.
	})

	socket.on("rotAn", function(data) {//hört auf Nachrichten im "Channel" die "rotAn" heisen 
		console.log("Rot kommt an", data)//gib einen String aus für zum Debuggen
		// socket.emit('farbe','test2');	
		port.write(`r${data}\n`);//schreibt über den Port die Nachricht 'r' in die Readline des Arduino, dieser reagiert auf diesen Wert.
	})

	socket.on("gruenAn", function(data) {
		console.log("Gruen kommt an", data)//gib einen String aus für zum Debuggen
		port.write(`g${data}\n`);//schreibt über den Port die Nachricht 'g' in die Readline des Arduino, dieser reagiert auf diesen Wert.
	})

	socket.on("blauAn", function(data) {
		console.log("Blau kommt an ", data)//gib einen String aus für zum Debuggen
		port.write(`b${data}\n`);//schreibt über den Port die Nachricht 'b' in die Readline des Arduino, dieser reagiert auf diesen Wert.
	})


	//
	// Beispiel Ende --------------------------------------------------------------

	//Verbindungsabbruch handhaben
	socket.on('disconnect', function () { //wenn die Verbindung unterbrochen wird soll die Variable isConnected auf fals setzen 
		isConnected = false;
		console.log("Disconnected");// gibt in der konsole aus dass der Socket keine Verbindung hat 
	});
});
