// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const Account = require("../models/account.model");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    // find user
    const user = await Account.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ message: 'Account not found.' });

    // ✅ compare password (supports both hashed and plain-text)
    let isMatch = false;

    try {
      if (user.password.startsWith("$2")) {
        // hashed password (bcrypt)
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // plain-text fallback for existing accounts
        isMatch = password === user.password;
      }
    } catch (compareErr) {
      console.error("Password compare error:", compareErr);
    }

    if (!isMatch)
      return res.status(404).json({ message: 'Invalid password.' });

    // ✅ Optional: automatically upgrade plain-text passwords to hashed ones
    if (!user.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      console.log(`Upgraded ${user.email} to hashed password`);
    }

    // prepare returned user object (don't send hashed password)
    const responseUser = {
      id: user._id,
      account_id: user.account_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      user_type: user.user_type,
      department: user.department,
      photo: user.photo,
      status: user.status,
    };

    // Optional: update last login
    // user.last_login = new Date();
    // await user.save();

    return res.status(200).json({ message: 'Login successful!', user: responseUser });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { login };
