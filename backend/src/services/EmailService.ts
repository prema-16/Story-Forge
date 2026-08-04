import { logger } from '../config/logger';
import { env } from '../config/env';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send an HTML email.
   * In development or without SMTP credentials, logs the rendered HTML to console for test inspection.
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    logger.info(`[EmailService] Sending email to ${options.to} — Subject: "${options.subject}"`);

    if (env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
      logger.info(`\n======== DEV EMAIL MOCK START ========`);
      logger.info(`To: ${options.to}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info(`Body:\n${options.text || options.html}`);
      logger.info(`======== DEV EMAIL MOCK END ==========\n`);
      return true;
    }

    // In production with SMTP configured:
    try {
      const nodemailer: any = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${env.CLIENT_URL}" <noreply@storyforge.ai>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      return true;
    } catch (err) {
      logger.error('[EmailService] Failed to send email:', err);
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const link = `${env.CLIENT_URL}/register/verify?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #05050f; color: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #a78bfa;">Welcome to StoryForge AI, ${name}!</h2>
        <p style="color: #d1d5db;">Please verify your email address to complete your registration.</p>
        <div style="margin: 25px 0;">
          <a href="${link}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">Or copy and paste this link in your browser: <br/>${link}</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Verify your StoryForge AI email address', html });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const link = `${env.CLIENT_URL}/forgot-password/reset?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #05050f; color: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #a78bfa;">Reset Your StoryForge AI Password</h2>
        <p style="color: #d1d5db;">We received a request to reset your password. Click the button below to set a new password.</p>
        <div style="margin: 25px 0;">
          <a href="${link}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">Link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Reset your StoryForge AI password', html });
  }

  async sendOrgInviteEmail(email: string, orgName: string, inviterName: string, token: string): Promise<boolean> {
    const link = `${env.CLIENT_URL}/invite/accept?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #05050f; color: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #a78bfa;">You've been invited to join ${orgName}!</h2>
        <p style="color: #d1d5db;">${inviterName} has invited you to collaborate on StoryForge AI.</p>
        <div style="margin: 25px 0;">
          <a href="${link}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
      </div>
    `;
    return this.sendEmail({ to: email, subject: `Invitation to join ${orgName} on StoryForge AI`, html });
  }

  async sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
    const link = `${env.CLIENT_URL}/login/magic?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #05050f; color: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #a78bfa;">Your StoryForge AI Magic Login Link</h2>
        <p style="color: #d1d5db;">Click below to sign in instantly without password.</p>
        <div style="margin: 25px 0;">
          <a href="${link}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Sign In Now</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">Link expires in 15 minutes.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Your Magic Login Link — StoryForge AI', html });
  }
}

export const emailService = new EmailService();
