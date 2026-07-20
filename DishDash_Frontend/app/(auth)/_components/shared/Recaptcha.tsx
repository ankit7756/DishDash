"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface RecaptchaProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
}

// Lightweight, dependency-free reCAPTCHA v2 widget. Uses Google's official
// public TEST site key by default — always passes, safe for local dev/demo
// without a real Google account. Swap NEXT_PUBLIC_RECAPTCHA_SITE_KEY for a
// real key before any real deployment.
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

declare global {
    interface Window {
        grecaptcha: any;
        __onRecaptchaLoad?: () => void;
    }
}

export default function Recaptcha({ onVerify, onExpire }: RecaptchaProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);
    const callbackName = useRef(`__recaptchaCallback_${Math.random().toString(36).slice(2)}`);

    useEffect(() => {
        (window as any)[callbackName.current] = (token: string) => onVerify(token);

        const renderWidget = () => {
            if (containerRef.current && window.grecaptcha?.render && widgetId.current === null) {
                widgetId.current = window.grecaptcha.render(containerRef.current, {
                    sitekey: SITE_KEY,
                    callback: (window as any)[callbackName.current],
                    "expired-callback": () => onExpire?.(),
                });
            }
        };

        if (window.grecaptcha?.render) {
            renderWidget();
        } else {
            window.__onRecaptchaLoad = renderWidget;
        }

        return () => {
            delete (window as any)[callbackName.current];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Script
                src="https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit"
                strategy="afterInteractive"
            />
            <div ref={containerRef} />
        </>
    );
}