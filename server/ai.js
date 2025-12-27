const express = require('express');
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const router = express.Router();

// Initialize Chat Model (Requires OPENAI_API_KEY in .env)
const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
});

router.post('/recommend', async (req, res) => {
    try {
        const { products, userHistory } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                message: "AI service unavailable (Missing API Key)",
                recommendation: "Try our Sourdough Bread! (Default Recommendation)"
            });
        }

        const systemMsg = new SystemMessage(
            "You are a helpful neighborhood shopping assistant. Recommend a product from the available list based on the user's history and preferences. Be brief and friendly."
        );

        const prompt = `
        Available Products: ${JSON.stringify(products.map(p => p.name + ": " + p.description))}
        User Past Purchases: ${JSON.stringify(userHistory || [])}
        
        Which product should they try next and why?
        `;

        const response = await chat.invoke([
            systemMsg,
            new HumanMessage(prompt),
        ]);

        res.json({ recommendation: response.content });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate recommendation" });
    }
});

module.exports = router;
