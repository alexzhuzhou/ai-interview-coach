// Vercel serverless function for deleting documents from Tavus Knowledge Base
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  }

  try {
    // Get document_id from query parameter
    const { document_id } = req.query;

    console.log('Delete document request:', { document_id });

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' });
    }

    // Delete document from Tavus Knowledge Base (document_id is the uuid from Tavus)
    console.log('Deleting document from Tavus:', `${TAVUS_BASE_URL}/documents/${document_id}`);
    const response = await fetch(`${TAVUS_BASE_URL}/documents/${document_id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': TAVUS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete document:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return res.status(response.status).json({
        error: 'Failed to delete document from Tavus',
        details: errorText,
      });
    }

    return res.status(200).json({ success: true, document_id });

  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
