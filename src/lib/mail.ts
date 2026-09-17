import resend from './resend';

const SENDER = 'iuno.lol <noreply@iuno.lol>';

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Verify your account - iuno.lol',
    html: `
      <div style="background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center; min-height: 100vh;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 48px 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
          <div style="margin-bottom: 24px; font-size: 32px; font-weight: 800; letter-spacing: -2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><span style="color: #ffffff;">iuno</span><span style="color: #5b6cf5;">.lol</span></div>
          
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #ffffff; letter-spacing: -0.02em;">Verify your account</h1>
          <p style="font-size: 15px; color: #888888; margin: 0 0 32px 0; line-height: 1.6;">
            Welcome to iuno.lol. Please click the button below to confirm your email address and get started.
          </p>
          
          <a href="${confirmLink}" style="display: inline-block; background-color: #5b6cf5; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">
            Verify Email Address
          </a>

          <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 40px 0 24px 0;" />
          
          <p style="font-size: 12px; color: #555555; margin: 0 0 24px 0; line-height: 1.5;">
            If you didn't request this email, there's nothing to worry about. You can safely ignore it.
          </p>

          <p style="font-size: 11px; color: #444444; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">
            © ${new Date().getFullYear()} IUNO.LOL. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div style="display: none; opacity: 0; font-size: 0px; line-height: 0px; color: transparent;">
          ${Date.now()}-${Math.random()}
        </div>
      </div>
    `
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Your Security Code - iuno.lol',
    html: `
      <div style="background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center; min-height: 100vh;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 48px 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
          <div style="margin-bottom: 24px; font-size: 32px; font-weight: 800; letter-spacing: -2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><span style="color: #ffffff;">iuno</span><span style="color: #5b6cf5;">.lol</span></div>
          
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #ffffff; letter-spacing: -0.02em;">Your security code</h1>
          <p style="font-size: 15px; color: #888888; margin: 0 0 32px 0; line-height: 1.6;">
            Use the following security code to complete your sign-in process.
          </p>
          
          <div style="background-color: #0b1218; border: 1px solid #162635; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #5b6cf5; font-family: monospace; text-align: center; margin-left: 12px;">
              ${token}
            </div>
          </div>

          <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 40px 0 24px 0;" />
          
          <p style="font-size: 12px; color: #555555; margin: 0 0 24px 0; line-height: 1.5;">
            This code will expire shortly. If you didn't try to sign in, you can safely ignore this email.
          </p>

          <p style="font-size: 11px; color: #444444; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">
            © ${new Date().getFullYear()} IUNO.LOL. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div style="display: none; opacity: 0; font-size: 0px; line-height: 0px; color: transparent;">
          ${Date.now()}-${Math.random()}
        </div>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Reset your password - iuno.lol',
    html: `
      <div style="background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center; min-height: 100vh;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 48px 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
          <div style="margin-bottom: 24px; font-size: 32px; font-weight: 800; letter-spacing: -2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><span style="color: #ffffff;">iuno</span><span style="color: #5b6cf5;">.lol</span></div>
          
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #ffffff; letter-spacing: -0.02em;">Reset your password</h1>
          <p style="font-size: 15px; color: #888888; margin: 0 0 32px 0; line-height: 1.6;">
            We received a request to reset the password for your account. Click the button below to choose a new one.
          </p>
          
          <a href="${resetLink}" style="display: inline-block; background-color: #5b6cf5; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">
            Reset Password
          </a>

          <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 40px 0 24px 0;" />
          
          <p style="font-size: 12px; color: #555555; margin: 0 0 24px 0; line-height: 1.5;">
            If you didn't request a password reset, there's nothing to worry about. Your password remains safe and you can safely ignore this email.
          </p>

          <p style="font-size: 11px; color: #444444; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">
            © ${new Date().getFullYear()} IUNO.LOL. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div style="display: none; opacity: 0; font-size: 0px; line-height: 0px; color: transparent;">
          ${Date.now()}-${Math.random()}
        </div>
      </div>
    `
  });
};

