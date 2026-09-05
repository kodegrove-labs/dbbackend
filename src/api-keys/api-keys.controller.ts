import { Router, Request, Response } from 'express';
import { generateApiKey, listApiKeys } from './api-keys.service';
import { requireAuth, requireRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all API key endpoints so only authenticated users can access them
router.use(requireAuth);

router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;
    if (!name) {
      res.status(400).json({ error: 'Name is required for the API Key' });
      return;
    }
    const result = await generateApiKey(name, userId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Failed to generate API Key' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const keys = await listApiKeys(userId);
    res.json({ keys });
  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({ error: 'Failed to list API Keys' });
  }
});

export default router;
