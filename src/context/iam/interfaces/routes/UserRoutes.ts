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
 *                 example: Carlos
 *               lastname:
 *                 type: string
 *                 example: Perez
 *               dni:
 *                 type: string
 *                 example: "87654321"
 *               email:
 *                 type: string
 *                 example: vitalybaca92@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+51 912345678"
 *               password:
 *                 type: string
 *                 example: Admin123@
 *               role:
 *                 type: string
 *                 enum:
 *                   - Nurse
 *                   - Admin
 *                 example: Nurse
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

export default router;