const express = require('express');

const resetController = require('../controllers/reset-controller');

const router = express.Router();

router.get('/resetpassword', resetController.getResetPassword);

router.post('/resetpassword', resetController.postResetPassword);

// token: dynamic parameter. Has to be named token here because looking for token in request params in getNewPassword controller action
router.get('/resetpassword/:token', resetController.getNewPassword);

router.post('/newpassword', resetController.postNewPassword);

module.exports = router;
