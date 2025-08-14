// Function to initialize and store private keys with email as key in IndexedDB
function storePrivateKeys(email, ecdhPrivateKey, ecdsaPrivateKey) {
    if (!email || !ecdhPrivateKey || !ecdsaPrivateKey) {
        console.error("Error: Invalid email or ECDH/ECDSA private key format");
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
            ecdhPrivateKey: ecdhPrivateKey,
            ecdsaPrivateKey: ecdsaPrivateKey,
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

// Generate an ECDSA key pair for signing and ECDH for key exchange
async function generateKeyPair() {
  try {
    // Generate ECDSA key pair for signing/verifying messages
    const ecdsaKeyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256", // NIST P-256 curve, widely supported
      },
      true, // Extractable
      ["sign", "verify"] // Key usages
    );

    // Generate ECDH key pair for key exchange
    const ecdhKeyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256", // Same curve for compatibility
      },
      true, // Extractable
      ["deriveKey", "deriveBits"] // Key usages
    );

    // Export private and public keys for storage/sharing
    const ecdhPrivateKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdhKeyPair.privateKey));
    const ecdhPublicKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdhKeyPair.publicKey));
    const ecdsaPrivateKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdsaKeyPair.privateKey));
    const ecdsaPublicKey = JSON.stringify(await window.crypto.subtle.exportKey("jwk", ecdsaKeyPair.publicKey));

    return {
      ecdsa: {
        privateKey: ecdsaPrivateKey,
        publicKey: ecdsaPublicKey,
      },
      ecdh: {
        privateKey: ecdhPrivateKey,
        publicKey: ecdhPublicKey,
      },
    };
  } catch (error) {
    console.error("Key generation failed:", error);
    throw error;
  }
}

