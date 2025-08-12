const jwt = require("jsonwebtoken")
require("dotenv").config()

const utilities = {}

//Middleware
utilities.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

utilities.checkJWTToken = (req, res, next) => {
  
if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    
    function (err, accountData) {
        if (err) {
            req.flash("notice", "Please log in")
            res.clearCookie("jwt")
    return res.redirect("/account/login")
    }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
    })
    } else {
        next()
    }
}

module.exports = utilities