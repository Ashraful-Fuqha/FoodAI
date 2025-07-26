// src/lib/nutritionApi.ts (if using Nutritionix)
interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

interface NutritionFacts {
  calories: number;
  protein: Nutrient;
  fat: Nutrient;
  carbohydrates: Nutrient;
  fiber?: Nutrient;
  sugar?: Nutrient;
  sodium?: Nutrient;
  cholesterol?: Nutrient;
}

export async function getNutritionFacts(foodName: string): Promise<NutritionFacts | null> {
  const appId = process.env.NUTRITIONIX_APP_ID;
  const appKey = process.env.NUTRITIONIX_APP_KEY;

  if (!appId || !appKey) {
    console.error("Nutritionix API keys are not set.");
    return null;
  }

  const queryUrl = "https://trackapi.nutritionix.com/v2/natural/nutrients";

  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': appId,
        'x-app-key': appKey,
      },
      body: JSON.stringify({ query: foodName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Nutritionix API error for "${foodName}": ${response.status} ${response.statusText} - ${errorText}`);
      return null;
    }

    const data = await response.json();

    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0]; // Take the first result

      return {
        calories: food.nf_calories || 0,
        protein: { label: "Protein", quantity: food.nf_protein || 0, unit: "g" },
        fat: { label: "Fat", quantity: food.nf_total_fat || 0, unit: "g" },
        carbohydrates: { label: "Carbohydrates", quantity: food.nf_total_carbohydrate || 0, unit: "g" },
        fiber: food.nf_dietary_fiber ? { label: "Fiber", quantity: food.nf_dietary_fiber, unit: "g" } : undefined,
        sugar: food.nf_sugars ? { label: "Sugar", quantity: food.nf_sugars, unit: "g" } : undefined,
        sodium: food.nf_sodium ? { label: "Sodium", quantity: food.nf_sodium, unit: "mg" } : undefined,
        cholesterol: food.nf_cholesterol ? { label: "Cholesterol", quantity: food.nf_cholesterol, unit: "mg" } : undefined,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching nutrition facts for", foodName, ":", error);
    return null;
  }
}