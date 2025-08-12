function togglePasswordVisibility() {
  const passwordInput = document.getElementById("account_password");
  const passwordToggle = document.getElementById("passwordToggle");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggle.src = "/images/hide-password.png";
  } else {
    passwordInput.type = "password";
    passwordToggle.src = "/images/show-password.png";
  }
}

document.getElementById("passwordToggle").addEventListener("click", togglePasswordVisibility);