import { RECAPTCHA_SECRET_KEY } from "../config";
import { HttpError } from "../errors/http-error";

// SECURITY FEATURE: CAPTCHA verification for high-risk, bot-targeted actions
// (registration, password reset requests, and login after repeated failures).
// Verifies the client-submitted token against Google's siteverify endpoint —
// the actual widget/checkbox lives in the frontend; this is the server-side
// check that the token is real and unused.
export const verifyCaptcha = async (captchaToken?: string) => {
    if (!captchaToken) {
        throw new HttpError(400, "CAPTCHA verification is required");
    }

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET_KEY,
                response: captchaToken,
            }),
        });

        const data: any = await response.json();
        if (!data.success) {
            throw new HttpError(400, "CAPTCHA verification failed. Please try again.");
        }
    } catch (error) {
        if (error instanceof HttpError) throw error;
        // Network/Google outage — fail closed (reject) rather than silently
        // skipping the check, consistent with the rest of this app's approach.
        throw new HttpError(503, "CAPTCHA verification service unavailable. Please try again shortly.");
    }
};