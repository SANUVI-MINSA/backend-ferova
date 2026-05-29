import mongoose from "mongoose";
import {FoodItemModel} from "../context/nutration-diary/infrastructure/persistence/mongodb/models/FoodItemSchema";
import { env } from "../shared/infrastructure/config/env";



const foodItems = [
    {
        id: "FOOD_001",
        name: "Sangrecita de pollo",
        nutrientContent: {
            ironMg: 29.5,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_002",
        name: "Bazo de res",
        nutrientContent: {
            ironMg: 14.0,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_003",
        name: "Hígado de pollo",
        nutrientContent: {
            ironMg: 8.5,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_004",
        name: "Hígado de res",
        nutrientContent: {
            ironMg: 6.5,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_005",
        name: "Carne de res",
        nutrientContent: {
            ironMg: 2.7,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_006",
        name: "Pavo",
        nutrientContent: {
            ironMg: 1.8,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_007",
        name: "Huevo entero cocido",
        nutrientContent: {
            ironMg: 1.8,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_008",
        name: "Pollo",
        nutrientContent: {
            ironMg: 1.3,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "MEAT"
    },
    {
        id: "FOOD_009",
        name: "Anchoveta",
        nutrientContent: {
            ironMg: 3.2,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "FISH"
    },
    {
        id: "FOOD_010",
        name: "Sardina en conserva",
        nutrientContent: {
            ironMg: 2.9,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "FISH"
    },
    {
        id: "FOOD_011",
        name: "Atún en conserva",
        nutrientContent: {
            ironMg: 1.9,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "FISH"
    },
    {
        id: "FOOD_012",
        name: "Bonito",
        nutrientContent: {
            ironMg: 1.5,
            ironType: "hemo"
        },
        isInhibitor: false,
        category: "FISH"
    },
    {
        id: "FOOD_013",
        name: "Lentejas cocidas",
        nutrientContent: {
            ironMg: 3.3,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "LEGUME"
    },
    {
        id: "FOOD_014",
        name: "Garbanzos cocidos",
        nutrientContent: {
            ironMg: 2.9,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "LEGUME"
    },
    {
        id: "FOOD_015",
        name: "Pallares cocidos",
        nutrientContent: {
            ironMg: 2.5,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "LEGUME"
    },
    {
        id: "FOOD_016",
        name: "Frijoles cocidos",
        nutrientContent: {
            ironMg: 2.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "LEGUME"
    },
    {
        id: "FOOD_017",
        name: "Arvejas cocidas",
        nutrientContent: {
            ironMg: 1.8,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "LEGUME"
    },
    {
        id: "FOOD_018",
        name: "Espinaca cocida",
        nutrientContent: {
            ironMg: 2.8,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_019",
        name: "Acelga cocida",
        nutrientContent: {
            ironMg: 1.8,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_020",
        name: "Brócoli cocido",
        nutrientContent: {
            ironMg: 0.7,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_021",
        name: "Camote cocido",
        nutrientContent: {
            ironMg: 0.7,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_022",
        name: "Papa cocida",
        nutrientContent: {
            ironMg: 0.5,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_023",
        name: "Zanahoria cocida",
        nutrientContent: {
            ironMg: 0.4,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_024",
        name: "Zapallo cocido",
        nutrientContent: {
            ironMg: 0.4,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "VEGETABLE"
    },
    {
        id: "FOOD_025",
        name: "Kiwicha cocida",
        nutrientContent: {
            ironMg: 3.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "GRAIN"
    },
    {
        id: "FOOD_026",
        name: "Pan de trigo",
        nutrientContent: {
            ironMg: 2.5,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "GRAIN"
    },
    {
        id: "FOOD_027",
        name: "Avena cocida",
        nutrientContent: {
            ironMg: 1.7,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "GRAIN"
    },
    {
        id: "FOOD_028",
        name: "Quinua cocida",
        nutrientContent: {
            ironMg: 1.5,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "GRAIN"
    },
    {
        id: "FOOD_029",
        name: "Arroz cocido",
        nutrientContent: {
            ironMg: 0.2,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "GRAIN"
    },
    {
        id: "FOOD_030",
        name: "Lúcuma",
        nutrientContent: {
            ironMg: 0.4,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_031",
        name: "Plátano",
        nutrientContent: {
            ironMg: 0.3,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_032",
        name: "Naranja",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_033",
        name: "Mandarina",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_034",
        name: "Mango",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_035",
        name: "Papaya",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "FRUIT"
    },
    {
        id: "FOOD_036",
        name: "Queso fresco",
        nutrientContent: {
            ironMg: 0.2,
            ironType: "no-hemo"
        },
        isInhibitor: true,
        category: "DAIRY"
    },
    {
        id: "FOOD_037",
        name: "Leche de vaca",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: true,
        category: "DAIRY"
    },
    {
        id: "FOOD_038",
        name: "Yogur",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: true,
        category: "DAIRY"
    },
    {
        id: "FOOD_039",
        name: "Té",
        nutrientContent: {
            ironMg: 0.0,
            ironType: "no-hemo"
        },
        isInhibitor: true,
        category: "BEVERAGE"
    },
    {
        id: "FOOD_040",
        name: "Café",
        nutrientContent: {
            ironMg: 0.0,
            ironType: "no-hemo"
        },
        isInhibitor: true,
        category: "BEVERAGE"
    },
    {
        id: "FOOD_041",
        name: "Jugo de naranja",
        nutrientContent: {
            ironMg: 0.1,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "BEVERAGE"
    },
    {
        id: "FOOD_042",
        name: "Agua",
        nutrientContent: {
            ironMg: 0.0,
            ironType: "no-hemo"
        },
        isInhibitor: false,
        category: "BEVERAGE"
    }
];

async function seedFoodItems() {
    try {
        // No puede ponerlo con el envirotment no lo reconocia pero ya esta aca en si
        await mongoose.connect(env.mongoUri);
        console.log("Connected to MongoDB");

        const existingCount = await FoodItemModel.countDocuments();

        if (existingCount > 0) {
            console.log("Food items already seeded. Found:", existingCount);
            await mongoose.disconnect();
            process.exit(0);
        }

        await FoodItemModel.insertMany(foodItems);
        console.log(`Food items seeded successfully. Inserted: ${foodItems.length} items`);

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("Seed error:", error);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
}

seedFoodItems();