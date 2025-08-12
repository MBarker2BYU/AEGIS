const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const pool = require('./database/')
const session = require('express-session');
const cookieParser = require("cookie-parser")

const utilities = require('./utilities');

//routers
const accountRouter = require('./routes/aegis-account-route');


app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data (optional, if needed)
app.use(cookieParser());

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(utilities.checkJWTToken)

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'aegis-secret', resave: false, saveUninitialized: false }));

//View Engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');

//Routes
app.use(express.static('public'));
app.use('/account', accountRouter);

app.get('/', (req, res) => {
  res.redirect('/account/login');
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})