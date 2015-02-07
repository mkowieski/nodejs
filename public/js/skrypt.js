//$('#window-result').hide();
$('#log-message').hide();
$('#close').hide();
$('#add').hide();
//$('#send-file').hide();

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
		
		$('#send-file').fadeIn(1000).css("display","flex");
		$('#uploadForm input[name="author"]').val($('#username').val());
});      

	var out = "", result = ""; //////////////////////////// INNE ROZWIAZANIE komentarzy by mirek kowieski
	var id = "", title = "", year = "", genre = "", description = "", author = "", image = "";



/* jshint browser: true, globalstrict: true, devel: true */
/* global io: false */
"use strict";

window.addEventListener("load", function (event) {
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var send = document.getElementById("send");
    var text = document.getElementById("text");
    var message = document.getElementById("message");
    var username = document.getElementById("username");
	var addFile = document.getElementById("addFile");
	var id = document.getElementById('id-show');
	var gallery = document.getElementById('gallery');
    var socket;

    $(document).bind('keypress', function(e) {
       var code = e.keyCode || e.which;
       if(code == 13) {
          socket.emit('message', {text: text.value, username: username.value});
		  socket.emit('comment', {id: id.value, text: text.value, username: username.value});
          text.value = "";
       }
    });
	
       status.textContent = "Brak połącznia";
	   
    close.disabled = true;
    send.disabled = true;

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
			$('#close').fadeIn().css("display", "block");
			$('#add').fadeIn().css("display", "block");
			$('#log-message').fadeIn().css("display", "block");
            console.log('Nawiązano połączenie przez Socket.io');
            socket.emit('login', username.value);
			socket.emit('show_pic');
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
			$('#open').fadeIn().css("display", "block");
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
		
		socket.on("show_pictures", function(data){
			
			var out_pic = "";
			
			for(var i=0;i<data.length;i++){
				out_pic += "<div><img class='picture' id='" + data[i].Id + "' src='images/" + data[i].Image + "' alt='' /><span>" + data[i].Name + "</span></div>";
			}
			
			document.getElementById("gallery").innerHTML = out_pic;
			out_pic = "";
			
		});
		
		socket.on("pokaz_dane", function(data){
			$('#window-result').show().css("display","flex");
			document.getElementById('id-show').value = data.Id;
			document.getElementById('title').innerHTML = data.Name;
			document.getElementById('year').innerHTML = data.Year;
			document.getElementById('genre').innerHTML = data.Genre;
			document.getElementById('description').innerHTML = data.Description;
			document.getElementById('author').innerHTML = data.Author;
			document.getElementById('image-target').src = "images/" + data.Image;
		});
		
		socket.on("pokaz_komentarze", function(data){
			var out_comment = "";
			for(var i=0; i<data.length;i++){
				out_comment += "<br><font size='1px'>[Skomentował <b>" + data[i].Username + "</b>, " + data[i].Timestamp + "]</font><br><font size='2px'>" + data[i].Text + "</font><br>";
			};
			//console.log(out_comment);
			document.getElementById('message').innerHTML = out_comment;
			out_comment = "";
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
	
	gallery.addEventListener("click", function(event){
			
			//socket.emit('baza_komentarze', event.target.id);
			socket.emit('baza', event.target.id);
		//});	
				
	});
	
	$('#uploadForm').submit(function(event){
		var $form = $(this);
		event.preventDefault();
		var formData = new FormData($(this)[0]);
		$.ajax({
			url: $form.attr("action"),
			type: $form.attr("method"),
			data: formData,
			async: false,
			cache: false,
			contentType: false,
			processData: false,
			success: function(response){
				console.log(response);
				$('#send-file').fadeOut(1000);
				socket.emit('show_pic');
			},
			error: function(){
				alert("error");
			}
		}); 
	});

	
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
		document.getElementById("gallery").innerHTML = "";
        socket.io.disconnect();
        console.dir(socket);
    });

    send.addEventListener("click", function (event) {
        socket.emit('message', {text: text.value, username: username.value});
		//////////////////////////// INNE ROZWIAZANIE komentarzy by mirek kowieski
		socket.emit('comment', {id: id.value, text: text.value, username: username.value});
		
        text.value = "";
    });
});


