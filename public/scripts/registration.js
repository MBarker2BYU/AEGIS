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

    const account_email = formData.get('account_email');

    // Add cryptographic keys if not present
    const { rsa } = await generateKeyPair();

    params.append('rsa_public_key', rsa.publicKey);
    // params.append('ecdsa_public_key', ecdsa.publicKey);

    storePrivateKeys(account_email, rsa.privateKey);

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