"""
email_service.py — Transactional Email & Security OTP Dispatch Service
======================================================================
Delivers 6-digit cryptographic authentication and verification codes to users
via SMTP (TLS/SSL), with fallbacks for development logging and Neon Auth.
"""

import os
import smtplib
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple, Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST or os.getenv("SMTP_HOST", "")
        self.port = int(settings.SMTP_PORT or os.getenv("SMTP_PORT", 587))
        self.user = settings.SMTP_USER or os.getenv("SMTP_USER", "")
        self.password = settings.SMTP_PASSWORD or os.getenv("SMTP_PASSWORD", "")
        self.from_email = settings.SMTP_FROM_EMAIL or self.user or "auth@skillmatch.ai"
        self.from_name = settings.SMTP_FROM_NAME or "SkillMatch DNA Identity Vault"
        self.use_tls = settings.SMTP_USE_TLS

    def is_smtp_configured(self) -> bool:
        return bool(self.host and self.user and self.password)

    def _generate_html_template(self, recipient_email: str, code: str, purpose: str = "signup") -> str:
        action_text = "account registration" if purpose == "signup" else "identity sign-in"
        title_text = "Verification Security Code" if purpose == "signup" else "Two-Factor Authentication Code"

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillMatch Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b101b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b101b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #121927; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
              <div style="font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: 0.5px; text-transform: uppercase;">
                SkillMatch DNA
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                Spatial Zero-Knowledge Identity Verification
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #f8fafc; margin: 0 0 12px 0;">
                {title_text}
              </h2>
              <p style="font-size: 14px; line-height: 22px; color: #94a3b8; margin: 0 0 24px 0;">
                We received a request for <strong style="color: #cbd5e1;">{action_text}</strong> associated with <strong style="color: #10b981;">{recipient_email}</strong>. Use the 6-digit access code below to verify your identity:
              </p>

              <!-- Code Box -->
              <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #34d399; text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);">
                  {code}
                </span>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                  Valid for 10 minutes (600 seconds)
                </div>
              </div>

              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0;">
                If you did not initiate this authentication request, no action is required; your identity remains securely locked.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0b101b; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-size: 11px; color: #475569; margin: 0;">
                SkillMatch DNA &bull; Cryptographic Zero-Knowledge Spatial Architecture &bull; Neon Cloud
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    def send_otp_sync(self, recipient_email: str, code: str, purpose: str = "signup") -> Tuple[bool, str]:
        """Synchronous SMTP email delivery."""
        if not self.is_smtp_configured():
            msg = f"[EMAIL SERVICE NOTICE] SMTP is not yet configured with credentials. Code [{code}] logged for {recipient_email}."
            print(msg)
            return False, "SMTP credentials not configured."

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"SkillMatch Verification Code: {code}"
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = recipient_email

            text_content = f"SkillMatch DNA Verification Code: {code}\nThis code expires in 10 minutes."
            html_content = self._generate_html_template(recipient_email, code, purpose)

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if self.port == 465:
                with smtplib.SMTP_SSL(self.host, self.port, timeout=10) as server:
                    server.login(self.user, self.password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                    if self.use_tls:
                        server.starttls()
                    server.login(self.user, self.password)
                    server.send_message(msg)

            print(f"[EMAIL SERVICE] Successfully dispatched OTP email to {recipient_email}")
            return True, "Email successfully dispatched."
        except Exception as e:
            err_str = f"SMTP dispatch failed: {str(e)}"
            print(f"[EMAIL SERVICE ERROR] {err_str}")
            return False, err_str

    async def send_otp(self, recipient_email: str, code: str, purpose: str = "signup") -> Tuple[bool, str]:
        """Async wrapper for non-blocking email delivery."""
        return await asyncio.to_thread(self.send_otp_sync, recipient_email, code, purpose)

email_service = EmailService()
