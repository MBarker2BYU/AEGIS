const homeModel = require('../models/aegis-core-model');
// const utilities = require('../utilities/utilities');

exports.getHome = (req, res) => 
{
  const data = homeModel.getLandingData();
  
  res.render('index', { title: data.title, message: data.message });  
};