import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await DATA.prepare("SELECT content FROM apps WHERE route = 'system_message' LIMIT 1").first();
    if (result && result.content) {
      const noticeContent = JSON.parse(result.content);
      res.status(200).json(noticeContent);
    } else {
      res.status(404).json({ message: 'No notice found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching notice from D1:', error.message);
      res.status(500).json({ message: 'Error fetching notice content', error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
}
