const utilities = {}

utilities.getNavigation = async function (req, res, next) {
  let data = ["Main", "Inventory", "About Us", "Contact Us"];
  let list = '<ul class="nav-list">'
   
  list += '<li><a href="/" title="Home page">Home</a></li>'
  
  data.rows.forEach((row) => {
    list += "<li>"
    list += `${row}`
      
    list += "</li>"
  })
  list += "</ul>"
  
  return list
}

module.exports = utilities;