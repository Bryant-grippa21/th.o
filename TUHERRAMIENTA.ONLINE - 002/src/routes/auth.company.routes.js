const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadCompanyImage, uploadCompanyLegalDocuments } = require('../middlewares/upload.middleware');

const {
  registerLocalCompany,
  loginLocalCompany,
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyProfileImage,
  getAdminCompanies,
  getAdminCompanyRoles,
  getCompanyVerificationSummary,
  createCompanyVerificationDocuments,
  getAdminCompanyVerificationSummary,
  reviewAdminCompanyVerification,
  updateAdminCompanyRole,
  updateAdminCompanyStatus,
  resetAdminCompanyAttempts,
  updateAdminCompanyPassword
} = require('../controllers/auth.company.controller');

router.post('/register', registerLocalCompany);
router.post('/login', loginLocalCompany);
router.get('/admin/companies', verifyToken, getAdminCompanies);
router.get('/admin/companies/:companyId/verification', verifyToken, getAdminCompanyVerificationSummary);
router.put('/admin/companies/:companyId/verification', verifyToken, reviewAdminCompanyVerification);
router.get('/admin/company-roles', verifyToken, getAdminCompanyRoles);
router.put('/admin/companies/:companyId/role', verifyToken, updateAdminCompanyRole);
router.put('/admin/companies/:companyId/status', verifyToken, updateAdminCompanyStatus);
router.put('/admin/companies/:companyId/attempts/reset', verifyToken, resetAdminCompanyAttempts);
router.put('/admin/companies/:companyId/password', verifyToken, updateAdminCompanyPassword);
router.get('/me', verifyToken, getCompanyProfile);
router.get('/verification', verifyToken, getCompanyVerificationSummary);
router.post('/verification/documents', verifyToken, uploadCompanyLegalDocuments.array('documents', 10), createCompanyVerificationDocuments);
router.get('/profile', verifyToken, getCompanyProfile);
router.put('/profile', verifyToken, updateCompanyProfile);
router.put('/profile/image', verifyToken, uploadCompanyImage.single('image'), updateCompanyProfileImage);

module.exports = router;