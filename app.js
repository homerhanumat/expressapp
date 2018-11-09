var http = require("http");
var path = require("path");
var express = require("express");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const fs = require("fs");

const users = JSON.parse(fs.readFileSync("./data/users.json"));
const quotes = JSON.parse(fs.readFileSync("./data/quotes.json"));
let subscribers = JSON.parse(fs.readFileSync("./data/subscribers.json"));

var app = express();

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

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
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: "session",
  secret: "hey there",
  //keys: process.env.KEY,
  maxAge: 60000,
  secure: true,
  httpOnly: true

}));

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
  console.log(req.session);
  res.render("confidential", {
    username: req.session.username,
    role: req.session.role
  });
});

app.get("/random", function(req, res) {
  res.render("random", {
    quote: quotes[Math.floor(Math.random()*quotes.length)]
  });
});

app.get("/subscribe", function(req, res) {
  res.render("subscribe");
});

app.post('/subscribe', function (req, res) {
  let subscriber = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email
  };
  subscribers.push(subscriber);
  fs.writeFileSync(
    "./data/subscribers.json",
    JSON.stringify(subscribers)
  );
  const items = subscribers;
  const header = Object.keys(items[0]);
  const replacer = function(key, value) { return value === null ? '' : value } 
  let csv = items.map(
    row => header.map(
      fieldName => JSON.stringify(row[fieldName], replacer)
    ).join(',')
  );
  csv.unshift(header.join(','));
  csv = csv.join("\n");
  fs.writeFileSync("./download/subscribers.csv", csv);
  res.render("subscribe-thanks", {
    grid: false
  });
});

app.get("/download", function(req, res, next) {
  res.download("./download/subscribers.csv");
});


app.use(function(req, res) {
  res.status(404).render("404");
});

http.createServer(app).listen(3000, function() {
  console.log("Basic app (with subscribers) started.");
});
