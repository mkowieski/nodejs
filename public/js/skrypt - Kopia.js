var connection = new ActiveXObject("ADODB.Connection") ;

var connectionstring="Data Source=localhost;Initial Catalog=filmy;User ID=root;Password=;Provider=SQLOLEDB";

connection.Open(connectionstring);
var rs = new ActiveXObject("ADODB.Recordset");

rs.Open("SELECT * FROM table", connection);
rs.MoveFirst
while(!rs.eof)
{
   document.write(rs.fields(1));
   rs.movenext;
}

rs.close;
connection.close;