const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateLanguage,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                     theme:
 *                       type: string
 *                     language:
 *                       type: string
 *                     notifications:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/profile", getUserProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               preferences:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                   theme:
 *                     type: string
 *                     enum: [light, dark]
 *                   notifications:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/profile", updateUserProfile);

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Update user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/password", updatePassword);

/**
 * @swagger
 * /api/user/language:
 *   put:
 *     summary: Update user language preference
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *             properties:
 *               language:
 *                 type: string
 *                 description: Preferred language code (e.g., 'en', 'fr', 'kk')
 *     responses:
 *       200:
 *         description: Language preference updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 language:
 *                   type: string
 *       400:
 *         description: Invalid language code
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/language", updateLanguage);

module.exports = router;
