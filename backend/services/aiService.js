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

    // Helper to sanitize data (handle null strings from DB)
    const sanitize = (val) => {
        if (!val || val === 'null' || val === 'undefined') return null;
        return val;
    };

    // Prioritize product-specific content over mock category data
    const data = {
        benefits: sanitize(product.health_benefits) || categoryData.benefits,
        nutrients: sanitize(product.nutrition_info) || categoryData.nutrients,
        intake: sanitize(product.recommended_intake) || categoryData.intake,
        notes: sanitize(product.ai_context_notes)
    };

    const q = question.toLowerCase();
    
    if (q.includes('benefit') || q.includes('good for') || q.includes('help') || q.includes('why')) {
        let resp = `As an expert at DryFruit Hub, I can confirm that ${product.name} is exceptional for your health. ${data.benefits}`;
        if (data.notes) resp += `\n\nNote: ${data.notes}`;
        return resp;
    } else if (q.includes('nutrient') || q.includes('value') || q.includes('protein') || q.includes('calories') || q.includes('fat')) {
        return `Here is the nutritional profile for our premium ${product.name}: ${data.nutrients}`;
    } else if (q.includes('how many') || q.includes('daily') || q.includes('intake') || q.includes('much') || q.includes('eat')) {
        return `For optimal results, the recommended daily intake for ${product.name} is: ${data.intake}`;
    } else if (q.includes('storage') || q.includes('keep') || q.includes('fresh')) {
        return `To keep your ${product.name} fresh, store them in an airtight container in a cool, dry place. Refrigeration can extend shelf life up to 6 months!`;
    } else {
        return `I am specifically here to help with nutritional advice for ${product.name}. You can ask me about its health benefits, nutritional value, recommended daily intake, or storage tips.`;
    }
};

/**
 * General Nutritional Advisor
 */
export const getGeneralAIResponse = async (question, products = []) => {
    if (openai) {
        try {
            // Create a concise list of products for the AI context
            const productContext = products.map(p => 
                `- ${p.name} (Price: ₹${p.price}, Benefits: ${p.health_benefits || p.description})`
            ).join('\n');

            const systemPrompt = `
                You are the Chief Nutritionist at "DryFruit Hub".
                Your goal is to provide expert advice on dry fruits and healthy snacking.
                
                AVAILABLE PRODUCTS IN OUR STORE:
                ${productContext}

                RULES:
                1. Provide science-backed nutritional insights.
                2. ALWAYS recommend specific products from the list above when relevant to the user's goal (e.g., "Weight loss", "Heart Health").
                3. Use the product names exactly as listed.
                4. If asked about a medical condition, provide nutritional info but add a disclaimer to consult a doctor.
                5. Refuse topics unrelated to health, nutrition, or dry fruits.
                6. Use a warm, premium, and helpful tone.
                7. You can use Markdown for better formatting.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI General Error, falling back to Mock:', error.message);
        }
    }

    // Mock Fallback for General Queries - Now Product Aware!
    const q = question.toLowerCase();
    
    // Find products that match keywords in the user's question
    const findProducts = (keywords) => {
        return products.filter(p => {
            const content = `${p.name} ${p.health_benefits} ${p.description} ${p.category_name}`.toLowerCase();
            return keywords.some(k => content.includes(k));
        });
    };

    let response = "";

    if (q.includes('weight') || q.includes('fat') || q.includes('slim')) {
        const matches = findProducts(['weight', 'fat', 'diet', 'metabolism', 'almond', 'pistachio']);
        response = "For weight management, high-protein and high-fiber options are best. ";
        if (matches.length > 0) {
            response += `I recommend our ${matches.slice(0, 2).map(p => p.name).join(' and ')}. `;
        }
        response += "These help keep you full longer and support a healthy metabolism.";
    } else if (q.includes('heart') || q.includes('cholesterol') || q.includes('cardio')) {
        const matches = findProducts(['heart', 'cholesterol', 'omega', 'walnut', 'almond']);
        response = "For heart health, look for healthy fats and Omega-3s. ";
        if (matches.length > 0) {
            response += `Our ${matches.slice(0, 2).map(p => p.name).join(' and ')} are excellent choices for maintaining healthy cholesterol levels.`;
        }
    } else if (q.includes('skin') || q.includes('glow') || q.includes('hair')) {
        const matches = findProducts(['skin', 'hair', 'vitamin e', 'collagen', 'almond', 'cashew']);
        response = "For radiant skin and strong hair, Vitamin E and Zinc are essential. ";
        if (matches.length > 0) {
            response += `I highly suggest ${matches.slice(0, 2).map(p => p.name).join(' and ')} for your daily routine.`;
        }
    } else if (q.includes('energy') || q.includes('tired') || q.includes('active')) {
        const matches = findProducts(['energy', 'sugar', 'dates', 'raisins', 'natural fuel']);
        response = "Need an energy boost? Natural sugars and healthy minerals are key. ";
        if (matches.length > 0) {
            response += `Our ${matches.slice(0, 2).map(p => p.name).join(' and ')} are the perfect natural fuel for an active lifestyle.`;
        }
    } else if (q.includes('brain') || q.includes('memory') || q.includes('focus')) {
        const matches = findProducts(['brain', 'memory', 'focus', 'walnut', 'omega']);
        response = "Cognitive health benefits greatly from Omega-3 fatty acids and antioxidants. ";
        if (matches.length > 0) {
            response += `You should try our ${matches.slice(0, 2).map(p => p.name).join(' and ')} to support brain function.`;
        }
    } else if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
        response = "Hello! I am your DryFruit Hub AI Nutritionist. I have analyzed all our products and I'm ready to help you find the best ones for your health goals. Ask me about weight loss, heart health, or any specific fruit!";
    } else if (q.includes('list') || q.includes('what') || q.includes('products') || q.includes('have')) {
        if (products.length > 0) {
            response = `We have a fantastic range of premium dry fruits including ${products.slice(0, 5).map(p => p.name).join(', ')}, and more! Which health goal can I help you with?`;
        } else {
            response = "We have many premium nuts and dry fruits available. Are you looking for something specific like Almonds, Cashews, or Dates?";
        }
    } else {
        response = "That's an interesting question! Based on the premium products we have in stock, I can recommend the best mix for your needs. Are you focusing on energy, heart health, or perhaps weight management?";
    }

    return response;
};
