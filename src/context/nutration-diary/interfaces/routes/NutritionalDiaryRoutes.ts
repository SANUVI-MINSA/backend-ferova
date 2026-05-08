import {Router} from "express";
import {nutritionalDiaryController} from "../dependencies/NutritionDependecies";


const router = Router();

/**
 * @swagger
 * /api/nutritional-diary/food-entry:
 *   post:
 *     summary: Register food consumed by a mother
 *     tags:
 *       - Nutritional Diary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - motherId
 *               - foodItemId
 *               - quantity
 *             properties:
 *               patientId:
 *                 type: string
 *               motherId:
 *                 type: string
 *               foodItemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Food registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
    "/food-entry",
    nutritionalDiaryController
        .registerFoodEntry
);

/**
 * @swagger
 * /api/nutritional-diary/today/{patientId}:
 *   get:
 *     summary: Get today's nutritional diary
 *     tags:
 *       - Nutritional Diary
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Today's diary retrieved successfully
 *       404:
 *         description: Diary not found
 */
router.get(
    "/today/:patientId",
    nutritionalDiaryController
        .getTodayDiary
);

/**
 * @swagger
 * /api/nutritional-diary/foods/category/{category}:
 *   get:
 *     summary: Get food items by category
 *     tags:
 *       - Nutritional Diary
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food list retrieved successfully
 */
router.get(
    "/foods/category/:category",
    nutritionalDiaryController
        .getFoodsByCategory
);

/**
 * @swagger
 * /api/nutritional-diary/foods/search:
 *   get:
 *     summary: Search food items by name
 *     tags:
 *       - Nutritional Diary
 *     parameters:
 *       - in: query
 *         name: text
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get(
    "/foods/search",
    nutritionalDiaryController
        .searchFoods
);

/**
 * @swagger
 * /api/nutritional-diary/foods/{foodItemId}:
 *   get:
 *     summary: Get food item details
 *     tags:
 *       - Nutritional Diary
 *     parameters:
 *       - in: path
 *         name: foodItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food details retrieved successfully
 *       404:
 *         description: Food item not found
 */
router.get(
    "/foods/:foodItemId",
    nutritionalDiaryController
        .getFoodDetails
);


/**
 * @swagger
 * /api/nutritional-diary/history/{patientId}:
 *   get:
 *     summary: Get nutritional history of a patient
 *     tags:
 *       - Nutritional Diary
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutritional history retrieved successfully
 */
router.get(
    "/history/:patientId",
    nutritionalDiaryController
        .getNutritionalHistory
);


export default router;