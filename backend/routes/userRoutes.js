const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlockUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('Admin'), getAllUsers);
router.put('/:id/block', auth, roleCheck('Admin'), toggleBlockUser);

module.exports = router;
