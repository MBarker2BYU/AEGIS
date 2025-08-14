const accountModel = require('../models/aegis-account-model');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const controller = {}

controller.login = (req, res) => {
  res.render('account/login', { title: 'AEGIS Login', message: 'Please log in to your account.' });
}

controller.loginPost = async (req, res) => {
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    res.status(401).render('account/login', { title: 'AEGIS Login', message: 'Invalid email or password.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);

  delete accountData.account_password; // Remove password before storing in session

  if (!isPasswordValid) {
    res.status(401).render('account/login', { title: 'AEGIS Login', message: 'Invalid email or password.' });
    return;
  }

  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

  if(process.env.NODE_ENV === 'production') {
    res.cookie('jwt', accessToken, { httpOnly: true, secure: true });
  } else {
    res.cookie('jwt', accessToken, { httpOnly: true });
  }

  req.session.account_id = accountData.account_id;
  res.redirect('/account/messaging');
};

controller.logout = (req, res) => {
  res.clearCookie("jwt")
  res.locals.loggedin = ''
  return res.redirect("/")
}

controller.register = (req, res) => {
  res.render('account/register', { title: 'AEGIS Register', message: 'Create a new account.' });
}

controller.registerPost = async (req, res) => {
  const accountData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    account_email: req.body.account_email,
    account_password: req.body.account_password,
    rsa_public_key: req.body.rsa_public_key,
    ecdsa_public_key: req.body.ecdsa_public_key,
  };

  try {
    // Check if keys are null or undefined
    if (!accountData.rsa_public_key || !accountData.ecdsa_public_key) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing cryptographic keys',
      });
    }

    // Check if email is already in use
    if (accountData.account_email) {
      const existingAccount = await accountModel.getAccountByEmail(accountData.account_email);
      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use.',
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(accountData.account_password, 10);
    accountData.account_password = hashedPassword;

    // Create the account
    const results = await accountModel.createAccount(accountData);

    if (results) {
      req.session.account_id = results.account_id;
      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        redirect: '/account/login', // Let client handle redirect
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error creating account.',
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message, // Optional: remove in production
    });
  }
};controller.registerPost = async (req, res) => {
  const accountData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    account_email: req.body.account_email,
    account_password: req.body.account_password,
    ecdh_public_key: req.body.ecdh_public_key,
    ecdsa_public_key: req.body.ecdsa_public_key,
  };

  try {
    // Check if keys are null or undefined
    if (!accountData.ecdh_public_key || !accountData.ecdsa_public_key) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing cryptographic keys',
      });
    }

    // Check if email is already in use
    if (accountData.account_email) {
      const existingAccount = await accountModel.getAccountByEmail(accountData.account_email);
      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use.',
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(accountData.account_password, 10);
    accountData.account_password = hashedPassword;

    // Create the account
    const results = await accountModel.createAccount(accountData);

    if (results) {
      req.session.account_id = results.account_id;
      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        redirect: '/account/login', // Let client handle redirect
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error creating account.',
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message, // Optional: remove in production
    });
  }
};  

controller.profile = async (req, res) => {
  const account_id = req.session.account_id;

  const accountData = await accountModel.getAccountById(account_id);
  if (!accountData) {
    req.flash("notice", "No account found with that ID.");
    return res.redirect("/account/");
  }
  res.render("account/update", {
    title: "Profile Management",
    message: "Update your profile information.",
    errors: null,
    first_name: accountData.first_name,
    last_name: accountData.last_name,
    account_email: accountData.account_email,
    account_id,
  });
}

controller.updateProfile = async (req, res) => {
  const account_id = req.session.account_id;
  const { first_name, last_name } = req.body;

  try {
    const updatedAccount = await accountModel.updateAccount(account_id, first_name, last_name);
    if (!updatedAccount) {
      req.flash("error", "Error updating profile.");
      return res.redirect(`/account/profile`);
    }

    req.flash("success", "Profile updated successfully.");
    res.redirect(`/account/login`);
  } catch (error) {
    req.flash("error", "Error updating profile.");
    res.redirect(`/account/profile`);
  }
}

controller.updatePassword = async (req, res) => {
  const account_id = req.session.account_id;
  const { account_password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(account_password, 10);

    const passwordUpdated = await accountModel.updateAccountPassword(account_id, hashedPassword);

    if(!passwordUpdated) {
      req.flash("error", "Error updating password.");
      return res.redirect(`/account/profile`);
    }

    req.flash("success", "Password updated successfully.");
    res.redirect(`/account/login`);
  } catch (error) {
    req.flash("error", "Error updating password.");
    res.redirect(`/account/profile`);
  }
}

module.exports = controller;