import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'confirm_signup' | 'reset_password' | 'magic_link' | 'invite_user';
  confirmationUrl?: string;
  resetUrl?: string;
  magicLinkUrl?: string;
  inviteUrl?: string;
  userName?: string;
  clinicName?: string;
}

const generateEmailHTML = (template: string, data: any): string => {
  const baseStyles = `
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #334155;
        margin: 0;
        padding: 0;
        background-color: #f8fafc;
      }
      .container { 
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .header { 
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .logo { 
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .tagline {
        font-size: 16px;
        opacity: 0.9;
      }
      .content { 
        padding: 40px 30px;
      }
      .button { 
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        margin: 20px 0;
        text-align: center;
      }
      .button:hover {
        transform: translateY(-1px);
      }
      .footer { 
        background: #f8fafc;
        padding: 20px 30px;
        text-align: center;
        font-size: 14px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
      }
      .security-note {
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        font-size: 14px;
      }
      .url-fallback {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
        word-break: break-all;
        font-family: monospace;
        font-size: 13px;
      }
    </style>
  `;

  switch (template) {
    case 'confirm_signup':
      return `
        ${baseStyles}
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BiohackLabs.ai</div>
              <div class="tagline">Advanced Lab Analysis & Health Optimization</div>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome${data.userName ? `, ${data.userName}` : ''}!</h2>
              <p>Thank you for joining BiohackLabs.ai. We're excited to help you optimize your health through advanced lab analysis and personalized insights.</p>
              
              <p>Click the button below to confirm your email address and activate your account:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmationUrl}" class="button">Confirm Your Email</a>
              </div>
              
              <div class="security-note">
                🔒 <strong>Security Notice:</strong> This confirmation link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
              </div>
              
              <p><strong>What's next?</strong></p>
              <ul style="padding-left: 20px;">
                <li>Upload your lab reports for AI-powered analysis</li>
                <li>Get personalized health recommendations</li>
                <li>Access our supplement dispensary at 25% off</li>
                <li>Track your health optimization progress</li>
              </ul>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="url-fallback">${data.confirmationUrl}</div>
            </div>
            <div class="footer">
              <p>You're receiving this because someone used ${data.to} to create an account on BiohackLabs.ai.</p>
              <p>If this wasn't you, please ignore this message.</p>
              <p style="margin-top: 15px;">
                <strong>BiohackLabs.ai</strong><br>
                Advanced Health Analytics & Optimization Platform
              </p>
            </div>
          </div>
        </body>
      `;
      
    case 'reset_password':
      return `
        ${baseStyles}
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BiohackLabs.ai</div>
              <div class="tagline">Password Reset Request</div>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>
              <p>We received a request to reset the password for your BiohackLabs.ai account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="security-note">
                🔒 <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="url-fallback">${data.resetUrl}</div>
            </div>
            <div class="footer">
              <p>You're receiving this because a password reset was requested for ${data.to}.</p>
              <p><strong>BiohackLabs.ai</strong> - Advanced Health Analytics & Optimization Platform</p>
            </div>
          </div>
        </body>
      `;
      
    case 'magic_link':
      return `
        ${baseStyles}
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BiohackLabs.ai</div>
              <div class="tagline">Secure Login Link</div>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Your Secure Login Link</h2>
              <p>Click the button below to securely access your BiohackLabs.ai account:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.magicLinkUrl}" class="button">Sign In to BiohackLabs.ai</a>
              </div>
              
              <div class="security-note">
                🔒 <strong>Security Notice:</strong> This login link will expire in 1 hour for your security.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="url-fallback">${data.magicLinkUrl}</div>
            </div>
            <div class="footer">
              <p>You're receiving this because someone requested a login link for ${data.to}.</p>
              <p>If this wasn't you, please ignore this email.</p>
              <p><strong>BiohackLabs.ai</strong> - Advanced Health Analytics & Optimization Platform</p>
            </div>
          </div>
        </body>
      `;
      
    default:
      return `
        ${baseStyles}
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BiohackLabs.ai</div>
              <div class="tagline">Advanced Lab Analysis & Health Optimization</div>
            </div>
            <div class="content">
              <h2 style="color: #1e293b;">Account Notification</h2>
              <p>This is a notification from your BiohackLabs.ai account.</p>
            </div>
            <div class="footer">
              <p><strong>BiohackLabs.ai</strong> - Advanced Health Analytics & Optimization Platform</p>
            </div>
          </div>
        </body>
      `;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, confirmationUrl, resetUrl, magicLinkUrl, inviteUrl, userName, clinicName }: EmailRequest = await req.json();

    console.log(`Sending ${template} email to ${to}`);

    const emailHTML = generateEmailHTML(template, { 
      to, 
      confirmationUrl, 
      resetUrl, 
      magicLinkUrl, 
      inviteUrl, 
      userName, 
      clinicName 
    });

    const emailResponse = await resend.emails.send({
      from: "BiohackLabs.ai <support@biohacklabs.ai>",
      to: [to],
      subject: subject,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-branded-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);