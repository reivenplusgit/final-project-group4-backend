// controllers/authController.js
const bcrypt = require('bcrypt');
const Account = require('../models/Account');
const generateToken = require('../utils/generateToken');

const saltRounds = Number(process.env.SALT_ROUNDS) || 12;
const jwtExpires = process.env.JWT_EXPIRES_IN || '1h';

exports.register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, userType, department, studentNumber } = req.body;

    if (!email || !password || !firstname || !lastname || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // if student, ensure studentNumber present
    if (userType === 'student' && !studentNumber) {
      return res.status(400).json({ message: 'Student number required for students' });
    }

    const existing = await Account.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, saltRounds);

    const account = new Account({
      email,
      password: hashed,
      firstname,
      lastname,
      userType,
      department,
      studentNumber,
      // isApproved default false
    });

    await account.save();

    // Do not auto-login; tell client it's pending approval (or if admin/teacher you may choose auto-approve)
    return res.status(201).json({
      message: 'Account created. Pending admin approval.',
      account: {
        id: account._id,
        email: account.email,
        firstname: account.firstname,
        lastname: account.lastname,
        userType: account.userType,
        isApproved: account.isApproved
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await Account.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // If not approved, disallow login (unless you want teachers/admins to log in immediately)
    if (!user.isApproved && user.userType !== 'admin') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    // Create JWT
    const payload = { id: user._id, userType: user.userType };
    const token = generateToken(payload, process.env.JWT_SECRET, jwtExpires);

    // Send token in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax', // adapt in production if needed
      maxAge: 1000 * 60 * 60 // 1 hour (match jwtExpires)
    };

    res.cookie('token', token, cookieOptions);
    res.json({
      message: 'Logged in',
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax'
    });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
