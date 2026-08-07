import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DiscoveryPayload {
  principalName: string;
  organization: string;
  email: string;
  phone: string;
  reputationGoals: string;
  outcomes?: string;
  misunderstandings?: string;
  active_channels?: string[];
  other_channels?: string;
  existingSuccess?: string;
  workflow?: string;
  timeCommitment?: string;
  targetAudience?: string;
  audienceStage?: string;
  inspirations?: string;
  tone?: string[];
  avoidWords?: string;
  formats?: string[];
  approver?: string;
  review_method?: string;
  milestones?: string;
  webhookUrl?: string;
  submittedAt?: string;
}

interface StoredSubmission extends DiscoveryPayload {
  submissionId: string;
  receivedAt: string;
  ipAddress?: string;
  webhookStatus?: {
    attempted: boolean;
    success?: boolean;
    error?: string;
  };
  emailStatus?: {
    sent: boolean;
    error?: string;
  };
}

const submissionsStore: StoredSubmission[] = [];

function buildDiscoveryEmailHtml(payload: DiscoveryPayload, submissionId: string, timestamp: string): string {
  const activeChannels = Array.isArray(payload.active_channels) && payload.active_channels.length > 0
    ? payload.active_channels.join(", ")
    : "None selected";

  const toneList = Array.isArray(payload.tone) && payload.tone.length > 0
    ? payload.tone.join(", ")
    : "None selected";

  return `
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
    .meta-box { background-color: #18181b; border: 1px solid #27272a; padding: 12px 16px; margin-bottom: 25px; font-family: monospace; font-size: 12px; }
    .meta-line { margin-bottom: 4px; color: #a1a1aa; }
    .meta-val { color: #ffffff; font-weight: bold; }
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
      <div class="subbrand">Strategic Discovery Uplink Transmitted</div>
    </div>

    <div class="meta-box">
      <div class="meta-line">TRANSACTION ID: <span class="meta-val">${submissionId}</span></div>
      <div class="meta-line">RECEIVED AT: <span class="meta-val">${timestamp}</span></div>
    </div>

    <div class="section-title">01. Principal & Contact Information</div>
    <table class="grid">
      <tr><td class="field-label">Principal Name</td><td class="field-value">${payload.principalName}</td></tr>
      <tr><td class="field-label">Organization</td><td class="field-value">${payload.organization}</td></tr>
      <tr><td class="field-label">Client Email</td><td class="field-value"><a href="mailto:${payload.email}" style="color:#D00000;text-decoration:none;">${payload.email}</a></td></tr>
      <tr><td class="field-label">Direct Phone</td><td class="field-value">${payload.phone}</td></tr>
      <tr><td class="field-label">2-3 Yr Authority Goal</td><td class="field-value">${payload.reputationGoals || 'N/A'}</td></tr>
      <tr><td class="field-label">Expected Outcomes</td><td class="field-value">${payload.outcomes || 'N/A'}</td></tr>
      <tr><td class="field-label">Misconceptions to Correct</td><td class="field-value">${payload.misunderstandings || 'N/A'}</td></tr>
    </table>

    <div class="section-title">02. Active Channels & Workflow</div>
    <table class="grid">
      <tr><td class="field-label">Active Channels</td><td class="field-value">${activeChannels}</td></tr>
      <tr><td class="field-label">Other Channels</td><td class="field-value">${payload.other_channels || 'N/A'}</td></tr>
      <tr><td class="field-label">Proven Formats / Wins</td><td class="field-value">${payload.existingSuccess || 'N/A'}</td></tr>
      <tr><td class="field-label">Current Workflow</td><td class="field-value">${payload.workflow || 'N/A'}</td></tr>
      <tr><td class="field-label">Weekly Capacity</td><td class="field-value">${payload.timeCommitment || 'N/A'}</td></tr>
    </table>

    <div class="section-title">03. Target Audience & Brand Voice</div>
    <table class="grid">
      <tr><td class="field-label">Target Audience</td><td class="field-value">${payload.targetAudience || 'N/A'}</td></tr>
      <tr><td class="field-label">Audience Stage</td><td class="field-value">${payload.audienceStage || 'N/A'}</td></tr>
      <tr><td class="field-label">Desired Tone</td><td class="field-value">${toneList}</td></tr>
      <tr><td class="field-label">Benchmark Influences</td><td class="field-value">${payload.inspirations || 'N/A'}</td></tr>
      <tr><td class="field-label">Forbidden Words</td><td class="field-value">${payload.avoidWords || 'N/A'}</td></tr>
    </table>

    <div class="section-title">04. Logistics & Review Protocol</div>
    <table class="grid">
      <tr><td class="field-label">Approval Authority</td><td class="field-value">${payload.approver || 'N/A'}</td></tr>
      <tr><td class="field-label">Review Method</td><td class="field-value">${payload.review_method || 'N/A'}</td></tr>
      <tr><td class="field-label">Upcoming Milestones</td><td class="field-value">${payload.milestones || 'N/A'}</td></tr>
    </table>

    <div class="footer">
      Frost Media Group &bull; Strategic Discovery Automation Pipeline
    </div>
  </div>
</body>
</html>
  `;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Route: Healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Frost Media Discovery Pipeline",
      timestamp: new Date().toISOString()
    });
  });

  // API Route: Submit Discovery Form with SMTP Email Dispatch
  app.post("/api/discovery", async (req, res) => {
    try {
      const payload: DiscoveryPayload = req.body;

      // Mandatory Field Validation
      const errors: string[] = [];
      if (!payload.principalName?.trim()) errors.push("Principal Name is required.");
      if (!payload.organization?.trim()) errors.push("Organization is required.");
      if (!payload.email?.trim()) errors.push("Client Email Address is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        errors.push("A valid Client Email Address is required.");
      }
      if (!payload.phone?.trim()) errors.push("Direct Phone Number is required.");
      if (!payload.reputationGoals?.trim()) errors.push("Reputation Goals field is required.");

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors
        });
      }

      const timestamp = new Date().toISOString();
      const submissionId = `FM-DISCOVERY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const storedItem: StoredSubmission = {
        ...payload,
        principalName: payload.principalName.trim(),
        organization: payload.organization.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        submissionId,
        receivedAt: timestamp,
        ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1"
      };

      // Environment Variable Requirements for SMTP
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@frostmedia.com";
      const smtpTo = process.env.SMTP_TO || process.env.NOTIFICATION_EMAIL || "hello.frostmedia@gmail.com";

      if (!smtpUser || !smtpPass) {
        console.error("SMTP Configuration Error: Missing required environment variables SMTP_USER or SMTP_PASS.");
        return res.status(500).json({
          success: false,
          error: "SMTP Dispatch Failed: SMTP_USER and SMTP_PASS environment variables are required on the server."
        });
      }

      // Create Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `"${payload.principalName} via Frost Media" <${smtpFrom}>`,
        to: smtpTo,
        replyTo: payload.email,
        subject: `[Discovery Payload] ${payload.principalName} - ${payload.organization}`,
        html: buildDiscoveryEmailHtml(payload, submissionId, timestamp)
      };

      // Dispatch Email & Await Execution
      try {
        await transporter.sendMail(mailOptions);
        storedItem.emailStatus = { sent: true };
      } catch (mailErr: any) {
        console.error("Nodemailer SMTP Dispatch Error:", mailErr);
        storedItem.emailStatus = { sent: false, error: mailErr.message || "Failed to dispatch email." };
        return res.status(500).json({
          success: false,
          error: "Failed to dispatch email notification via SMTP.",
          details: mailErr.message || "Email server delivery rejected or timed out."
        });
      }

      // Handle optional custom Webhook destination (if configured)
      const webhookDestination = payload.webhookUrl || process.env.WEBHOOK_URL;
      if (webhookDestination) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const webhookRes = await fetch(webhookDestination, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Frost-Media-Signature": `sig_${Date.now()}`
            },
            body: JSON.stringify(storedItem),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          storedItem.webhookStatus = {
            attempted: true,
            success: webhookRes.ok,
            error: webhookRes.ok ? undefined : `HTTP ${webhookRes.status} ${webhookRes.statusText}`
          };
        } catch (err: any) {
          storedItem.webhookStatus = {
            attempted: true,
            success: false,
            error: err.message || "Webhook delivery request failed"
          };
        }
      }

      submissionsStore.unshift(storedItem);

      return res.status(200).json({
        success: true,
        submissionId,
        timestamp,
        message: "Strategic Discovery payload dispatched via SMTP successfully.",
        webhookStatus: storedItem.webhookStatus
      });
    } catch (error: any) {
      console.error("Discovery API Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error processing strategic discovery payload.",
        details: error.message
      });
    }
  });

  // API Route: List Submissions (for institutional review / admin audit)
  app.get("/api/discovery", (_req, res) => {
    res.json({
      success: true,
      totalCount: submissionsStore.length,
      submissions: submissionsStore
    });
  });

  // API Route: Webhook Connection Test
  app.post("/api/test-webhook", async (req, res) => {
    const { targetUrl } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: "Target URL required." });
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const testRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "frost_media_webhook_test",
          timestamp: new Date().toISOString(),
          status: "connected"
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.json({
        success: testRes.ok,
        status: testRes.status,
        statusText: testRes.statusText
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Webhook connection failed"
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frost Media Discovery Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

