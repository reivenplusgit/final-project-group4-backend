// /controllers/accountsController.js
const Account = require('../models/account.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Admin = require('../models/admin.model');
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

    // Create corresponding user type entry
    try {
      if (user_type === 'Student') {
        // Validate required fields for Student
        if (!department) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'Department is required for Student accounts' 
          });
        }

        const studentNumber = req.body.student_number;
        if (!studentNumber) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'Student number is required' 
          });
        }

        // Check if student number already exists
        const existingStudent = await Student.findOne({ student_number: studentNumber });
        if (existingStudent) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(409).json({ 
            message: 'Student number already exists' 
          });
        }

        // Validate year level based on department
        const yearLevel = req.body.year_level || 1;
        if (department === 'IS') {
          // IS allows 1-12
          if (yearLevel < 1 || yearLevel > 12) {
            await Account.findByIdAndDelete(newAccount._id);
            return res.status(400).json({ 
              message: 'IS department allows year levels 1-12' 
            });
          }
        } else {
          // Other departments allow 1-4
          if (yearLevel < 1 || yearLevel > 4) {
            await Account.findByIdAndDelete(newAccount._id);
            return res.status(400).json({ 
              message: 'Year level must be between 1-4 for this department' 
            });
          }
        }

        const newStudent = new Student({
          accounts_ref: newAccount._id,
          student_number: studentNumber,
          year_level: yearLevel,
          department: department,
          course: req.body.course || 'TBD',
          birthday: req.body.birthday || null,
          address: req.body.address || '',
          phone: req.body.phone || '',
          mother: req.body.mother || '',
          father: req.body.father || '',
          guardian_phone: req.body.guardian_phone || '',
        });
        await newStudent.save();
      } else if (user_type === 'Teacher') {
        const teacherUID = req.body.teacher_uid;
        if (!teacherUID) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'Teacher UID is required' 
          });
        }

        // Check if teacher UID already exists
        const existingTeacher = await Teacher.findOne({ teacher_uid: teacherUID });
        if (existingTeacher) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(409).json({ 
            message: 'Teacher UID already exists' 
          });
        }

        // Teacher can have multiple departments
        const teacherDepts = req.body.teacher_departments || (department ? [department] : ['IS']);
        
        if (!Array.isArray(teacherDepts) || teacherDepts.length === 0) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'At least one department is required for Teacher accounts' 
          });
        }

        const newTeacher = new Teacher({
          account_ref: newAccount._id,
          teacher_uid: teacherUID,
          departments: teacherDepts,
          subjects: [],
        });
        await newTeacher.save();
      } else if (user_type === 'Admin') {
        if (!department) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'Department is required for Admin accounts' 
          });
        }

        const adminID = req.body.admin_id;
        if (!adminID) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(400).json({ 
            message: 'Admin ID is required' 
          });
        }

        // Check if admin ID already exists
        const existingAdmin = await Admin.findOne({ admin_id: adminID });
        if (existingAdmin) {
          await Account.findByIdAndDelete(newAccount._id);
          return res.status(409).json({ 
            message: 'Admin ID already exists' 
          });
        }

        const adminLevel = req.body.admin_level || (department === 'System' ? 'sys_admin' : 'department_admin');

        const newAdmin = new Admin({
          accounts_ref: newAccount._id,
          admin_id: adminID,
          admin_level: adminLevel,
          department: department,
        });
        await newAdmin.save();
      }
    } catch (userTypeError) {
      // If creating user type entry fails, delete the account to maintain consistency
      await Account.findByIdAndDelete(newAccount._id);
      console.error(`Failed to create ${user_type} entry:`, userTypeError);
      return res.status(500).json({ 
        message: `Failed to create ${user_type} entry`, 
        error: userTypeError.message 
      });
    }

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
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Delete corresponding user type entry
    try {
      if (account.user_type === 'Student') {
        await Student.findOneAndDelete({ accounts_ref: req.params.id });
      } else if (account.user_type === 'Teacher') {
        await Teacher.findOneAndDelete({ account_ref: req.params.id });
      } else if (account.user_type === 'Admin') {
        await Admin.findOneAndDelete({ accounts_ref: req.params.id });
      }
    } catch (userTypeError) {
      console.error(`Error deleting ${account.user_type} entry:`, userTypeError);
      // Continue with account deletion even if user type deletion fails
    }

    const removed = await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};