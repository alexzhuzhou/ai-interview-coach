const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY environment variable is not set' });
  }

  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    // Call Tavus API to end the conversation
    const response = await fetch(`${TAVUS_BASE_URL}/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to end conversation:', errorText);
      return res.status(response.status).json({
        error: `Failed to end conversation: ${errorText.substring(0, 100)}`,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error ending conversation:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
