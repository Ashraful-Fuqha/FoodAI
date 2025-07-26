// src/app/food/[foodName]/page.tsx
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

// Import your services
import { getFoodAIInsights } from '@/lib/aiService';
import { getNutritionFacts } from '@/lib/nutritionApi';
import prisma from '@/lib/db';

// Define the correct PageProps interface for dynamic routes
interface FoodDetailPageProps {
  params: {
    foodName: string; // Your dynamic segment
  };
  // Next.js also passes searchParams, even if not used.
  // It's good practice to include it in the PageProps type.
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface FoodAnalysisResult {
  pros: string[];
  cons: string[];
  healthBenefits: {
    general: string[];
    organImpact?: {
      [organ: string]: string[];
    };
  };
  cookingTips?: string[];
  suitableFor?: string[];
  betterAlternatives?: string[];
  goodMixUps?: string[];
  sources?: string[];
}

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
  vitamins?: { [key: string]: Nutrient };
  minerals?: { [key: string]: Nutrient };
}

async function saveSearchHistory(userId: string, foodName: string) {
  const MAX_HISTORY_ENTRIES = 10; // Define the limit

  try {
    // 1. Get current history count for the user
    const historyCount = await prisma.searchHistory.count({
      where: { userId: userId },
    });

    // 2. If count exceeds limit, delete the oldest entries
    if (historyCount >= MAX_HISTORY_ENTRIES) {
      const oldestEntries = await prisma.searchHistory.findMany({
        where: { userId: userId },
        orderBy: { searchAt: 'asc' }, // Order by oldest first
        take: historyCount - MAX_HISTORY_ENTRIES + 1, // Calculate how many to delete
      });

      if (oldestEntries.length > 0) {
        const idsToDelete = oldestEntries.map(entry => entry.id);
        await prisma.searchHistory.deleteMany({
          where: {
            id: { in: idsToDelete },
          },
        });
        console.log(`Deleted ${idsToDelete.length} oldest history entries for user ${userId}.`);
      }
    }

    // 3. Create the new search history entry
    await prisma.searchHistory.create({
      data: {
        userId: userId,
        foodName: foodName,
      },
    });
    console.log(`Saved new history entry for user ${userId}: ${foodName}`);
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

// Use the newly defined FoodDetailPageProps interface
export default async function FoodDetailPage({
  params,
}: FoodDetailPageProps) { // Changed the type annotation here
  const { foodName } = params;
  if (!foodName) {
    notFound();
  }
  const decodedFoodName = decodeURIComponent(foodName);
  const session = await auth();

  const [aiInsights, nutritionFacts] = await Promise.all([
    getFoodAIInsights(decodedFoodName),
    getNutritionFacts(decodedFoodName),
  ]);

  if (!nutritionFacts && !aiInsights) {
    notFound();
  }

  if (session?.user?.id && decodedFoodName) {
    await saveSearchHistory(session.user.id, decodedFoodName);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950 transition-colors duration-300"> {/* Base background for page */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300"> {/* Main content card */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 capitalize dark:text-gray-50">
          {decodedFoodName}
        </h1>

        {nutritionFacts && (
          <section className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner dark:bg-blue-950 dark:text-blue-100 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 dark:text-blue-200">Nutritional Facts (per 100g)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-200">
              <p className="text-lg font-semibold">Calories: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.calories.toFixed(0)} kcal</span></p>
              <p className="text-lg font-semibold">Protein: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.protein.quantity.toFixed(1)}{nutritionFacts.protein.unit}</span></p>
              <p className="text-lg font-semibold">Fat: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.fat.quantity.toFixed(1)}{nutritionFacts.fat.unit}</span></p>
              <p className="text-lg font-semibold">Carbohydrates: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.carbohydrates.quantity.toFixed(1)}{nutritionFacts.carbohydrates.unit}</span></p>
              {nutritionFacts.fiber && <p className="text-lg font-semibold">Fiber: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.fiber.quantity.toFixed(1)}{nutritionFacts.fiber.unit}</span></p>}
              {nutritionFacts.sugar && <p className="text-lg font-semibold">Sugar: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.sugar.quantity.toFixed(1)}{nutritionFacts.sugar.unit}</span></p>}
              {nutritionFacts.sodium && <p className="text-lg font-semibold">Sodium: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.sodium.quantity.toFixed(1)}{nutritionFacts.sodium.unit}</span></p>}
              {nutritionFacts.cholesterol && <p className="text-lg font-semibold">Cholesterol: <span className="text-blue-600 dark:text-blue-400">{nutritionFacts.cholesterol.quantity.toFixed(1)}{nutritionFacts.cholesterol.unit}</span></p>}
            </div>
          </section>
        )}

        {aiInsights && (
          <section className="space-y-8">
            {aiInsights.pros && aiInsights.pros.length > 0 && (
              <div className="bg-green-50 p-6 rounded-lg shadow-inner dark:bg-green-950 dark:text-green-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-green-700 mb-4 dark:text-green-200">Pros</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.pros.map((item, i) => (
                    <li key={`pro-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.cons && aiInsights.cons.length > 0 && (
              <div className="bg-red-50 p-6 rounded-lg shadow-inner dark:bg-red-950 dark:text-red-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-red-700 mb-4 dark:text-red-200">Cons</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.cons.map((item, i) => (
                    <li key={`con-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.healthBenefits && aiInsights.healthBenefits.general.length > 0 && (
              <div className="bg-purple-50 p-6 rounded-lg shadow-inner dark:bg-purple-950 dark:text-purple-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 dark:text-purple-200">General Health Benefits</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.healthBenefits.general.map((item, i) => (
                    <li key={`gen-benefit-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.healthBenefits?.organImpact && Object.keys(aiInsights.healthBenefits.organImpact).length > 0 && (
              <div className="bg-orange-50 p-6 rounded-lg shadow-inner dark:bg-orange-950 dark:text-orange-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-orange-700 mb-4 dark:text-orange-200">Organ-Specific Impact</h2>
                {Object.entries(aiInsights.healthBenefits.organImpact).map(([organ, impacts], i) => (
                  <div key={`organ-${i}`} className="mb-3">
                    <h3 className="text-xl font-semibold text-orange-600 capitalize dark:text-orange-300">{organ}:</h3>
                    <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 dark:text-gray-200">
                      {impacts.map((impact, j) => (
                        <li key={`organ-${i}-impact-${j}`}>{impact}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {aiInsights.cookingTips && aiInsights.cookingTips.length > 0 && (
              <div className="bg-yellow-50 p-6 rounded-lg shadow-inner dark:bg-yellow-950 dark:text-yellow-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-yellow-700 mb-4 dark:text-yellow-200">Cooking Tips & Eating Approaches</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.cookingTips.map((item, i) => (
                    <li key={`cook-tip-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.goodMixUps && aiInsights.goodMixUps.length > 0 && (
              <div className="bg-pink-50 p-6 rounded-lg shadow-inner dark:bg-pink-950 dark:text-pink-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-pink-700 mb-4 dark:text-pink-200">Good Mix-ups / Pairings</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.goodMixUps.map((item, i) => (
                    <li key={`mixup-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.betterAlternatives && aiInsights.betterAlternatives.length > 0 && (
              <div className="bg-teal-50 p-6 rounded-lg shadow-inner dark:bg-teal-950 dark:text-teal-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-teal-700 mb-4 dark:text-teal-200">Better Alternatives</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.betterAlternatives.map((item, i) => (
                    <li key={`alt-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.suitableFor && aiInsights.suitableFor.length > 0 && (
              <div className="bg-indigo-50 p-6 rounded-lg shadow-inner dark:bg-indigo-950 dark:text-indigo-100 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4 dark:text-indigo-200">Suitable For</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 dark:text-gray-200">
                  {aiInsights.suitableFor.map((item, i) => (
                    <li key={`suitable-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.sources && aiInsights.sources.length > 0 && (
              <div className="bg-gray-100 p-6 rounded-lg shadow-inner mt-8 dark:bg-gray-700 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-200">Sources (AI Acknowledgment)</h2>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 dark:text-gray-300">
                  {aiInsights.sources.map((item, i) => (
                    <li key={`source-${i}`}>{item}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                  *Note: AI-generated insights are based on publicly available information and should not be considered medical advice. Consult with a healthcare professional for personalized guidance.
                </p>
              </div>
            )}
          </section>
        )}

        {!nutritionFacts && aiInsights && (
            <p className="text-lg text-gray-600 mt-4 dark:text-gray-300">Could not retrieve detailed nutritional facts, but here are AI insights for {decodedFoodName}.</p>
        )}
         {nutritionFacts && !aiInsights && (
            <p className="text-lg text-gray-600 mt-4 dark:text-gray-300">Could not retrieve AI insights, but here are detailed nutritional facts for {decodedFoodName}.</p>
        )}
        {!nutritionFacts && !aiInsights && (
            <p className="text-lg text-gray-600 mt-4 dark:text-gray-300">No information found for {decodedFoodName}.</p>
        )}

      </div>
    </div>
  );
}
