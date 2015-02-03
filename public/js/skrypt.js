$('#window-result').hide();
$('#log-message').hide();
$('#close').hide();
$('#add').hide();
$('#send-file').hide();

$('#close-window').click(function(event){
	$('#window-result').hide();
});

$('#close-window-upload').click(function(event){
	$('#send-file').fadeOut(1000);
});

$('#add').click(function(event){
	$.getJSON("json/baza.json", function(data){
		var movies = [];
		
		$.each(data, function(key, val){
			for(var i=0;i<val.length;i++){
				movies.push(val[i]);
			}
		});

		$('#uploadForm input[name="id"]').val(movies.length+1);
	});	
	
	$('#send-file').fadeIn(1000);
	$('#uploadForm input[name="author"]').val($('#username').val());
});      

var out = "";
	var title = "", year = "", genre = "", description = "", author = "", image = "";
setInterval(function(){
	$.getJSON("json/baza.json", function(data){
		var movies = [];
		
		$.each(data, function(key, val){
			for(var i=0;i<val.length;i++){
				movies.push(val[i]);
			}
		});

		for(var i=0;i<movies.length;i++){
			out += "<div><img class='picture' id='" + movies[i].Id + "' src='images/" + movies[i].Image + "' alt='' /><span>" + movies[i].Name + "</span></div>";
		}

		document.getElementById('gallery').innerHTML = out;

		out = "";
	});	
},500);

$('#gallery').click(function(event){
	$.getJSON("json/baza.json", function(data){
		var movies = [];
		
		$.each(data, function(key, val){
			for(var i=0;i<val.length;i++){
				movies.push(val[i]);
			}
		});
		for(var i=0;i<movies.length;i++){
			if(movies[i].Id == event.target.id){
				$('#window-result').show();
				title += movies[i].Name;
				year += movies[i].Year;
				genre += movies[i].Genre;
				description += movies[i].Description;
				author += movies[i].Author;
				image += movies[i].Image;
			}
		}

		document.getElementById('title').innerHTML = title;
		document.getElementById('year').innerHTML = year;
		document.getElementById('genre').innerHTML = genre;
		document.getElementById('description').innerHTML = description;
		document.getElementById('author').innerHTML = author;
		document.getElementById('image-target').src = "images/" + image;
		title = "";
		year = "";
		genre = "";
		description = "";
		author = "";
		image = "";
	});
});



/* jshint browser: true, globalstrict: true, devel: true */
/* global io: false */
"use strict";

// Inicjalizacja
window.addEventListener("load", function (event) {
    //var status = document.getElementById("status");
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var send = document.getElementById("send");
    var text = document.getElementById("text");
    var message = document.getElementById("message");
    var username = document.getElementById("username");
	var addFile = document.getElementById("addFile");
    var socket;
	
    $(document).bind('keypress', function(e) {
       var code = e.keyCode || e.which;
       if(code == 13) {
          socket.emit('message', {text: text.value, username: username.value});
          console.log('Wysłałem wiadomość: ' + text.value);
          text.value = "";
       }
    });
	
       status.textContent = "Brak połącznia";
	   
    close.disabled = true;
    send.disabled = true;

    // Po kliknięciu guzika „Połącz” tworzymy nowe połączenie WS
    open.addEventListener("click", function (event) {
        open.disabled = true;
        if (!socket || !socket.connected) {
            socket = io({forceNew: true});
        }
		
        socket.on('connect', function () {
            close.disabled = false;
            send.disabled = false;
            username.disabled = true;
			$("#message").html("");
			$("#login").prop('disabled', true);
			$("#target-name").html(username.value);
			$('#log-pass').hide();
			$('#open').hide();
			$('#close').fadeIn();
			$('#add').fadeIn();
			$('#log-message').fadeIn();
            console.log('Nawiązano połączenie przez Socket.io');
            socket.emit('login', username.value);
        });
        socket.on('disconnect', function () {
            open.disabled = false;
            username.disabled = false;
			$("#message").html("Aby zobaczyć albo dodawać komentarze musisz się zalogować.");
            console.log('Połączenie przez Socket.io zostało zakończone');
        });
		
        socket.on("error", function (err) {
            message.textContent = "Błąd połączenia z serwerem: '" + JSON.stringify(err) + "'";
        });
		
        socket.on("usernameNotUnique", function() {
			//message.textContent = "username jest juz w uzyciu";
			close.disabled = true;
			send.disabled = true;
			open.disabled = false;
			$("#login").prop('disabled', false);
			$('#log-message').hide();
			$('#close').hide();
			$('#add').hide();
			$('#open').fadeIn();
			$('#log-pass').fadeIn();
			socket.io.disconnect();
			$('#error').html('Użytkownik już istnieje!');
			$('#username').val('');
        });
		
		socket.on("noName", function() {
			//message.textContent = "username jest juz w uzyciu";
			close.disabled = true;
			send.disabled = true;
			open.disabled = false;
			$("#login").prop('disabled', false);
			$('#log-message').hide();
			$('#close').hide();
			$('#add').hide();
			$('#open').fadeIn();
			$('#log-pass').fadeIn();
			socket.io.disconnect();
			$('#error').html('Pole <b>użytkownik</b> musi być uzupełnione!');
			$('#username').val('');
        });
		
        socket.on("echo", function (data, newUser) {
            var msgString = document.createElement('p');
            if (newUser) {
              msgString.innerHTML = data;
            } else {
              msgString.innerHTML =  "<font size='1px'>[Skomentował <b>" + data.username + "</b>, " + data.timestamp + "]</font><br> <font size='2px'>" + data.text + "</font>";
            }
            message.appendChild(msgString);
        });
    });
	
	/*addFile.addEventListener("click", function(event){
		socket.emit("addFile", username.value);
	});*/
    
    // Zamknij połączenie po kliknięciu guzika „Rozłącz”
    close.addEventListener("click", function (event) {
        close.disabled = true;
        send.disabled = true;
        open.disabled = false;
		$("#login").prop('disabled', false);
		$('#log-message').hide();
		$('#close').hide();
		$('#add').hide();
		$('#open').fadeIn();
		$('#log-pass').fadeIn();
        message.textContent = "";
        socket.io.disconnect();
        console.dir(socket);
    });

    // Wyślij komunikat do serwera po naciśnięciu guzika „Wyślij”
    send.addEventListener("click", function (event) {
        socket.emit('message', {text: text.value, username: username.value});
        console.log('Wysłałem wiadomość: ' + text.value);
        text.value = "";
    });
});


