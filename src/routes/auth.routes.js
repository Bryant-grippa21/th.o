const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');

const {
  registerLocal,
  loginLocal,
  loginGoogle,
  updateProfile,
  getProfile
} = require('../controllers/auth.controller');

router.post('/register', registerLocal);
router.post('/login', loginLocal);
router.post('/google', loginGoogle);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

router.get('/me', verifyToken, (req, res) => {
  res.json({
    logged: true,
    user: req.user
  });
});

module.exports = router;