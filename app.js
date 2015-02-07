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
            

            return filename;
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
			//console.log(req.files.username);
            console.log('Plik wrzucony');
			
			var obj = {
                "Id": req.body.id,
                "Name": req.body.name,
                "Year": req.body.year, 
				"Genre": req.body.genre,
				"Description": req.body.description, 
				"Image": req.files.userPhoto.name,
				"Author": req.body.author
            };
            json.movies.unshift(obj);
            
            fs.writeFile('public/json/baza.json', JSON.stringify(json, null, 4), function(err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Dane zostały zapisane do: baza.json");
                }
            });
            //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            res.end('koniec');
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
var comment = {};
var comment_tab = [];
var test;

fs.readFile('public/json/baza.json', 'utf-8', function (err, data){
	if (err) throw err;
	test = JSON.parse(data);

io.sockets.on("connection", function (socket) {	  


		
    socket.on("login", function(username) {
		if(username == ""){
			socket.emit('noName');
		}else{
			if (owner[username]) {
			  socket.emit('usernameNotUnique');
			} else {
			  socket.username = username;
			  owner[username] = socket;
			  for ( var i = 0; i < history.length ; i++ ) {
				socket.emit("echo", history[i], false);
			  }
			  console.log(test);
			  //socket.broadcast.emit("echo", "Użytkownik " + socket.username + " zalogował się.", true);
			}
		}
    }); 
	
	socket.on('baza', function(id){
		
		fs.readFile('public/json/baza.json', 'utf-8', function (err, data){
			if (err) throw err;
			var json = JSON.parse(data);

			for(var i=0; i<json.movies.length;i++){
				if(json.movies[i].Id == id){
					socket.emit("pokaz_dane", json.movies[i]);
				};
			};
		});
		fs.readFile('public/json/komentarze.json', 'utf-8', function (err, data){
			if (err) throw err;
			var json = JSON.parse(data);
			var data_test = [];
			for(var i=0; i<json.comments.length;i++){
				if(json.comments[i].Id == id){
					data_test.push(json.comments[i]);
					
				};
			};
			socket.emit("pokaz_komentarze", data_test);
		});
	});
	
	socket.on('show_pic', function(){
		
		fs.readFile('public/json/baza.json', 'utf-8', function (err, data){
			if (err) throw err;
			var json = JSON.parse(data);	
			
			io.sockets.emit('show_pictures', json.movies);
		});
		
	});
	
	//////////////////////////// INNE ROZWIAZANIE komentarzy by mirek kowieski
	socket.on("comment", function(dane){
		var date = new Date(),
			hour = date.getHours(),
			minute = date.getMinutes(),
			day = date.getDate(),
			month = date.getMonth()+1,
			year = date.getFullYear();
			
		if(minute<10){
			minute = "0" + minute;
		}
		if(hour<10){
			hour = "0" + hour;
		}
		if(day<10){
			day = "0" + day;
		}
		if(month<10){
			month = "0" + month;
		}
		
		dane.timestamp = hour + ":" + minute + " " + day + "." + month + "." + year;
		
		fs.readFile('public/json/komentarze.json', 'utf-8', function (err, data) {
			if (err) throw err;
			var json = JSON.parse(data);
			
			var obj = {
                "Id": dane.id,
				"Text": dane.text,
				"Username": dane.username,
				"Timestamp": dane.timestamp
            };
            json.comments.push(obj);
            
            fs.writeFile('public/json/komentarze.json', JSON.stringify(json, null, 4), function(err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Dane zostały zapisane do: komentarze.json");
                }
            });
		});
	});
  
    socket.on("message", function (data) {
		var date = new Date(),
			hour = date.getHours(),
			minute = date.getMinutes(),
			day = date.getDate(),
			month = date.getMonth()+1,
			year = date.getFullYear();
			
		if(minute<10){
			minute = "0" + minute;
		}
		if(hour<10){
			hour = "0" + hour;
		}
		if(day<10){
			day = "0" + day;
		}
		if(month<10){
			month = "0" + month;
		}
		
		data.timestamp = hour + ":" + minute + " " + day + "." + month + "." + year;
		
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

}); // zamkniecie readfile

httpServer.listen(port, function () {
    console.log('Serwer HTTP działa na porcie ' + port);
});
