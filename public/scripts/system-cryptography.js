// Function to initialize and store private keys with email as key in IndexedDB
function storePrivateKeys(email, rsaPrivateKey) {
    if (!email || !rsaPrivateKey) {
        console.error("Error: Invalid email or RSA private key format");
        return;
    }

    const request = window.indexedDB.open("AEGIS", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("keys")) {
            const objectStore = db.createObjectStore("keys", { keyPath: "email" });
            objectStore.createIndex("keyType", "keyType", { unique: false });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(["keys"], "readwrite");
        const objectStore = transaction.objectStore("keys");

        // Store ECDH and ECDSA keys under the same email key, differentiated by keyType
        const keyData = {
            email: email,
            rsaPrivateKey: rsaPrivateKey,
            timestamp: new Date()
        };

        const addRequest = objectStore.put(keyData); // Use put to update or insert

        addRequest.onsuccess = function() {
            console.log("Private keys stored successfully for email: ", email);
        };

        addRequest.onerror = function(event) {
            console.error("Error storing private keys: ", event.target.error);
        };

        transaction.oncomplete = function() {
            db.close();
        };
    };

    request.onerror = function(event) {
        console.error("Database connection error: ", event.target.error?.message || "No specific error message");
    };

    request.onblocked = function(event) {
        console.warn("Database connection blocked.");
    };
}

async function getPrivateKey(email) {
    if (!email) {
        console.error('Error: Invalid email');
        return null;
    }

    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('AEGIS', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys', { keyPath: 'email' });
            }
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['keys'], 'readonly');
            const objectStore = transaction.objectStore('keys');
            const getRequest = objectStore.get(email);

            getRequest.onsuccess = function(event) {
                const keyData = event.target.result;
                resolve(keyData?.rsaPrivateKey || null);
                db.close();
            };

            getRequest.onerror = function(event) {
                console.error('Error retrieving private key:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Database error:', event.target.error?.message);
            reject(event.target.error);
        };
    });
}

// Generate an ECDSA key pair for signing and ECDH for key exchange
async function generateKeyPair() {
  try {
    // // Generate ECDSA key pair for signing/verifying messages
    // const ecdsaKeyPair = await window.crypto.subtle.generateKey(
    //   {
    //     name: "ECDSA",
    //     namedCurve: "P-256", // NIST P-256 curve, widely supported
    //   },
    //   true, // Extractable
    //   ["sign", "verify"] // Key usages
    // );

    // // Generate ECDH key pair for key exchange
    // const ecdhKeyPair = await window.crypto.subtle.generateKey(
    //   {
    //     name: "ECDH",
    //     namedCurve: "P-256", // Same curve for compatibility
    //   },
    //   true, // Extractable
    //   ["deriveKey", "deriveBits"] // Key usages
    // );

    // // Export private and public keys for storage/sharing
    // const ecdhPrivateKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdhKeyPair.privateKey));
    // const ecdhPublicKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdhKeyPair.publicKey));
    // const ecdsaPrivateKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdsaKeyPair.privateKey));
    // const ecdsaPublicKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdsaKeyPair.publicKey));

    // Generate RSA key pair for encryption/decryption
    const rsaKeyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // Secure key size
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: "SHA-256",
      },
      true, // Extractable
      ["encrypt", "decrypt"]
    );

    
    const rsaPrivateKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", rsaKeyPair.privateKey));
    const rsaPublicKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", rsaKeyPair.publicKey));

    return {
      rsa: {
        privateKey: rsaPrivateKey,
        publicKey: rsaPublicKey,
      }
    };
  } catch (error) {
    console.error("Key generation failed:", error);
    throw error;
  }
}

async function encryptMessage(publicKeyJwk, message) {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicKeyJwk),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encodedMessage
    );

    return btoa(String.fromCharCode(...new Uint8Array(ciphertext))); // Base64 encode
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

async function decryptMessage(privateKeyJwk, encryptedMessage) {
    try {
        // Parse JWK private key
        const privateKey = await window.crypto.subtle.importKey(
            'jwk',
            JSON.parse(privateKeyJwk),
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['decrypt']
        );

        // Decode base64-encoded ciphertext
        const ciphertext = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));

        // Decrypt
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            ciphertext
        );

        // Convert to string
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw error;
    }
}

