const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
// const pgSession = require('connect-pg-simple')(session);

const accountRouter = require('./routes/aegis-account-route');

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