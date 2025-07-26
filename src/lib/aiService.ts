// src/lib/aiService.ts
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// You can choose different models (e.g., 'gemini-pro', 'gemini-1.5-flash-latest')
// 'gemini-pro' is generally good for text-only generation.
// For more complex/multimodal, consider 'gemini-1.5-flash-latest' but be mindful of costs.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
  suitableFor?: string[]; // e.g., "vegan", "keto", "athletes"
  betterAlternatives?: string[];
  goodMixUps?: string[];
  sources?: string[]; // Optional: if AI can cite specific sources
}

export async function getFoodAIInsights(foodName: string): Promise<FoodAnalysisResult> {
  const prompt = `Provide a comprehensive analysis of "${foodName}". Include:
- Pros (benefits)
- Cons (potential downsides, if any)
- General health benefits
- Specific impact on human organs (e.g., heart, liver, kidneys, brain, digestive system, skin, bones)
- Best cooking methods and eating approaches
- Who is it suitable for (e.g., specific diets, health conditions - but provide disclaimers for medical advice)
- Good food mix-ups/pairings
- Better alternatives (healthier or for specific dietary needs)

Format the response as a JSON object, adhering strictly to the following TypeScript interface. If a field is not applicable or you cannot provide enough information, you can leave its array empty or omit the field if it's optional. Ensure all values are strings for array elements.

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

Example JSON structure for "apple":
{
  "pros": ["Rich in fiber", "Contains antioxidants"],
  "cons": ["Can cause bloating in some individuals"],
  "healthBenefits": {
    "general": ["Aids digestion", "Boosts immunity"],
    "organImpact": {
      "heart": ["Reduces cholesterol"],
      "digestive system": ["Supports gut health"]
    }
  },
  "cookingTips": ["Eat raw for maximum nutrients", "Bake into pies"],
  "suitableFor": ["Weight management", "Diabetics (in moderation)"],
  "betterAlternatives": ["Pear", "Berries"],
  "goodMixUps": ["Peanut butter", "Cinnamon"],
  "sources": ["Healthline.com", "USDA FoodData Central"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON. Gemini can sometimes include markdown
    // or explanatory text around the JSON.
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : text;

    // Clean up common issues if not wrapped in markdown
    jsonString = jsonString.replace(/^(```json|```)\s*|\s*(```)$/g, '').trim();

    // Basic validation for JSON
    if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
        console.warn("AI response not perfectly structured JSON, attempting to fix:", jsonString);
        // Fallback for malformed JSON: try to extract objects
        const potentialObjects = jsonString.split(/(?<!\\)(?<!["])\}\s*,\s*\{(?!["])(?!\\)/g);
        if (potentialObjects.length > 1) {
            // If it split into multiple objects, try to pick the first valid one or combine
            try {
                return JSON.parse(potentialObjects[0] + '}');
            } catch (e) {
                // Fallback to trying the whole string if splitting failed
                console.error("Failed to parse split JSON parts:", e);
            }
        }
    }


    // Further clean up: remove any leading/trailing non-JSON characters
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    } else {
         console.error("Could not find valid JSON structure in AI response:", text);
         // Return a default empty structure or throw an error
         return {
            pros: [],
            cons: [],
            healthBenefits: { general: [] },
            cookingTips: [],
            suitableFor: [],
            betterAlternatives: [],
            goodMixUps: [],
            sources: []
        };
    }


    const parsedResult: FoodAnalysisResult = JSON.parse(jsonString);
    return parsedResult;
  } catch (error) {
    console.error("Error generating AI insights for", foodName, ":", error);
    // Return a default empty structure or re-throw
    return {
      pros: [],
      cons: [],
      healthBenefits: { general: [] },
      cookingTips: [],
      suitableFor: [],
      betterAlternatives: [],
      goodMixUps: [],
      sources: []
    };
  }
}