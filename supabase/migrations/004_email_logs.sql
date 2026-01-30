-- Email Logs Table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipients
  "to" TEXT[] NOT NULL,
  cc TEXT[],
  bcc TEXT[],

  -- Content
  subject TEXT NOT NULL,

  -- Tracking references
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  template_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),

  -- Gmail tracking
  gmail_message_id TEXT,
  gmail_thread_id TEXT,

  -- Error info
  error TEXT,

  -- Metadata
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  -- Who sent it
  sent_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_patient_id ON email_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_case_id ON email_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can see emails for their org's patients/cases
DROP POLICY IF EXISTS "Users can view email logs" ON email_logs;
CREATE POLICY "Users can view email logs" ON email_logs
  FOR SELECT USING (
    sent_by = auth.uid() OR
    patient_id IN (
      SELECT id FROM patients
      WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Service role can insert (from edge function)
DROP POLICY IF EXISTS "Service can insert email logs" ON email_logs;
CREATE POLICY "Service can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);
