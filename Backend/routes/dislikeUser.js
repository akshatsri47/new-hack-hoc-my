const express = require('express');
const dislikeRouter = express.Router();
const dislikeUser = require('../controllers/dislikeUser');

dislikeRouter.post('/dislike', dislikeUser);

module.exports = dislikeRouter;
