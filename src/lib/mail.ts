import resend from './resend';

const SENDER = 'iuno.lol <noreply@iuno.lol>';
const FONT = "'Comfortaa', system-ui, -apple-system, sans-serif";

function shell(inner: string) {
  return `
  <div style="margin:0;padding:0;background:#050507;">
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300&display=swap" rel="stylesheet">
    <div style="background:#050507;padding:36px 16px;">
      <div style="max-width:400px;margin:0 auto;">
        <div style="background:#0c0c0c;border:1px solid #1c1c1e;border-radius:20px;padding:36px 28px;text-align:center;">
          ${inner}
        </div>
        <p style="text-align:center;font-family:${FONT};font-weight:300;font-size:9px;letter-spacing:0.16em;color:#2e2e2e;margin:18px 0 0;">© ${new Date().getFullYear()} IUNO.LOL</p>
      </div>
    </div>
  </div>`;
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;
  const { error } = await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Verify your account — iuno.lol',
    html: shell(`
      <p style="margin:0 0 28px;font-family:${FONT};font-weight:300;font-size:13px;letter-spacing:0.22em;color:#5b6cf5;">iuno.lol</p>
      <p style="margin:0 0 8px;font-family:${FONT};font-weight:300;font-size:11px;letter-spacing:0.14em;color:#555;text-transform:lowercase;">verify your email</p>
      <p style="margin:0 0 26px;font-family:${FONT};font-weight:300;font-size:11px;color:#666;line-height:1.7;">tap the button below to confirm your address</p>
      <a href="${confirmLink}" style="display:inline-block;padding:11px 24px;border-radius:999px;background:#111113;border:1px solid #242426;color:#999;text-decoration:none;font-family:${FONT};font-weight:300;font-size:11px;letter-spacing:0.1em;">verify email</a>
      <p style="margin:22px 0 0;font-family:${FONT};font-weight:300;font-size:10px;color:#333;line-height:1.6;">if you didn&apos;t request this, just ignore it</p>
    `),
  });
  if (error) {
    console.error('[mail] send failed:', error.message);
    throw new Error(error.message);
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const { error } = await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Your code — iuno.lol',
    html: shell(`
      <p style="margin:0 0 26px;font-family:${FONT};font-weight:300;font-size:13px;letter-spacing:0.22em;color:#5b6cf5;">iuno.lol</p>
      <p style="margin:0 0 6px;font-family:${FONT};font-weight:300;font-size:10px;letter-spacing:0.18em;color:#555;text-transform:lowercase;">your security code</p>
      <p style="margin:0 0 4px;font-family:${FONT};font-weight:300;font-size:10px;letter-spacing:0.06em;color:#3a3a3a;">use the code below to continue</p>
      <div style="margin:20px auto 0;max-width:260px;background:#111113;border:1px solid #1e1e20;border-radius:14px;padding:18px 16px;">
        <p style="margin:0;font-family:${FONT};font-weight:300;font-size:28px;letter-spacing:10px;color:#e9e9ea;text-align:center;">${token}</p>
      </div>
      <p style="margin:18px 0 0;font-family:${FONT};font-weight:300;font-size:10px;color:#3a3a3a;letter-spacing:0.04em;">expires in 5 minutes · ignore if you didn&apos;t request it</p>
    `),
  });
  if (error) {
    console.error('[mail] send failed:', error.message);
    throw new Error(error.message);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;
  const { error } = await resend.emails.send({
    from: SENDER,
    to: email,
    subject: 'Reset your password — iuno.lol',
    html: shell(`
      <p style="margin:0 0 28px;font-family:${FONT};font-weight:300;font-size:13px;letter-spacing:0.22em;color:#5b6cf5;">iuno.lol</p>
      <p style="margin:0 0 8px;font-family:${FONT};font-weight:300;font-size:11px;letter-spacing:0.14em;color:#555;text-transform:lowercase;">reset your password</p>
      <p style="margin:0 0 26px;font-family:${FONT};font-weight:300;font-size:11px;color:#666;line-height:1.7;">we received a request to reset your password</p>
      <a href="${resetLink}" style="display:inline-block;padding:11px 24px;border-radius:999px;background:#111113;border:1px solid #242426;color:#999;text-decoration:none;font-family:${FONT};font-weight:300;font-size:11px;letter-spacing:0.1em;">reset password</a>
      <p style="margin:22px 0 0;font-family:${FONT};font-weight:300;font-size:10px;color:#333;line-height:1.6;">if you didn&apos;t request this, just ignore it</p>
    `),
  });
  if (error) {
    console.error('[mail] send failed:', error.message);
    throw new Error(error.message);
  }
};
