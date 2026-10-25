import { getProDatabase } from '../db/pro-database.js';
import { flowService } from './flow-engine.js';
import { templatesService } from './templates.js';

const SEED_VERSION = '2';

function node(id: string, type: string, x: number, y: number, data: Record<string, any> = {}) {
  return { id, type, position: { x, y }, data: { label: type.replace(/_/g, ' '), ...data } };
}
function edge(id: string, source: string, target: string, sourceHandle?: string) {
  return { id, source, target, ...(sourceHandle ? { sourceHandle } : {}) };
}

/** Seed editable, business-neutral templates. All copy and trigger values are safe to customize in Flow Builder. */
export function seedBuiltinData(): void {
  const db = getProDatabase();
  db.exec("CREATE TABLE IF NOT EXISTS _pro_meta (key TEXT PRIMARY KEY, value TEXT)");
  const seededVersion = (db.prepare("SELECT value FROM _pro_meta WHERE key = 'flow_seed_version'").get() as any)?.value;
  if (seededVersion === SEED_VERSION) return;

  const oldNames = [
    'Welcome Bot', 'Auto-Reply (Away)', 'AI Support Agent', 'Lead Capture', 'Feedback Collector',
    'Urgent Message Router', 'Unsubscribe Handler', 'Re-subscribe Handler', 'AI Chatbot', 'Business Hours Info',
  ];
  for (const name of oldNames) db.prepare('DELETE FROM pro_flows WHERE name = ?').run(name);

  const templates = [
    { name: 'Welcome Menu', category: 'greeting', body: 'Hi {{name}}! Welcome. Reply 1 for Services, 2 for Pricing, 3 for Support, or 0 for a human.' },
    { name: 'Lead Summary', category: 'sales', body: 'Thanks {{name}}. We recorded your {{business}} inquiry and will follow up on {{phone}}.' },
    { name: 'Human Handoff', category: 'support', body: 'A team member has been requested. Please keep this chat open; we will reply during business hours.' },
    { name: 'Business Hours', category: 'support', body: 'Our business hours are Monday-Friday, 9:00 AM-6:00 PM. We will reply next business day.' },
    { name: 'Order Update', category: 'notification', body: 'Your order {{order_id}} is currently {{order_status}}. Reply SUPPORT if you need help.' },
  ];
  for (const template of templates) {
    try { templatesService.create(template); } catch { /* existing template */ }
  }

  const flows = [
    {
      name: 'Welcome & Interactive Menu', description: 'Greeting menu for services, pricing, support, and human help.', trigger_type: 'keyword', trigger_config: { keywords: ['hi', 'hello', 'hey', 'start', 'menu'] }, priority: 10,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Greeting keyword' }), node('m1', 'send_buttons', 250, 120, { label: 'Welcome menu', message: 'Hi {{sender_number}}! Welcome. Choose an option:\n\n1. Services\n2. Pricing\n3. Support\n0. Human agent', buttons: ['Services', 'Pricing', 'Support', 'Human agent'] })], edges: [edge('e1', 't1', 'm1')],
    },
    {
      name: 'AI Auto-Reply by Language', description: 'Replies in the customer language when AI is requested.', trigger_type: 'keyword', trigger_config: { keywords: ['ask', 'question', 'help', 'ai'] }, priority: 20,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'AI request' }), node('a1', 'ai_reply', 250, 120, { label: 'Language-aware AI', systemPrompt: 'Detect the customer language and answer in that language. Be concise, helpful, and professional.' })], edges: [edge('e1', 't1', 'a1')],
    },
    {
      name: 'Services Inquiry', description: 'Routes website, software, app, and maintenance inquiries.', trigger_type: 'keyword', trigger_config: { keywords: ['website', 'software', 'app', 'application', 'maintenance', 'service'] }, priority: 30,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Services keywords' }), node('m1', 'send_message', 250, 120, { label: 'Services menu', message: 'We can help with websites, software, mobile apps, and maintenance. Reply with the service you need and your target timeline.' }), node('tag1', 'add_tag', 250, 240, { label: 'Tag service inquiry', tag: 'service-inquiry' })], edges: [edge('e1', 't1', 'm1'), edge('e2', 'm1', 'tag1')],
    },
    {
      name: 'Lead Collection', description: 'Collects name, phone, business, and project details.', trigger_type: 'keyword', trigger_config: { keywords: ['quote', 'pricing', 'demo', 'interested', 'project'] }, priority: 40,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Lead keyword' }), node('m1', 'send_message', 250, 110, { label: 'Ask name', message: 'Great. What is your name?' }), node('w1', 'wait_for_reply', 250, 210, { label: 'Wait for name' }), node('v1', 'set_variable', 250, 310, { label: 'Save name', variable: 'name', value: '{{message}}' }), node('m2', 'send_message', 250, 410, { label: 'Ask business', message: 'Thanks {{name}}. What is your business or company name?' }), node('w2', 'wait_for_reply', 250, 510, { label: 'Wait for business' }), node('v2', 'set_variable', 250, 610, { label: 'Save business', variable: 'business', value: '{{message}}' }), node('tag1', 'add_tag', 250, 710, { label: 'Mark lead', tag: 'lead' })], edges: [edge('e1', 't1', 'm1'), edge('e2', 'm1', 'w1'), edge('e3', 'w1', 'v1'), edge('e4', 'v1', 'm2'), edge('e5', 'm2', 'w2'), edge('e6', 'w2', 'v2'), edge('e7', 'v2', 'tag1')],
    },
    {
      name: 'Human Handoff', description: 'Pauses bot handling and marks the conversation for an admin.', trigger_type: 'keyword', trigger_config: { keywords: ['human', 'agent', 'admin', 'representative'] }, priority: 5,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Human request' }), node('h1', 'human_handoff', 250, 120, { label: 'Pause bot and notify admin', message: 'A human agent has been requested. We will get back to you shortly.' })], edges: [edge('e1', 't1', 'h1')],
    },
    {
      name: 'VIP Contact Rules', description: 'Adds VIP tag and applies special routing for selected contacts.', trigger_type: 'keyword', trigger_config: { keywords: ['vip', 'priority'] }, priority: 1,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'VIP trigger' }), node('tag1', 'add_tag', 250, 120, { label: 'VIP tag', tag: 'vip' }), node('m1', 'send_message', 250, 240, { label: 'VIP acknowledgement', message: 'Your request has priority handling. A team member will assist you shortly.' })], edges: [edge('e1', 't1', 'tag1'), edge('e2', 'tag1', 'm1')],
    },
    {
      name: 'Business Hours Reply', description: 'Sends a configurable business-hours message and tags out-of-hours requests.', trigger_type: 'message', trigger_config: {}, priority: 90,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Any message' }), node('bh1', 'business_hours', 250, 120, { label: 'Check business hours', timezone: 'Asia/Dhaka', schedule: 'Mon-Fri 09:00-18:00' }), node('m1', 'send_message', 250, 240, { label: 'Hours reply', message: 'Thanks for your message. Our team will respond during business hours.' })], edges: [edge('e1', 't1', 'bh1'), edge('e2', 'bh1', 'm1')],
    },
    {
      name: 'Follow-up Reminder', description: 'Tags a lead and schedules a configurable follow-up request.', trigger_type: 'keyword', trigger_config: { keywords: ['follow up', 'reminder', 'later'] }, priority: 60,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Follow-up keyword' }), node('tag1', 'add_tag', 250, 120, { label: 'Follow-up lead', tag: 'follow-up' }), node('f1', 'follow_up', 250, 240, { label: 'Schedule follow-up', delay_hours: 24, message: 'Following up on your request. Are you ready to continue?' })], edges: [edge('e1', 't1', 'tag1'), edge('e2', 'tag1', 'f1')],
    },
    {
      name: 'Order Status', description: 'Captures an order ID and returns a configurable status message.', trigger_type: 'keyword', trigger_config: { keywords: ['order', 'delivery', 'tracking', 'status'] }, priority: 50,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Order keyword' }), node('m1', 'send_message', 250, 120, { label: 'Ask order ID', message: 'Please send your order ID so we can check the status.' }), node('w1', 'wait_for_reply', 250, 220, { label: 'Wait for order ID' }), node('o1', 'order_status', 250, 320, { label: 'Lookup order', status_endpoint: '' })], edges: [edge('e1', 't1', 'm1'), edge('e2', 'm1', 'w1'), edge('e3', 'w1', 'o1')],
    },
    {
      name: 'Opt-in Broadcast', description: 'Marks a contact as opted in for future broadcasts.', trigger_type: 'exact', trigger_config: { text: 'subscribe' }, priority: 2,
      nodes: [node('t1', 'trigger', 250, 0, { label: 'Exact subscribe' }), node('b1', 'broadcast_optin', 250, 120, { label: 'Record opt-in' }), node('m1', 'send_message', 250, 240, { label: 'Opt-in confirmation', message: 'You are subscribed to updates. Reply STOP anytime to opt out.' })], edges: [edge('e1', 't1', 'b1'), edge('e2', 'b1', 'm1')],
    },
  ];

  for (const flow of flows) {
    try { flowService.create({ ...flow, status: 'draft', dedupe_window_seconds: 30 } as any); } catch { /* keep startup resilient */ }
  }
  db.prepare("INSERT OR REPLACE INTO _pro_meta (key, value) VALUES ('flow_seed_version', ?)").run(SEED_VERSION);
}
