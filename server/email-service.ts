import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be limited.");
}

// Initialize SendGrid with API key if available
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export enum EmailType {
  EVENT_CONFIRMATION = 'event_confirmation',
  PLAY_REPORT = 'play_report',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EVENT_REMINDER = 'event_reminder',
  NEW_BADGE = 'new_badge',
  EGG_HATCHED = 'egg_hatched'
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}

/**
 * SendGrid Email Service for CJSR Platform
 * Handles transactional emails for various platform features
 */
export class EmailService {
  private static readonly DEFAULT_FROM = 'notifications@cjsrgame.com';
  
  /**
   * Send a generic email
   */
  static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('Email would have been sent:', data);
        return true; // For development without SendGrid configured
      }
      
      await mailService.send({
        to: data.to,
        from: data.from || this.DEFAULT_FROM,
        subject: data.subject,
        text: data.text,
        html: data.html
      });
      
      console.log(`Email sent successfully to ${data.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send event confirmation email to participant
   */
  static async sendEventConfirmation(
    email: string,
    username: string,
    eventName: string,
    eventDate: string,
    eventLink: string
  ): Promise<boolean> {
    const subject = `Confirmation: You're registered for ${eventName}`;
    
    const text = `
      Hi ${username},
      
      You're all set for ${eventName} on ${eventDate}!
      
      Join the event here: ${eventLink}
      
      Get ready to race your chicken and show off your typing skills!
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're all set for ${eventName}!</h2>
        <p>Hi ${username},</p>
        <p>We're excited to have you join us for <strong>${eventName}</strong> on <strong>${eventDate}</strong>.</p>
        <p><a href="${eventLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join the Event</a></p>
        <p>Get ready to race your chicken and show off your typing skills!</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = 'Welcome to Chicken Jockey Scribe Racer!';
    
    const text = `
      Hi ${username},
      
      Welcome to Chicken Jockey Scribe Racer! We're thrilled to have you join our community of chicken-racing typing enthusiasts.
      
      Here's what you can do now:
      - Race in the Classic Campaign to improve your typing skills
      - Challenge your friends in multiplayer races
      - Create your own custom prompts for others to race
      - Collect unique Garu Eggs through the Codex Crucible
      
      Happy racing!
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Chicken Jockey Scribe Racer!</h2>
        <p>Hi ${username},</p>
        <p>We're thrilled to have you join our community of chicken-racing typing enthusiasts.</p>
        <h3>Here's what you can do now:</h3>
        <ul>
          <li>Race in the Classic Campaign to improve your typing skills</li>
          <li>Challenge your friends in multiplayer races</li>
          <li>Create your own custom prompts for others to race</li>
          <li>Collect unique Garu Eggs through the Codex Crucible</li>
        </ul>
        <p>Happy racing!</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send notification about new play report submission
   */
  static async sendPlayReportNotification(
    email: string,
    username: string,
    reportId: string,
    reportLink: string
  ): Promise<boolean> {
    const subject = 'New Play Report Submission';
    
    const text = `
      Hi ${username},
      
      A new play report (#${reportId}) has been submitted for your review.
      
      Review it here: ${reportLink}
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Play Report Submission</h2>
        <p>Hi ${username},</p>
        <p>A new play report (#${reportId}) has been submitted for your review.</p>
        <p><a href="${reportLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Report</a></p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    baseUrl: string
  ): Promise<boolean> {
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Chicken Jockey Scribe Racer Password';
    
    const text = `
      Hello,
      
      You recently requested to reset your password for your Chicken Jockey Scribe Racer account.
      
      Click the link below to reset your password:
      ${resetLink}
      
      If you did not request a password reset, please ignore this email or contact support.
      
      This password reset link is only valid for 1 hour.
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for your Chicken Jockey Scribe Racer account.</p>
        <p><a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Your Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p><em>This password reset link is only valid for 1 hour.</em></p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send username recovery email
   */
  static async sendUsernameRecoveryEmail(
    email: string,
    username: string
  ): Promise<boolean> {
    const subject = 'Your Chicken Jockey Scribe Racer Username';
    
    const text = `
      Hello,
      
      You recently requested to recover your username for your Chicken Jockey Scribe Racer account.
      
      Your username is: ${username}
      
      If you did not request this information, please ignore this email or contact support.
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Username Recovery</h2>
        <p>Hello,</p>
        <p>You recently requested to recover your username for your Chicken Jockey Scribe Racer account.</p>
        <p>Your username is: <strong>${username}</strong></p>
        <p>If you did not request this information, please ignore this email or contact support.</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send notification about new badge earned
   */
  static async sendBadgeNotification(
    email: string,
    username: string,
    badgeName: string,
    badgeDescription: string,
    profileLink: string
  ): Promise<boolean> {
    const subject = `Congratulations! You earned the ${badgeName} badge`;
    
    const text = `
      Hi ${username},
      
      Congratulations! You've earned the ${badgeName} badge.
      
      ${badgeDescription}
      
      View all your badges: ${profileLink}
      
      Keep up the great work!
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've Earned a New Badge!</h2>
        <p>Hi ${username},</p>
        <p>Congratulations! You've earned the <strong>${badgeName}</strong> badge.</p>
        <p>${badgeDescription}</p>
        <p><a href="${profileLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View All Your Badges</a></p>
        <p>Keep up the great work!</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send upcoming event reminder email
   */
  static async sendEventReminder(
    email: string,
    username: string,
    eventName: string,
    eventDate: string,
    eventTime: string,
    eventLink: string
  ): Promise<boolean> {
    const subject = `Reminder: ${eventName} is starting soon`;
    
    const text = `
      Hi ${username},
      
      This is a friendly reminder that ${eventName} is starting soon.
      
      Date: ${eventDate}
      Time: ${eventTime}
      
      Join here: ${eventLink}
      
      We look forward to seeing you there!
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Event is Starting Soon!</h2>
        <p>Hi ${username},</p>
        <p>This is a friendly reminder that <strong>${eventName}</strong> is starting soon.</p>
        <p>
          <strong>Date:</strong> ${eventDate}<br>
          <strong>Time:</strong> ${eventTime}
        </p>
        <p><a href="${eventLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join the Event</a></p>
        <p>We look forward to seeing you there!</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }
  
  /**
   * Send notification when a Garu Egg hatches
   */
  static async sendEggHatchedNotification(
    email: string, 
    username: string,
    eggName: string,
    eggType: string,
    profileLink: string
  ): Promise<boolean> {
    const subject = `Your Garu Egg has hatched!`;
    
    const text = `
      Hi ${username},
      
      Exciting news! Your ${eggType} Garu Egg named "${eggName}" has hatched!
      
      Visit your profile to see your new Garu: ${profileLink}
      
      - The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Garu Egg Has Hatched!</h2>
        <p>Hi ${username},</p>
        <p>Exciting news! Your ${eggType} Garu Egg named "${eggName}" has hatched!</p>
        <p><a href="${profileLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Visit Your Profile</a></p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `;
    
    return this.sendEmail({ to: email, subject, text, html });
  }
}