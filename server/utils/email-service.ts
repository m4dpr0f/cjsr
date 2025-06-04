// Simple email service implementation using SendGrid API directly with fetch

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be limited.");
}

export enum EmailType {
  EVENT_CONFIRMATION = 'event_confirmation',
  PLAY_REPORT = 'play_report',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EVENT_REMINDER = 'event_reminder',
  NEW_BADGE = 'new_badge',
  EGG_COLLECTED = 'egg_collected'
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}

/**
 * SendGrid Email Service for Chicken Jockey Scribe Racer
 * Handles transactional emails for various platform features
 */
export class EmailService {
  /**
   * Send a generic email
   */
  static async sendEmail(data: EmailData): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not set, skipping email send");
      return false;
    }

    try {
      // Use SendGrid API directly
      const url = 'https://api.sendgrid.com/v3/mail/send';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.to }]
          }],
          from: { email: data.from || 'timeknotgames@gmail.com' },
          subject: data.subject,
          content: [
            {
              type: 'text/plain',
              value: data.text
            },
            {
              type: 'text/html',
              value: data.html
            }
          ]
        })
      });
      
      if (!response.ok) {
        console.error(`SendGrid API error: ${response.status} ${response.statusText}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = "Welcome to Chicken Jockey Scribe Racer!";
    
    const text = `
      Welcome to Chicken Jockey Scribe Racer, ${username}!
      
      We're excited to have you join our community of typing racers.
      
      Get ready to race your chicken jockey through exciting courses and improve your typing skills!
      
      Here are some tips to get started:
      - Customize your chicken jockey in the profile settings
      - Try a practice race to get familiar with the controls
      - Join the multiplayer races to compete with others
      
      If you have any questions, feel free to reach out to us at timeknotgames@gmail.com or join our Discord at libraryofmeme.com/cjdisco
      
      Happy racing!
      
      The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h1 style="color: #3b82f6;">Welcome to Chicken Jockey Scribe Racer!</h1>
        
        <p>Welcome to Chicken Jockey Scribe Racer, <strong>${username}</strong>!</p>
        
        <p>We're excited to have you join our community of typing racers.</p>
        
        <p>Get ready to race your chicken jockey through exciting courses and improve your typing skills!</p>
        
        <h3 style="color: #4b5563;">Here are some tips to get started:</h3>
        <ul>
          <li>Customize your chicken jockey in the profile settings</li>
          <li>Try a practice race to get familiar with the controls</li>
          <li>Join the multiplayer races to compete with others</li>
        </ul>
        
        <p>If you have any questions, feel free to reach out to us at <a href="mailto:timeknotgames@gmail.com">timeknotgames@gmail.com</a> or join our <a href="https://libraryofmeme.com/cjdisco">Discord</a></p>
        
        <p>Happy racing!</p>
        
        <p><strong>The Chicken Jockey Scribe Racer Team</strong></p>
      </div>
    `;
    
    return EmailService.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, username: string, resetLink: string): Promise<boolean> {
    const subject = "Reset Your Chicken Jockey Scribe Racer Password";
    
    const text = `
      Hello ${username},
      
      We received a request to reset your password for Chicken Jockey Scribe Racer.
      
      To reset your password, please click on the following link:
      ${resetLink}
      
      This link will expire in 24 hours.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h1 style="color: #3b82f6;">Reset Your Password</h1>
        
        <p>Hello <strong>${username}</strong>,</p>
        
        <p>We received a request to reset your password for Chicken Jockey Scribe Racer.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 0.9em; color: #6b7280;">This link will expire in 24 hours.</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
        <p><strong>The Chicken Jockey Scribe Racer Team</strong></p>
      </div>
    `;
    
    return EmailService.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Send notification about new egg collected
   */
  static async sendEggCollectedNotification(
    email: string, 
    username: string, 
    eggType: string,
    eggName: string
  ): Promise<boolean> {
    const subject = "You've Collected a New Garu Egg!";
    
    const text = `
      Congratulations ${username}!
      
      You've collected a new Garu Egg: ${eggName} (${eggType})
      
      Visit your profile to see your collection and learn more about your new egg.
      
      Keep racing to discover more rare eggs!
      
      The Chicken Jockey Scribe Racer Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h1 style="color: #3b82f6;">New Garu Egg Collected!</h1>
        
        <p>Congratulations <strong>${username}</strong>!</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h2 style="color: #4b5563; margin-top: 0;">You've collected a new Garu Egg</h2>
          <h3 style="color: #3b82f6;">${eggName}</h3>
          <p>Type: ${eggType}</p>
        </div>
        
        <p>Visit your profile to see your collection and learn more about your new egg.</p>
        
        <p>Keep racing to discover more rare eggs!</p>
        
        <p><strong>The Chicken Jockey Scribe Racer Team</strong></p>
      </div>
    `;
    
    return EmailService.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }
}