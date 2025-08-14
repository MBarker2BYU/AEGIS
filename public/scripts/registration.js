// // public/js/registration.js
// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('registrationForm');
//   if (!form) {
//     console.error('Registration form not found. Check the ID in HTML.');
//     return;
//   }

//   form.addEventListener('submit', async function(event) {
//     const firstName = document.getElementById('first_name').value;
//     const lastName = document.getElementById('last_name').value;
//     const email = document.getElementById('account_email').value;
//     const password = document.getElementById('account_password').value;
//     const messageDiv = document.getElementById('message');
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     console.log('Form submitted with email:', email);

//     if (!firstName.trim() || !lastName.trim() || !email.trim() || !emailRegex.test(email) || password.length < 8) {
//       messageDiv.textContent = 'Please fill all fields correctly (password min 8 chars)!';
//       event.preventDefault();
//       return;
//     }

//     try {
//       // Generate and store private keys
//       const result = await generateAndStorePrivateKey(email);
//       console.log(result.message);

//       // Export public keys and add to form
//       const rsaPublicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(await window.crypto.subtle.exportKey('spki', await getPublicKey('rsa', email)))));
//       const ecdsaPublicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(await window.crypto.subtle.exportKey('spki', await getPublicKey('ecdsa', email)))));

//       const rsaInput = document.createElement('input');
//       rsaInput.type = 'hidden';
//       rsaInput.name = 'rsaPublicKey';
//       rsaInput.value = rsaPublicKeyBase64;
//       form.appendChild(rsaInput);

//       const ecdsaInput = document.createElement('input');
//       ecdsaInput.type = 'hidden';
//       ecdsaInput.name = 'ecdsaPublicKey';
//       ecdsaInput.value = ecdsaPublicKeyBase64;
//       form.appendChild(ecdsaInput);

//       // Validate keys
//       const validation = await isKeyPairValid(email);
//       console.log(validation.message);
//       messageDiv.textContent = 'Submitting...';
//     } catch (error) {
//       console.error('Registration error:', error.message);
//       messageDiv.textContent = 'Failed to generate or validate keys!';
//       event.preventDefault();
//       await deletePrivateKey(email).catch(console.error);
//     }
//   });
// });

async function registerUser(event)
{
  event.preventDefault(); // Prevent default form submission
  console.log('Button clicked, running client-side registration logic');

  const form = document.getElementById('registrationForm');
  const formData = new FormData(form);
  const messageDiv = document.getElementById('message');
  const button = form.querySelector('button');

  try
  {
    button.disabled = true;

    // Validate form inputs
    const isValid = validateForm(formData);
    if (!isValid) {
      messageDiv.textContent = 'Validation failed. Please check your inputs.';
      return;
    }

    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
      params.append(key, value);
    }

    params.append('rsa_public_key', "No RSA Key");
    params.append('ecdsa_public_key', "No ECDSA Key");

    const response = await fetch('/account/registration', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include', // Include cookies for session
    });

    // Check if response is OK
    if (!response.ok) {
      const text = await response.text(); // Get raw response for debugging
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${text.slice(0, 100)}`);
    }

    // Verify content type
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, but received ${contentType}: ${text.slice(0, 100)}`);
    }

    // Parse JSON response
    const result = await response.json();

    // Handle response
    if (result.success) {
      messageDiv.textContent = result.message || 'Registration successful!';
      if (result.redirect) {
        window.location.href = result.redirect; // Navigate to login page
      }
    } else {
      messageDiv.textContent = result.message || 'Registration failed.';
    }
  } catch (error) {
    console.error('Error in registration logic:', error);
    messageDiv.textContent = error.message || 'An error occurred during registration.';
  } finally {
    button.disabled = false;
    console.log('Registration process completed.');
  }
}

function validateForm(formData) {
  const firstName = formData.get('first_name');
  const lastName = formData.get('last_name');
  const email = formData.get('account_email');
  const password = formData.get('account_password');

  // Basic validation (customize as needed)
  if (!firstName || firstName.length < 2) return false;
  if (!lastName || lastName.length < 2) return false;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (!password || password.length < 8) return false;

  return true;
}