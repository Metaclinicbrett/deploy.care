-- ============================================
-- Messaging Tables Migration
-- For chat, SMS, and email functionality
-- ============================================

-- Conversations table (for chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  patient_id UUID NOT NULL,
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  organization_id UUID REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  patient_id UUID,
  type TEXT NOT NULL CHECK (type IN ('patient', 'staff', 'provider', 'system')),
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  is_typing BOOLEAN DEFAULT FALSE
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'staff', 'provider', 'system')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
  attachments JSONB,
  reply_to_id UUID REFERENCES chat_messages(id),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  read_by TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- SMS messages log
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  patient_id UUID,
  case_id UUID REFERENCES cases(id),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  to_number TEXT NOT NULL,
  from_number TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed')),
  error_code TEXT,
  error_message TEXT,
  segment_count INTEGER,
  twilio_sid TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email messages log
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  patient_id UUID,
  case_id UUID REFERENCES cases(id),
  direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  "to" TEXT[] NOT NULL,
  cc TEXT[],
  bcc TEXT[],
  "from" TEXT NOT NULL DEFAULT 'notifications@deploy.care',
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  template_id TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'bounced', 'failed')),
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  error TEXT,
  tags TEXT[],
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('appointment_reminder', 'assessment_request', 'care_plan_update', 'billing_notification', 'general')),
  channel TEXT NOT NULL CHECK (channel IN ('chat', 'sms', 'email')),
  subject TEXT, -- For email
  body TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  patient_id UUID PRIMARY KEY,
  sms_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  preferred_channel TEXT DEFAULT 'sms' CHECK (preferred_channel IN ('chat', 'sms', 'email')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_sms_logs_patient ON sms_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_case ON sms_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_patient ON email_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_case ON email_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see conversations in their organization
CREATE POLICY conversations_select ON conversations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Chat messages: Users can see messages in conversations they can access
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Chat messages: Users can insert messages
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- SMS logs: Staff can view
CREATE POLICY sms_logs_select ON sms_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid())
  );

-- Email logs: Staff can view
CREATE POLICY email_logs_select ON email_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid())
  );

-- Templates: Everyone can read active templates
CREATE POLICY templates_select ON message_templates FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- Real-time subscriptions
-- ============================================

-- Enable real-time for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================
-- Triggers
-- ============================================

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversations_updated
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_templates_updated
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_prefs_updated
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Default Templates
-- ============================================

INSERT INTO message_templates (name, category, channel, subject, body, variables, is_active) VALUES
  ('Appointment Reminder - SMS', 'appointment_reminder', 'sms', NULL,
   'Hi {{patient_name}}, this is a reminder of your appointment on {{appointment_date}} at {{appointment_time}} with {{provider_name}}. Reply YES to confirm or call us to reschedule.',
   ARRAY['patient_name', 'appointment_date', 'appointment_time', 'provider_name'], TRUE),

  ('Assessment Request - SMS', 'assessment_request', 'sms', NULL,
   'Hi {{patient_name}}, please complete your health questionnaire: {{assessment_link}} It takes about {{estimated_time}} minutes. Thank you!',
   ARRAY['patient_name', 'assessment_link', 'estimated_time'], TRUE),

  ('Appointment Reminder - Email', 'appointment_reminder', 'email', 'Appointment Reminder: {{appointment_date}}',
   E'Dear {{patient_name}},\n\nThis is a friendly reminder of your upcoming appointment:\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nProvider: {{provider_name}}\nLocation: {{location_address}}\n\nPlease arrive 15 minutes early and bring your insurance card and ID.\n\nIf you need to reschedule, please call us at {{clinic_phone}} or reply to this email.\n\nBest regards,\n{{clinic_name}}',
   ARRAY['patient_name', 'appointment_date', 'appointment_time', 'provider_name', 'location_address', 'clinic_phone', 'clinic_name'], TRUE),

  ('Assessment Request - Email', 'assessment_request', 'email', 'Please Complete Your Health Questionnaire',
   E'Dear {{patient_name}},\n\nAs part of your care plan, we need you to complete a brief health questionnaire.\n\nClick here to get started: {{assessment_link}}\n\nThis questionnaire takes approximately {{estimated_time}} minutes and helps us provide you with the best possible care.\n\nIf you have any questions, please don''t hesitate to contact us.\n\nBest regards,\n{{clinic_name}}',
   ARRAY['patient_name', 'assessment_link', 'estimated_time', 'clinic_name'], TRUE),

  ('Care Plan Update - Email', 'care_plan_update', 'email', 'Your Care Plan Has Been Updated',
   E'Dear {{patient_name}},\n\nYour care plan has been updated by {{provider_name}}.\n\nSummary of changes:\n{{update_summary}}\n\nYou can view your full care plan by logging into your patient portal: {{portal_link}}\n\nIf you have any questions, please don''t hesitate to contact us.\n\nBest regards,\n{{clinic_name}}',
   ARRAY['patient_name', 'provider_name', 'update_summary', 'portal_link', 'clinic_name'], TRUE)

ON CONFLICT DO NOTHING;
