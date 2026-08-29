import { Router, Request, Response } from 'express';
import { sendEmail } from './email.service';
import { templates } from './templates';
import { requireApiKey } from '../middleware/apiKey';

const router = Router();

// Protect all email endpoints with API Key authentication
router.use(requireApiKey);

router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
       res.status(400).json({ error: 'Missing required fields: to, subject, message' });
       return;
    }
    
    const info = await sendEmail(to, subject, message);
    res.json({ success: true, message: 'Email sent successfully!', info });
  } catch (error: any) {
    console.error('Email route error:', error);
    res.status(500).json({ error: 'Failed to send email. Check your SMTP configuration.' });
  }
});

router.post('/template', async (req: Request, res: Response) => {
  try {
    const { to, template, data } = req.body;
    if (!to || !template || !data) {
       res.status(400).json({ error: 'Missing required fields: to, template, data' });
       return;
    }
    
    // @ts-ignore
    const selectedTemplate = templates[template];
    if (!selectedTemplate) {
      res.status(400).json({ error: 'Invalid template selected' });
      return;
    }

    const { subject, html, text } = selectedTemplate(data);
    const info = await sendEmail(to, subject, text || 'Please view this email in an HTML compatible client.', html);
    res.json({ success: true, message: 'Templated email sent successfully!', info });
  } catch (error: any) {
    console.error('Templated email route error:', error);
    res.status(500).json({ error: 'Failed to send templated email.' });
  }
});

router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { template, data } = req.body;
    if (!template || !data) {
       res.status(400).json({ error: 'Missing required fields: template, data' });
       return;
    }
    
    // @ts-ignore
    const selectedTemplate = templates[template];
    if (!selectedTemplate) {
      res.status(400).json({ error: 'Invalid template selected' });
      return;
    }

    const { subject, html } = selectedTemplate(data);
    res.json({ success: true, subject, html });
  } catch (error: any) {
    console.error('Email preview route error:', error);
    res.status(500).json({ error: 'Failed to generate email preview.' });
  }
});

export default router;
