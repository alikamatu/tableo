import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly appUrl: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get<string>('RESEND_API_KEY'));
    this.from = config.get<string>('EMAIL_FROM', 'Tableo <noreply@tableo.app>');
    this.appUrl = config.get<string>('APP_URL', 'http://localhost:3000');
  }

  async sendVerificationEmail(to: string, fullName: string, token: string) {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Verify your Tableo email',
        html: this.verificationTemplate(fullName, url),
      });
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}`, err);
    }
  }

  async sendPasswordResetEmail(to: string, fullName: string, token: string) {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Reset your Tableo password',
        html: this.resetTemplate(fullName, url),
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
    }
  }

  async sendWelcomeEmail(to: string, fullName: string) {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Welcome to Tableo 🎉',
        html: this.welcomeTemplate(fullName),
      });
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err);
    }
  }

  // ─── Email templates ────────────────────────────────────────────────────────

  private base(content: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tableo</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#dc2626;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:rgba(255,255,255,0.2);border-radius:8px;width:28px;height:28px;text-align:center;line-height:28px;">
                  <span style="color:white;font-size:12px;font-weight:700;">T</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:white;font-size:15px;font-weight:600;letter-spacing:-0.3px;">Tableo</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
              © ${new Date().getFullYear()} Tableo · Built in Accra, Ghana<br/>
              If you didn't request this email, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private btn(url: string, label: string) {
    return `<a href="${url}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:600;margin:24px 0;">${label}</a>`;
  }

  private verificationTemplate(name: string, url: string) {
    return this.base(`
      <h2 style="margin:0 0 8px;color:#0a0a0a;font-size:22px;font-weight:600;letter-spacing:-0.4px;">Verify your email</h2>
      <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">Hi ${name}, thanks for signing up for Tableo. Click the button below to verify your email address.</p>
      ${this.btn(url, 'Verify email address')}
      <p style="margin:20px 0 0;color:#999;font-size:13px;">Or copy this link into your browser:<br/>
        <span style="color:#dc2626;word-break:break-all;">${url}</span>
      </p>
      <p style="margin:16px 0 0;color:#bbb;font-size:12px;">This link expires in <strong>24 hours</strong>.</p>
    `);
  }

  private resetTemplate(name: string, url: string) {
    return this.base(`
      <h2 style="margin:0 0 8px;color:#0a0a0a;font-size:22px;font-weight:600;letter-spacing:-0.4px;">Reset your password</h2>
      <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">Hi ${name}, we received a request to reset your Tableo password. Click below to choose a new one.</p>
      ${this.btn(url, 'Reset password')}
      <p style="margin:20px 0 0;color:#999;font-size:13px;">Or copy this link:<br/>
        <span style="color:#dc2626;word-break:break-all;">${url}</span>
      </p>
      <p style="margin:16px 0 0;color:#bbb;font-size:12px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, ignore this email — your account is safe.</p>
    `);
  }

  private welcomeTemplate(name: string) {
    return this.base(`
      <h2 style="margin:0 0 8px;color:#0a0a0a;font-size:22px;font-weight:600;letter-spacing:-0.4px;">Welcome to Tableo 🎉</h2>
      <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">Hi ${name}, your email is verified and your account is ready. You can now create your restaurant, build your menu, and start accepting orders.</p>
      ${this.btn('https://tableo.app/restaurants', 'Go to your dashboard')}
      <p style="margin:24px 0 0;color:#999;font-size:13px;">Need help getting started? Reply to this email — we're here.</p>
    `);
  }
}
