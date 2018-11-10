var http = require("http");
var path = require("path");
var express = require("express");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const rootRouter = require("./root-router");

var app = express();

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: "session",
  secret: "hey there",
  //keys: process.env.KEY,
  maxAge: 60000,
  secure: false,
  httpOnly: true

}));

// array of secure locations:
secureURLs = ["/confidential"];
// this function will be applied to every request:
function checkAuth (req, res, next) {
	if (secureURLs.includes(req.url) && (!req.session || !req.session.authenticated)) {
    res.render('secure-failure');
		return;
	}
	next();
}

app.use(checkAuth);

app.use("/", rootRouter);


app.use(function(req, res) {
  res.status(404).render("404");
});

http.createServer(app).listen(3000, function() {
  console.log("Basic app (with router file) started.");
});
