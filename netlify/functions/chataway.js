// If using Node.js 18+, you can use the built-in fetch
// Otherwise, ensure node-fetch is installed and uncomment the line below
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Define the allowed origins
    const allowedOrigins = ['https://jiglo.ca', 'https://www.jiglo.ca'];
  
    const origin = event.headers.origin;
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  
    // Check if the request origin is in the allowed origins
    if (allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  
    // Handle CORS preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }
  
    // Ensure the request is a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          ...headers,
          'Allow': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }
  
    try {
      // Check if event.body is present
      if (!event.body) {
        throw new Error('Request body is missing');
      }
  
      const { message } = JSON.parse(event.body);
  
      // Check if message is provided
      if (!message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' }),
        };
      }
  
      // Call the OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: message }],
        }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorDetails}`);
      }
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
  