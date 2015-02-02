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
	$('#send-file').fadeIn(1000);
});      


$.getJSON("json/baza.json", function(data){
	var movies = [];
	
	$.each(data, function(key, val){
		for(var i=0;i<val.length;i++){
			movies.push(val[i]);
		}
	});
	
	//alert(movies.length);
	console.log(movies);
	
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
			$('#close').fadeIn(1000);
			$('#add').fadeIn(1000);
			$('#log-message').fadeIn(1000);
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
			message.textContent = "username jest juz w uzyciu";
			close.disabled = true;
			send.disabled = true;
			open.disabled = false;
			$("#login").prop('disabled', false);
			$('#log-message').hide();
			$('#close').hide();
			$('#add').hide();
			$('#open').fadeIn(1000);
			$('#log-pass').fadeIn();
			socket.io.disconnect();
			$('#error').html('Użytkownik już istnieje!');
			$('#username').val('');
        });
		
        socket.on("echo", function (data, newUser) {
            var msgString = document.createElement('p');
            if (newUser) {
              msgString.innerHTML = data;
            } else {
              msgString.innerHTML =  /*"[" + data.timestamp + "] "+*/"<b><i>" + data.username + "</i></b>: " + data.text;
            }
            message.appendChild(msgString);
        });
    });
    
    // Zamknij połączenie po kliknięciu guzika „Rozłącz”
    close.addEventListener("click", function (event) {
        close.disabled = true;
        send.disabled = true;
        open.disabled = false;
		$("#login").prop('disabled', false);
		$('#log-message').hide();
		$('#close').hide();
		$('#add').hide();
		$('#open').fadeIn(1000);
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


