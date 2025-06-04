/**
 * Email utility for sending recovery emails
 * 
 * This implementation uses the EmailService class to send emails via SendGrid
 */
import { EmailService } from '../utils/email-service';

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  // Log the email details for debugging
  console.log(`[EMAIL SERVICE] Sending email to: ${to}`);
  console.log(`[EMAIL SERVICE] Subject: ${subject}`);
  
  return EmailService.sendEmail({
    to,
    subject,
    text,
    html: html || text,
    from: "timeknotgames@gmail.com"
  });
}

export function generatePasswordResetEmail(username: string, token: string, baseUrl: string): { subject: string, text: string, html: string } {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const subject = "Chicken Jockey Scribe Racer - Password Reset";
  
  const text = `
Hello ${username},

You've requested to reset your password for Chicken Jockey Scribe Racer.

Please click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The Chicken Jockey Scribe Racer Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #2a3142; padding: 20px; text-align: center;">
        <h1 style="color: #ffcc00; margin: 0;">Chicken Jockey Scribe Racer</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
        <p>Hello ${username},</p>
        <p>You've requested to reset your password for Chicken Jockey Scribe Racer.</p>
        <p>Please click the button below to reset your password:</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #ffcc00; color: #2a3142; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </td>
          </tr>
        </table>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;"><a href="${resetUrl}" style="color: #0066cc;">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Chicken Jockey Scribe Racer Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, text, html };
}

export function generateUsernameRecoveryEmail(email: string, username: string): { subject: string, text: string, html: string } {
  const subject = "Chicken Jockey Scribe Racer - Username Recovery";
  
  const text = `
Hello,

You've requested to recover your username for Chicken Jockey Scribe Racer.

Your username is: ${username}

If you didn't request this, please ignore this email.

Best regards,
The Chicken Jockey Scribe Racer Team
`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #2a3142; padding: 20px; text-align: center;">
    <h1 style="color: #ffcc00; margin: 0;">Chicken Jockey Scribe Racer</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
    <p>Hello,</p>
    <p>You've requested to recover your username for Chicken Jockey Scribe Racer.</p>
    <p>Your username is:</p>
    <div style="text-align: center; margin: 20px 0;">
      <p style="font-size: 20px; font-weight: bold; background-color: #eee; padding: 10px; border-radius: 4px; display: inline-block;">${username}</p>
    </div>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>The Chicken Jockey Scribe Racer Team</p>
  </div>
</div>
`;

  return { subject, text, html };
}