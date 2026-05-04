import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vet } from '../lib/vet.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { html, ghlFields, helloBarMessage, customSalesPageUrl } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content' });
    }

    const result = await vet({ html, ghlFields, helloBarMessage, customSalesPageUrl });
    return res.json(result);
  } catch (error: any) {
    console.error('Vetting Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
