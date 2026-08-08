import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    const {
      principalName,
      organization,
      email,
      phone,
      reputationGoals,
      outcomes,
      misunderstandings,
      active_channels,
      other_channels,
      existingSuccess,
      workflow,
      timeCommitment,
      targetAudience,
      audienceStage,
      inspirations,
      tone,
      avoidWords,
      approver,
      review_method,
      milestones
    } = payload;

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ error: 'Missing SMTP credentials in environment variables.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const activeChannels = Array.isArray(active_channels) && active_channels.length > 0
      ? active_channels.join(', ')
      : 'None selected';

    const toneList = Array.isArray(tone) && tone.length > 0
      ? tone.join(', ')
      : 'None selected';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background-color: #000000; border: 1px solid #27272a; border-top: 3px solid #D00000; padding: 30px; }
    .header { border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
    .subbrand { color: #D00000; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .section-title { font-size: 12px; font-family: monospace; color: #D00000; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #27272a; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; }
    .grid { width: 100%; border-collapse: collapse; }
    .grid td { padding: 10px 12px; border-bottom: 1px solid #18181b; vertical-align: top; font-size: 13px; }
    .field-label { color: #a1a1aa; width: 35%; font-family: monospace; font-size: 11px; text-transform: uppercase; }
    .field-value { color: #f4f4f5; font-weight: 500; word-break: break-word; }
    .footer { margin-top: 35px; border-top: 1px solid #27272a; padding-top: 15px; text-align: center; font-size: 10px; font-family: monospace; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Frost Media</div>
      <div class="subbrand">Strategic Discovery Onboarding Payload</div>
    </div>

    <div class="section-title">01. Principal & Contact Information</div>
    <table class="grid">
      <tr><td class="field-label">Principal Name</td><td class="field-value">${principalName || 'N/A'}</td></tr>
      <tr><td class="field-label">Organization</td><td class="field-value">${organization || 'N/A'}</td></tr>
      <tr><td class="field-label">Client Email</td><td class="field-value">${email || 'N/A'}</td></tr>
      <tr><td class="field-label">Direct Phone</td><td class="field-value">${phone || 'N/A'}</td></tr>
      <tr><td class="field-label">2-3 Yr Authority Goal</td><td class="field-value">${reputationGoals || 'N/A'}</td></tr>
      <tr><td class="field-label">Expected Outcomes</td><td class="field-value">${outcomes || 'N/A'}</td></tr>
      <tr><td class="field-label">Misconceptions to Correct</td><td class="field-value">${misunderstandings || 'N/A'}</td></tr>
    </table>

    <div class="section-title">02. Active Channels & Workflow</div>
    <table class="grid">
      <tr><td class="field-label">Active Channels</td><td class="field-value">${activeChannels}</td></tr>
      <tr><td class="field-label">Other Channels</td><td class="field-value">${other_channels || 'N/A'}</td></tr>
      <tr><td class="field-label">Proven Formats / Wins</td><td class="field-value">${existingSuccess || 'N/A'}</td></tr>
      <tr><td class="field-label">Current Workflow</td><td class="field-value">${workflow || 'N/A'}</td></tr>
      <tr><td class="field-label">Weekly Capacity</td><td class="field-value">${timeCommitment || 'N/A'}</td></tr>
    </table>

    <div class="section-title">03. Target Audience & Brand Voice</div>
    <table class="grid">
      <tr><td class="field-label">Target Audience</td><td class="field-value">${targetAudience || 'N/A'}</td></tr>
      <tr><td class="field-label">Audience Stage</td><td class="field-value">${audienceStage || 'N/A'}</td></tr>
      <tr><td class="field-label">Desired Tone</td><td class="field-value">${toneList}</td></tr>
      <tr><td class="field-label">Benchmark Influences</td><td class="field-value">${inspirations || 'N/A'}</td></tr>
      <tr><td class="field-label">Forbidden Words</td><td class="field-value">${avoidWords || 'N/A'}</td></tr>
    </table>

    <div class="section-title">04. Logistics & Review Protocol</div>
    <table class="grid">
      <tr><td class="field-label">Approval Authority</td><td class="field-value">${approver || 'N/A'}</td></tr>
      <tr><td class="field-label">Review Method</td><td class="field-value">${review_method || 'N/A'}</td></tr>
      <tr><td class="field-label">Upcoming Milestones</td><td class="field-value">${milestones || 'N/A'}</td></tr>
    </table>

    <div class="footer">
      Frost Media Group &bull; Onboarding Automation
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: smtpUser,
      to: smtpUser,
      replyTo: email,
      subject: `[Discovery Payload] ${principalName || 'New Principal'} - ${organization || 'Frost Media Client'}`,
      html: htmlContent
    });

    return res.status(200).json({ success: true, message: 'Email dispatched successfully.' });
  } catch (error: any) {
    console.error('Error in Vercel discovery handler:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
