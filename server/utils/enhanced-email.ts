/**
 * Enhanced Email Service for CJSR Platform
 * Handles formatting and sending of transactional emails
 */

export enum EmailType {
  EVENT_CONFIRMATION = 'event_confirmation',
  PLAY_REPORT = 'play_report',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EVENT_REMINDER = 'event_reminder',
  NEW_BADGE = 'new_badge',
  EGG_HATCHED = 'egg_hatched'
}

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/**
 * Generate email content for password reset
 */
export function generateEnhancedPasswordResetEmail(
  username: string,
  resetToken: string,
  baseUrl: string
): EmailContent {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Reset Your Chicken Jockey Scribe Racer Password',
    text: `
      Hello ${username},
      
      You recently requested to reset your password for your Chicken Jockey Scribe Racer account.
      
      Click the link below to reset your password:
      ${resetLink}
      
      If you did not request a password reset, please ignore this email or contact support.
      
      This password reset link is only valid for 1 hour.
      
      - The Chicken Jockey Scribe Racer Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${username},</p>
        <p>You recently requested to reset your password for your Chicken Jockey Scribe Racer account.</p>
        <p><a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Your Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p><em>This password reset link is only valid for 1 hour.</em></p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `
  };
}

/**
 * Generate email content for username recovery
 */
export function generateEnhancedUsernameRecoveryEmail(
  email: string,
  username: string
): EmailContent {
  return {
    subject: 'Your Chicken Jockey Scribe Racer Username',
    text: `
      Hello,
      
      You recently requested to recover your username for your Chicken Jockey Scribe Racer account.
      
      Your username is: ${username}
      
      If you did not request this information, please ignore this email or contact support.
      
      - The Chicken Jockey Scribe Racer Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Username Recovery</h2>
        <p>Hello,</p>
        <p>You recently requested to recover your username for your Chicken Jockey Scribe Racer account.</p>
        <p>Your username is: <strong>${username}</strong></p>
        <p>If you did not request this information, please ignore this email or contact support.</p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `
  };
}

/**
 * Generate welcome email content
 */
export function generateEnhancedWelcomeEmail(
  username: string
): EmailContent {
  return {
    subject: 'Welcome to Chicken Jockey Scribe Racer!',
    text: `
      Hi ${username},
      
      Welcome to Chicken Jockey Scribe Racer! We're thrilled to have you join our community of chicken-racing typing enthusiasts.
      
      Here's what you can do now:
      - Race in the Classic Campaign to improve your typing skills
      - Challenge your friends in multiplayer races
      - Create your own custom prompts for others to race
      - Collect unique Garu Eggs through the Codex Crucible
      
      Happy racing!
      
      - The Chicken Jockey Scribe Racer Team
    `,
    html: `
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
    `
  };
}

/**
 * Generate email content for egg hatched notification
 */
export function generateEggHatchedNotification(
  username: string,
  eggName: string,
  eggType: string,
  profileLink: string
): EmailContent {
  return {
    subject: `Your Garu Egg has hatched!`,
    text: `
      Hi ${username},
      
      Exciting news! Your ${eggType} Garu Egg named "${eggName}" has hatched!
      
      Visit your profile to see your new Garu: ${profileLink}
      
      - The Chicken Jockey Scribe Racer Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Garu Egg Has Hatched!</h2>
        <p>Hi ${username},</p>
        <p>Exciting news! Your ${eggType} Garu Egg named "${eggName}" has hatched!</p>
        <p><a href="${profileLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Visit Your Profile</a></p>
        <p>- The Chicken Jockey Scribe Racer Team</p>
      </div>
    `
  };
}