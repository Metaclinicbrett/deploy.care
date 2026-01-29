/**
 * Supabase Edge Function: Send Email via Gmail API
 *
 * Sends transactional emails using Google Workspace Gmail API.
 * Supports templates, attachments, and tracking.
 *
 * Environment Variables Required:
 * - GMAIL_CLIENT_ID: OAuth client ID
 * - GMAIL_CLIENT_SECRET: OAuth client secret
 * - GMAIL_REFRESH_TOKEN: Refresh token for the sending account
 * - GMAIL_SENDER_EMAIL: The email address to send from (e.g., notifications@deploy.care)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gmail API endpoints
const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    content: string; // Base64 encoded
  }>;
  // Tracking
  patientId?: string;
  caseId?: string;
  templateId?: string;
  // Metadata
  tags?: string[];
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID');
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail credentials not configured');
  }

  const response = await fetch(GMAIL_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create RFC 2822 formatted email message
 */
function createEmailMessage(
  from: string,
  to: string[],
  subject: string,
  bodyText?: string,
  bodyHtml?: string,
  cc?: string[],
  bcc?: string[],
  replyTo?: string,
  attachments?: EmailRequest['attachments']
): string {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  const hasAttachments = attachments && attachments.length > 0;
  const hasHtml = !!bodyHtml;

  let message = '';

  // Headers
  message += `From: Deploy Care <${from}>\r\n`;
  message += `To: ${to.join(', ')}\r\n`;
  if (cc && cc.length > 0) {
    message += `Cc: ${cc.join(', ')}\r\n`;
  }
  if (bcc && bcc.length > 0) {
    message += `Bcc: ${bcc.join(', ')}\r\n`;
  }
  if (replyTo) {
    message += `Reply-To: ${replyTo}\r\n`;
  }
  message += `Subject: ${subject}\r\n`;
  message += `Date: ${new Date().toUTCString()}\r\n`;
  message += 'MIME-Version: 1.0\r\n';

  if (hasAttachments) {
    // Multipart with attachments
    message += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    // Text/HTML part
    if (hasHtml) {
      const altBoundary = `alt_${boundary}`;
      message += `--${boundary}\r\n`;
      message += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;

      // Plain text
      message += `--${altBoundary}\r\n`;
      message += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
      message += (bodyText || stripHtml(bodyHtml!)) + '\r\n\r\n';

      // HTML
      message += `--${altBoundary}\r\n`;
      message += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
      message += bodyHtml + '\r\n\r\n';

      message += `--${altBoundary}--\r\n`;
    } else {
      message += `--${boundary}\r\n`;
      message += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
      message += (bodyText || '') + '\r\n\r\n';
    }

    // Attachments
    for (const attachment of attachments!) {
      message += `--${boundary}\r\n`;
      message += `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"\r\n`;
      message += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
      message += 'Content-Transfer-Encoding: base64\r\n\r\n';
      message += attachment.content + '\r\n\r\n';
    }

    message += `--${boundary}--`;
  } else if (hasHtml) {
    // Multipart alternative (text + HTML)
    message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

    // Plain text
    message += `--${boundary}\r\n`;
    message += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
    message += (bodyText || stripHtml(bodyHtml!)) + '\r\n\r\n';

    // HTML
    message += `--${boundary}\r\n`;
    message += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
    message += bodyHtml + '\r\n\r\n';

    message += `--${boundary}--`;
  } else {
    // Plain text only
    message += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
    message += bodyText || '';
  }

  return message;
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Send email via Gmail API
 */
async function sendEmail(request: EmailRequest): Promise<EmailResponse> {
  const senderEmail = Deno.env.get('GMAIL_SENDER_EMAIL') || 'notifications@deploy.care';

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Create email message
    const emailMessage = createEmailMessage(
      senderEmail,
      request.to,
      request.subject,
      request.bodyText,
      request.bodyHtml,
      request.cc,
      request.bcc,
      request.replyTo,
      request.attachments
    );

    // Encode to base64url
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gmail API error:', error);
      return {
        success: false,
        error: `Gmail API error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  } catch (error) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log email to database for tracking
 */
async function logEmail(
  supabaseUrl: string,
  supabaseKey: string,
  request: EmailRequest,
  response: EmailResponse
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('email_logs').insert({
      to: request.to,
      cc: request.cc,
      subject: request.subject,
      patient_id: request.patientId,
      case_id: request.caseId,
      template_id: request.templateId,
      status: response.success ? 'sent' : 'failed',
      gmail_message_id: response.messageId,
      gmail_thread_id: response.threadId,
      error: response.error,
      tags: request.tags,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log email:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json();

    // Validate required fields
    if (!emailRequest.to || emailRequest.to.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing recipient (to)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!emailRequest.subject) {
      return new Response(
        JSON.stringify({ error: 'Missing subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!emailRequest.bodyText && !emailRequest.bodyHtml) {
      return new Response(
        JSON.stringify({ error: 'Missing email body (bodyText or bodyHtml)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const result = await sendEmail(emailRequest);

    // Log to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && supabaseKey) {
      await logEmail(supabaseUrl, supabaseKey, emailRequest, result);
    }

    // Return response
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
