// Vercel serverless function for uploading documents to Tavus Knowledge Base
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  }

  try {
    const { documentUrl, documentName, tags } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ error: 'documentUrl is required' });
    }

    if (!documentName) {
      return res.status(400).json({ error: 'documentName is required' });
    }

    // Create document in Tavus Knowledge Base using JSON format
    const requestBody = {
      document_url: documentUrl,
      document_name: documentName,
    };

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      requestBody.tags = tags;
    }

    const uploadResponse = await fetch(`${TAVUS_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Tavus upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText,
      });
      return res.status(uploadResponse.status).json({
        error: 'Failed to upload document to Tavus',
        details: errorText,
      });
    }

    const document = await uploadResponse.json();
    console.log('Tavus upload response:', JSON.stringify(document, null, 2));

    const documentId = document.uuid || document.document_id || document.id;

    if (!documentId) {
      console.error('No document ID found in Tavus response!');
      return res.status(500).json({
        error: 'Failed to get document ID from Tavus',
        details: 'Response missing uuid/document_id/id field',
      });
    }

    const response = {
      document_id: documentId,
      document_name: document.document_name,
      status: document.status || 'processing',
    };

    console.log('Returning to frontend:', JSON.stringify(response, null, 2));

    return res.status(200).json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
