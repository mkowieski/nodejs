/* jshint node: true */
var app = require("express")();
var httpServer = require("http").Server(app);
var io = require("socket.io")(httpServer);

var static = require('serve-static');
var less = require('less-middleware');
var path = require('path');
var port = process.env.PORT || 3000;
var multer = require("multer");
var fs = require("fs");

var done = false;

app.use(less(path.join(__dirname, 'public')));
app.use('/images', static(__dirname + '/public/images'));
app.use(static(path.join(__dirname, '/public')));

////////////// MULTER ///////////////////////////////////
fs.readFile('public/json/baza.json', 'utf-8', function (err, data) {
    if (err) throw err;
    var json = JSON.parse(data);

    // Konfiguracja multera
    app.use(multer({
        dest: './public/images/',
        rename: function (fieldname, filename) {
            var obj = {
                "Id": "0",
                "Name": "TEST",
                "Year":"1999", 
				"Description":"opis swierszczyki", 
				"Image":"test"
            };
            json.movies.unshift(obj);
            
            fs.writeFile('public/json/baza.json', JSON.stringify(json, null, 4), function(err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Dane zostały zapisane do: baza.json");
                }
            });

            return filename + "-" + Date.now();
            },
        onFileUploadStart: function (file) {
          console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file) {
          console.log(file.fieldname + ' uploaded to  ' + file.path);
          done = true;
        }
    }));
    app.get('/', function (req, res) {
        res.sendfile('./public/index.html');
    });

    app.post('/', function (req, res) {        
        if (done === true) {
            console.log(req.files);
            console.log('Plik wrzucony');
            res.redirect('back');
        } 
        else {
            console.log('Blad pliku');        
            res.end('Blad pliku');
        }
    });
});
/////////////////////////////////////////////////////////

var owner = {};
var history = [];
var room = [];

io.sockets.on("connection", function (socket) {	  
  socket.on("login", function(username) {
	
    if (owner[username]) {
      socket.emit('usernameNotUnique');
    } else {
      socket.username = username;
      owner[username] = socket;
      for ( var i = 0; i < history.length ; i++ ) {
        socket.emit("echo", history[i], false);
      }
      //socket.broadcast.emit("echo", "Użytkownik " + socket.username + " zalogował się.", true);
    }
  });  
  
    socket.on("message", function (data) {
	    history.push(data);
        io.sockets.emit("echo", data);
    });
    socket.on("error", function (err) {
        console.dir(err);
    });
    socket.on('disconnect', function() {
      if (owner[socket.username] === socket)
		//socket.broadcast.emit("echo", "Użytkownik " + socket.username + " wylogował się.", true);
        delete owner[socket.username];
    });
});

httpServer.listen(port, function () {
    console.log('Serwer HTTP działa na porcie ' + port);
});
