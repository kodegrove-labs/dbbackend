import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { db } from '../db';
import { aiLogs } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Initialize the Gemini client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const generateSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().default('gemini-3.8-flash'),
});

router.post('/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  const logId = uuidv4();
  let validatedData;
  
  try {
    validatedData = generateSchema.parse(req.body);
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid input', details: error.errors });
    return;
  }

  const { prompt, model } = validatedData;
  const userId = req.user?.id;
  const apiKeyId = req.apiKeyId;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    // Convert tokens to string or leave out if usageMetadata is missing
    let tokensUsed = '0';
    if (response.usageMetadata && response.usageMetadata.totalTokenCount) {
      tokensUsed = response.usageMetadata.totalTokenCount.toString();
    }

    const textResponse = response.text || '';

    // Log the successful generation asynchronously
    db.insert(aiLogs).values({
      id: logId,
      user_id: userId,
      api_key_id: apiKeyId,
      model,
      prompt,
      response: textResponse,
      tokens_used: tokensUsed,
    }).execute().catch(console.error);

    res.json({
      success: true,
      text: textResponse,
      tokens: tokensUsed
    });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    
    // Log the failed generation asynchronously
    db.insert(aiLogs).values({
      id: logId,
      user_id: userId,
      api_key_id: apiKeyId,
      model,
      prompt,
      error: error.message || 'Unknown error',
    }).execute().catch(console.error);

    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

export default router;
