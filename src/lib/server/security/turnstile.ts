interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes": string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not defined.");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data: TurnstileVerifyResponse = await res.json();
    return data.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
