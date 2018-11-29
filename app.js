var http = require("http");
var path = require("path");
var express = require("express");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const helmet = require("helmet");
const ms = require("ms");
const enforceSSL = require("express-enforces-ssl");
const rootRouter = require("./root-router");

var app = express();

// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').load();
// }

if (process.env.NODE_ENV == "production") {
  app.use(enforceSSL());
  app.use(helmet.hsts({
    maxAge: ms("1 year"),
    includeSubdomains: true
  }));
};

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.enable('trust proxy'); // optional, not needed for secure cookies
app.use(session({
  name: "session",
  secret: "hey there",
  maxAge: 60000,
  secure: process.env.NODE_ENV == "production" ? true : false,
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

http.createServer(app).listen(process.env.PORT || 3000, function() {
  console.log("Basic app (with router file) started.");
});
