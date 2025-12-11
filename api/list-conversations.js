// Vercel serverless function
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY environment variable is not set' });
  }

  try {
    const response = await fetch(`${TAVUS_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'x-api-key': TAVUS_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list conversations:', {
        status: response.status,
        statusText: response.statusText,
        error,
      });
      return res.status(response.status).json({
        error: 'Failed to fetch conversations',
        details: error,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
