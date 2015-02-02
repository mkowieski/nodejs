var data = {dane: [
	{Id:"foto_1", Name:"Świerszczyki", Year:"1999", Description:"opis swierszczyki", Image:"test"},
	{Id:"foto_2", Name:"Gwieździsta Noc", Year:"2002", Description:"opis gwiezdzista noc", Image:"test" },
	{Id:"foto_3", Name:"W pół do siódmej", Year:"2015", Description:"opis w pol do siodmej", Image:"test" },
	{Id:"foto_4", Name:"Kraina rozpaczy", Year:"1982", Description:"opis kraina rozpaczy", Image:"test" }
]};

var out = "";
var title = "", year = "", description = "";

/*$('#add').click(function(){
	data.dane.push(
    {Id:"foto_5", Name:"xxx", Year:"1999", Description:"opis xxx", Image:"test"}
);

for(var i=0;i<data.dane.length;i++){
	out += "<div><img class='picture' id='" + data.dane[i].Id + "' src='images/" + data.dane[i].Image + ".jpg' alt='' /><span>" + data.dane[i].Name + "</span></div>";
}

document.getElementById('gallery').innerHTML = out;

out = "";
});*/


//obj = JSON.parse(data);
//$('#out').html();

//obj = JSON.parse(data);

var out = "";
var title = "", year = "", description = "";

for(var i=0;i<data.dane.length;i++){
	out += "<div><img class='picture' id='" + data.dane[i].Id + "' src='images/" + data.dane[i].Image + ".jpg' alt='' /><span>" + data.dane[i].Name + "</span></div>";
}

document.getElementById('gallery').innerHTML = out;

out = "";

$('#gallery').click(function(event){
	
	for(var i=0;i<data.dane.length;i++){
		if(data.dane[i].Id == event.target.id){
			$('#window-result').show();
			title += data.dane[i].Name;
			year += data.dane[i].Year
			description += data.dane[i].Description;
		}
	}

	document.getElementById('title').innerHTML = title;
	document.getElementById('year').innerHTML = year;
	document.getElementById('description').innerHTML = description;
	title = "";
	year = "";
	description = "";
});
