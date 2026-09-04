import { Router, Request, Response } from 'express';
import { sendEmail, getSmtpStatus } from './email.service';
import { templates } from './templates';
import { requireApiKey, ApiKeyRequest } from '../middleware/apiKey';

const router = Router();

// Endpoint to check SMTP configuration & auth status without sending an email
router.get('/status', (req: Request, res: Response) => {
  const smtpStatus = getSmtpStatus();
  res.json({
    ...smtpStatus,
    serviceKeyConfigured: Boolean(process.env.SERVICE_API_KEY)
  });
});

// Protect email sending and preview endpoints with API Key or active user session
router.use(requireApiKey);

router.post('/test', async (req: ApiKeyRequest, res: Response) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
       res.status(400).json({ error: 'Missing required fields: to, subject, message' });
       return;
    }
    
    // Explicitly pass senderUserId so the email is tracked under the user who sent it
    const senderUserId = req.apiUser?.id || req.user?.id || null;
    const info = await sendEmail(to, subject, message, undefined, 'custom', senderUserId);
    
    res.json({ 
      success: true, 
      message: info.isEthereal 
        ? 'Email delivered to Ethereal sandbox (test inbox - not a real inbox).'
        : `Email sent successfully to ${to}!`, 
      info,
      previewUrl: info.previewUrl,
      isEthereal: info.isEthereal,
      sender: info.from,
      senderUserId
    });
  } catch (error: any) {
    console.error('Email route error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email. Check your SMTP configuration.' });
  }
});

router.post('/template', async (req: ApiKeyRequest, res: Response) => {
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
    const senderUserId = req.apiUser?.id || req.user?.id || null;
    const info = await sendEmail(to, subject, text || 'Please view this email in an HTML compatible client.', html, template, senderUserId);
    
    res.json({ 
      success: true, 
      message: info.isEthereal 
        ? 'Templated email delivered to Ethereal sandbox (test inbox - not a real inbox).'
        : `Templated email sent successfully to ${to}!`, 
      info,
      previewUrl: info.previewUrl,
      isEthereal: info.isEthereal,
      sender: info.from,
      senderUserId
    });
  } catch (error: any) {
    console.error('Templated email route error:', error);
    res.status(500).json({ error: error.message || 'Failed to send templated email.' });
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
    res.status(500).json({ error: error.message || 'Failed to generate email preview.' });
  }
});

export default router;
