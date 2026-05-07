import { Router } from "express";
import {userController} from "../config/UserDependencyInjection";

const router = Router();

/**
 * @swagger
 * /api/users/register/mother:
 *   post:
 *     summary: Register mother user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               dni:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mother registered successfully
 */
router.post(
    "/register/mother",
    userController.registerMother
);

/**
 * @swagger
 * /api/users/register/staff:
 *   post:
 *     summary: Register staff user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               dni:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: "Admin/Nurse"
 *     responses:
 *       201:
 *         description: Staff user registered successfully
 *       400:
 *         description: Invalid request data
 */
router.post(
    "/register/staff",
    userController.createStaffUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dni:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
    "/login",
    userController.login
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
router.get(
    "/:id",
    userController.getUserById
);

/**
 * @swagger
 * /api/users/password/request-code:
 *   post:
 *     summary: Send password reset code to email
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: diana@gmail.com
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 */
router.post(
    "/password/request-code",
    userController.requestResetCode
);

/**
 * @swagger
 * /api/users/password/reset:
 *   post:
 *     summary: Reset password using verification code
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: diana@gmail.com
 *               code:
 *                 type: string
 *                 example: "4832"
 *               newPassword:
 *                 type: string
 *                 example: Nueva123@
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post(
    "/password/reset",
    userController.resetPassword
);

/**
 * @swagger
 * /api/users/password/verify-code:
 *   post:
 *     summary: Verify password reset code
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "string"
 *               code:
 *                 type: string
 *                 example: "string"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post(
    "/password/verify-code",
    userController.verifyCode
)
export default router;