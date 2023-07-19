const router = require('express').Router();

const indexContoller = require('../controllers/index-controller');

router.get('/homeScreen', indexContoller.getHome);
router.get('/aboutUs', indexContoller.getaboutUs);
router.get('/aboutUs', indexContoller.getcontactUs);
module.exports = router;
