const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(3000, () => console.log('Server running on port 3000'));