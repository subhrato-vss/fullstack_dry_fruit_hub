import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Expert Data for Mock Fallback
 * Provides detailed, category-specific nutritional data.
 */
const MOCK_DATA = {
    'Almonds': {
        benefits: 'Rich in vitamin E, magnesium, and fiber. Supports heart health and brain function.',
        nutrients: 'Energy: 579 kcal, Protein: 21g, Healthy Fats: 49g per 100g.',
        intake: 'Recommended 20-23 almonds per day (about one ounce).'
    },
    'Cashews': {
        benefits: 'Good source of copper, magnesium, and manganese. Important for energy production and bone health.',
        nutrients: 'Energy: 553 kcal, Protein: 18g, Iron: 6.7mg per 100g.',
        intake: 'Recommended 15-18 cashews per day.'
    },
    'Walnuts': {
        benefits: 'High in Omega-3 fatty acids (ALA). Excellent for reducing inflammation and brain health.',
        nutrients: 'Energy: 654 kcal, Protein: 15g, Omega-3: 9g per 100g.',
        intake: 'Recommended 7-10 whole walnut kernels per day.'
    },
    'Pistachios': {
        benefits: 'High in antioxidants like lutein and zeaxanthin. Great for eye health and blood sugar control.',
        nutrients: 'Energy: 562 kcal, Protein: 20g, Potassium: 1025mg per 100g.',
        intake: 'Recommended 30-45 pistachios (approx 28g) per day.'
    },
    'Dates': {
        benefits: 'Natural energy booster. High in fiber and various antioxidants. Traditionally used for digestion.',
        nutrients: 'Energy: 282 kcal, Carbohydrates: 75g (Natural Sugars), Fiber: 7g per 100g.',
        intake: 'Recommended 2-3 Medjool dates or 5-7 smaller dates per day.'
    }
};

/**
 * Contextual AI Response Generator
 */
export const getProductAIResponse = async (product, question) => {
    // 1. Check for Real AI
    if (openai) {
        try {
            const systemPrompt = `
                You are a Senior Nutritionist and Dry Fruit Expert at "DryFruit Hub".
                You are providing advice specifically about ${product.name} (Category: ${product.category_name}).
                
                Product Description: ${product.description}
                ${product.health_benefits ? `Health Benefits: ${product.health_benefits}` : ''}
                ${product.nutrition_info ? `Nutritional Info: ${product.nutrition_info}` : ''}
                ${product.recommended_intake ? `Recommended Daily Intake: ${product.recommended_intake}` : ''}
                ${product.ai_context_notes ? `Additional Context: ${product.ai_context_notes}` : ''}
                
                RULES:
                1. ONLY answer questions related to this product, its health benefits, nutrition, or intake.
                2. If the question is unrelated to dry fruits or this specific product, politely decline.
                3. Keep answers concise, premium, and science-backed.
                4. Use bullet points for readability.
                5. If specific nutritional info is provided above, use it; otherwise, provide general expert advice for ${product.category_name}.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.7,
                max_tokens: 300
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Error, falling back to Mock:', error.message);
        }
    }

    // 2. Mock Fallback Logic
    console.log('🤖 Mock AI Active for:', product.name);
    
    // Find matching category data or use a generic "Dry Fruit" response
    const categoryData = MOCK_DATA[product.category_name] || {
        benefits: 'High in protein and healthy minerals.',
        nutrients: 'Balanced mix of energy and fiber.',
        intake: 'Moderate consumption (30g) daily.'
    };

    // Prioritize product-specific content over mock category data
    const data = {
        benefits: product.health_benefits || categoryData.benefits,
        nutrients: product.nutrition_info || categoryData.nutrients,
        intake: product.recommended_intake || categoryData.intake
    };

    const q = question.toLowerCase();
    if (q.includes('benefit') || q.includes('good for') || q.includes('help')) {
        return `As an expert at DryFruit Hub, I can confirm that ${product.name} is exceptional for your health. ${data.benefits}`;
    } else if (q.includes('nutrient') || q.includes('value') || q.includes('protein') || q.includes('calories')) {
        return `Here is the nutritional profile for our premium ${product.name}: ${data.nutrients}`;
    } else if (q.includes('how many') || q.includes('daily') || q.includes('intake') || q.includes('much')) {
        return `For optimal results, the recommended daily intake for ${product.name} is: ${data.intake}`;
    } else {
        return `I am specifically here to help with nutritional advice for ${product.name}. You can ask me about its health benefits, nutritional value, or recommended daily intake.`;
    }
};

/**
 * General Nutritional Advisor
 */
export const getGeneralAIResponse = async (question) => {
    if (openai) {
        try {
            const systemPrompt = `
                You are the Chief Nutritionist at "DryFruit Hub".
                Your goal is to provide expert advice on dry fruits, nuts, seeds, and healthy snacking.
                
                RULES:
                1. Provide science-backed nutritional insights.
                2. Recommend specific products (Almonds, Cashews, Walnuts, Pistachios, Dates) for different health goals (e.g., "Weight loss", "Heart Health").
                3. If asked about a medical condition, provide nutritional info but add a disclaimer to consult a doctor.
                4. Refuse topics unrelated to health, nutrition, or dry fruits.
                5. Use a warm, premium, and helpful tone.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.7,
                max_tokens: 400
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI General Error, falling back to Mock:', error.message);
        }
    }

    // Mock Fallback for General Queries
    const q = question.toLowerCase();
    
    if (q.includes('weight') || q.includes('fat') || q.includes('slim')) {
        return "For weight management, I highly recommend our premium Almonds and Pistachios. They are high in protein and fiber, which helps keep you feel full longer. Almonds also contain healthy monounsaturated fats that support metabolism.";
    } else if (q.includes('heart') || q.includes('cholesterol') || q.includes('cardio')) {
        return "Walnuts are the gold standard for heart health as they are exceptionally high in Omega-3 fatty acids. Almonds also help lower LDL (bad) cholesterol levels. Combine them for a heart-healthy mix!";
    } else if (q.includes('skin') || q.includes('glow') || q.includes('hair')) {
        return "For radiant skin and strong hair, make Almonds and Cashews your best friends. Almonds are loaded with Vitamin E (a powerful antioxidant), and Cashews provide Copper and Zinc essential for collagen production.";
    } else if (q.includes('energy') || q.includes('tired') || q.includes('active')) {
        return "Need a natural boost? Dates are the perfect energy food! They provide natural sugars for instant fuel and fiber for a sustained release. Cashews also provide magnesium to help fight fatigue.";
    } else if (q.includes('brain') || q.includes('memory') || q.includes('focus')) {
        return "Walnuts are literally shaped like brains for a reason! They are rich in ALA (Omega-3), which is crucial for cognitive function and memory. Almonds also support brain health with L-carnitine and riboflavin.";
    } else if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
        return "Hello! I am your DryFruit Hub Nutritionist. How can I help you achieve your health goals today? You can ask me about weight loss, heart health, or the benefits of any dry fruit!";
    } else {
        return "That's an interesting question! At DryFruit Hub, we focus on the nutritional power of nuts and dried fruits. I can help you find the best choices for your specific health goals like heart health, energy, or skin glow. What are you looking to achieve?";
    }
};
