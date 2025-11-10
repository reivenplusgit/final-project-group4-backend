const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accounts.controller');
const { body } = require('express-validator');

// validations
const createValidation = [
  body('account_id').notEmpty().withMessage('account_id required'),
  body('email').isEmail().withMessage('valid email required'),
  body('password').isLength({ min: 8 }).withMessage('password min 8 chars'),
  body('firstname').notEmpty(),
  body('lastname').notEmpty(),
];

router.get('/', accountsController.getAll);
router.get('/:id', accountsController.getOne);
router.post('/', createValidation, accountsController.create);
router.put('/:id', accountsController.update);
router.delete('/:id', accountsController.remove);

module.exports = router;
