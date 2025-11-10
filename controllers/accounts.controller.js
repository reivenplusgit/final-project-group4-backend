// /controllers/accountsController.js
const Account = require('../models/account.model');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
  try {
    const accounts = await Account.find().sort({ date_created: -1 });
    res.status(200).json(accounts);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const acc = await Account.findById(req.params.id);
    if (!acc) return res.status(404).json({ message: 'Account not found' });
    res.json(acc);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { account_id, email, password, firstname, lastname, photo, user_type, department } = req.body;

    // check unique
    const exists = await Account.findOne({ $or: [{ email }, { account_id }] });
    if (exists) return res.status(409).json({ message: 'Email or account_id already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newAccount = new Account({
      account_id, email, password: hashed, firstname, lastname, photo, user_type, department
    });
    await newAccount.save();
    res.status(201).json({ message: 'Account created', id: newAccount._id });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updated = await Account.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Account not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const removed = await Account.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};
