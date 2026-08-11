const axios = require('axios');

/**
 * Unified AI Client - Evaluates and executes prompts against Gemini, OpenAI, or Anthropic APIs
 */
const callAI = async (systemPrompt, userMessage) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  // 1. Google Gemini API
  if (GEMINI_KEY && GEMINI_KEY !== 'your_gemini_api_key_here' && GEMINI_KEY.trim() !== '') {
    try {
      console.log('[AI Service] Calling Gemini API (gemini-1.5-flash)...');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { text };
      }
    } catch (err) {
      console.error('[AI Service] Gemini API call failed:', err.response?.data || err.message);
    }
  }

  // 2. OpenAI API
  if (OPENAI_KEY && OPENAI_KEY !== 'your_openai_api_key_here' && OPENAI_KEY.trim() !== '') {
    try {
      console.log('[AI Service] Calling OpenAI API (gpt-4o-mini)...');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`
          }
        }
      );
      
      const text = response.data?.choices?.[0]?.message?.content;
      if (text) {
        return { text };
      }
    } catch (err) {
      console.error('[AI Service] OpenAI API call failed:', err.response?.data || err.message);
    }
  }

  // 3. Anthropic API
  if (ANTHROPIC_KEY && ANTHROPIC_KEY !== 'your_anthropic_api_key_here' && ANTHROPIC_KEY.trim() !== '') {
    try {
      console.log('[AI Service] Calling Anthropic API (claude-3-5-sonnet)...');
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
          }
        }
      );
      
      const text = response.data?.content?.[0]?.text;
      if (text) {
        return { text };
      }
    } catch (err) {
      console.error('[AI Service] Anthropic API call failed:', err.response?.data || err.message);
    }
  }

  console.log('[AI Service] No configured API Keys found. Returning Mock AI Response.');
  return { mock: true };
};

module.exports = { callAI };
