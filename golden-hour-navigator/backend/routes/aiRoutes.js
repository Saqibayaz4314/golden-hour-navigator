const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/triage', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(503).json({ 
      message: 'Grok API Key not configured. Simulation mode active. Check backend/.env' 
    });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages: [
          {
            role: "system",
            content: "You are the Golden Hour Navigator AI Triage Assistant. You provide very short, concise, step-by-step first-aid and triage advice to ambulance drivers who are currently en route to the hospital. Keep responses under 4 sentences. Focus on immediate stabilization."
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama3-8b-8192",
        stream: false,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ message: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Grok API Error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Error communicating with Grok API.' });
  }
});

module.exports = router;
