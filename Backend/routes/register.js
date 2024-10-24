const express = require('express')
const registerRouter = express.Router();
const registerUser = require('../controllers/registerUser');
const getUsers = require('../controllers/getUsers')

registerRouter.get('/users',getUsers);
registerRouter.post('/register',registerUser);

module.exports=registerRouter;