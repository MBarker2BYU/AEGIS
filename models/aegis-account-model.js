const pool = require("../database/")

const model = {}

model.createAccount = async (accountData) => {
  const { first_name, last_name, account_email, account_password } = accountData
    const result = await pool.query(
    'INSERT INTO account (first_name, last_name, account_email, account_password, rsa_public_key, ecdsa_public_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [first_name, last_name, account_email, account_password,
    accountData.rsa_public_key,
    accountData.ecdsa_public_key]
  )
  return result.rows[0]
}

model.getAccountByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM account WHERE account_email = $1', [email])
  return result.rows[0]
}

model.getAccountById = async (account_id) => {
  try {
    const result = await pool.query(
      'SELECT account_id, first_name, last_name, account_email FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

model.updateAccount = async (accountId, first_name, last_name) => {
  const result = await pool.query(
    'UPDATE account SET first_name = $1, last_name = $2 WHERE account_id = $3 RETURNING *',
    [first_name, last_name, accountId]
  )
  return result.rows[0]
}

model.updateAccountPassword = async (accountId, newPassword) => {
  try {
    
    const result = await pool.query(
      'UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *',
      [newPassword, accountId]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("Error updating password")
  }
}

module.exports = model