// Vercel serverless function to fetch recording URLs from S3
import { S3Client, HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

// Check if S3 is configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME &&
    process.env.S3_BUCKET_REGION
  );
};

// Initialize S3 client only if configured
const s3Client = isS3Configured() ? new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversation_id } = req.query;

  if (!conversation_id) {
    return res.status(400).json({ error: 'conversation_id is required' });
  }

  // Case 1: S3 not configured at all
  if (!isS3Configured() || !s3Client) {
    return res.status(200).json({
      recording_url: null,
      status: 'not_configured',
      message: 'Recording feature is not configured for this application'
    });
  }

  try {
    // Case 2: Try to find recording in Tavus's folder structure
    // Tavus stores recordings as: tavus/{conversation_id}/{timestamp}.mp4
    console.log(`Searching S3 for conversation: ${conversation_id}`);

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `tavus/${conversation_id}/`,  // Search in the conversation's folder
      MaxKeys: 100,
    });

    const { Contents } = await s3Client.send(listCommand);

    console.log(`Found ${Contents?.length || 0} files in tavus/${conversation_id}/`);
    if (Contents && Contents.length > 0) {
      console.log('S3 files:', Contents.map(obj => obj.Key));
    }

    // Find the first video file in the folder
    // Note: Tavus may store files with or without extensions
    const recording = Contents?.find(obj => {
      const key = obj.Key;
      // Skip folders (end with /)
      if (key.endsWith('/')) return false;
      // Accept any file with video extension OR no extension (Tavus sometimes omits it)
      return key.endsWith('.mp4') || key.endsWith('.webm') || !key.includes('.');
    });

    if (recording) {
      // Found it with different naming!
      console.log(`Found recording: ${recording.Key}`);
      const url = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: recording.Key,
      }), { expiresIn: 3600 });

      return res.status(200).json({
        recording_url: url,
        status: 'ready',
        message: 'Recording is ready to watch'
      });
    }

    // Case 4: Not in S3 yet
    // Check if this might be an old conversation (before recording was enabled)
    // by trying to get conversation metadata from Tavus
    try {
      const conversationResponse = await fetch(`${TAVUS_BASE_URL}/conversations/${conversation_id}`, {
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      });

      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json();
        const createdAt = new Date(conversationData.created_at);
        const now = new Date();
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        // If conversation is older than 2 hours and no recording found, it likely doesn't have one
        if (hoursSinceCreation > 2) {
          return res.status(200).json({
            recording_url: null,
            status: 'not_available',
            message: 'This conversation does not have a recording. Recording may not have been enabled when this interview was conducted.'
          });
        }
      }
    } catch (fetchErr) {
      // If we can't fetch conversation details, continue with default behavior
      console.log('Could not fetch conversation metadata:', fetchErr);
    }

    // Still recent - might be processing
    return res.status(200).json({
      recording_url: null,
      status: 'processing',
      message: 'Recording is still processing. Try refreshing in a few minutes.'
    });

  } catch (err) {
    console.error('S3 error:', err);

    // Case 5: S3 error (permissions, network, etc.)
    return res.status(200).json({
      recording_url: null,
      status: 'error',
      message: 'Failed to check recording status. Please try again later.'
    });
  }
}
