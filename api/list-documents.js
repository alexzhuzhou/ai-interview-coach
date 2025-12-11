// Vercel serverless function for listing documents from Tavus Knowledge Base
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  }

  try {
    const { tag } = req.query; // Optional: filter by tag (e.g., 'resume' or 'job-description')

    // Fetch all documents from Tavus
    const response = await fetch(`${TAVUS_BASE_URL}/documents`, {
      method: 'GET',
      headers: {
        'x-api-key': TAVUS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch documents:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return res.status(response.status).json({
        error: 'Failed to fetch documents from Tavus',
        details: errorText,
      });
    }

    const responseData = await response.json();
    console.log('Tavus list response:', JSON.stringify(responseData, null, 2));

    let documents = responseData.data || [];

    // Map Tavus format to our format (uuid -> document_id)
    documents = documents.map(doc => {
      console.log('Processing document:', JSON.stringify(doc, null, 2));

      const mapped = {
        document_id: doc.uuid || doc.document_id || doc.id, // Try multiple fields
        document_name: doc.document_name,
        document_url: doc.document_url,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        tags: doc.tags || [],
        properties: doc.properties || {}
      };

      console.log('Mapped to:', JSON.stringify(mapped, null, 2));
      return mapped;
    });

    console.log('All mapped documents:', JSON.stringify(documents, null, 2));

    // Filter by tag if provided
    if (tag && Array.isArray(documents)) {
      documents = documents.filter(doc =>
        doc.tags && doc.tags.includes(tag)
      );
    }

    return res.status(200).json({ documents });

  } catch (error) {
    console.error('List documents error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
