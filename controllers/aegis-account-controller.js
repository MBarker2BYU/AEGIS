const controller = {}

controller.login = (req, res) => {
  res.render('account/login', { title: 'AEGIS Login', message: 'Please log in to your account.' });
}

controller.loginPost = (req, res) => { 
  console.log('Login attempt:', req.body); 
  if (req.body.account_email === 'test@example.com') 
    { req.session.user = { email: req.body.account_email }; 
  res.redirect('/account/messaging'); } 
  else { res.send('Invalid email'); } };

module.exports = controller;