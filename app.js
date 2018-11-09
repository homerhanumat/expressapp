var http = require("http");
var path = require("path");
var express = require("express");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const fs = require("fs");

const users = JSON.parse(fs.readFileSync("./data/users.json"));

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
  secure: true,
  httpOnly: true

}))

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

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/thanks", function(req, res) {
  res.render("thanks");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post('/login', function (req, res) {
  let authenticated = false;
  let user;
  users.forEach(elem => {
    if (elem.username === req.body.username && elem.password === req.body.password) {
      authenticated = true;
      user = elem;
      return;
    }
  });
  if (authenticated) {
    req.session.authenticated = true;
    req.session.username = user.username;
    req.session.role = user.role;
    res.render("login-success", { 
      user: user.username
    });
  } else {
    res.render('login-failure');
  }
});

app.get("/confidential", function(req, res) {
  res.render("confidential");
});


app.use(function(req, res) {
  res.status(404).render("404");
});

http.createServer(app).listen(3000, function() {
  console.log("Basic app (with login) started.");
});
