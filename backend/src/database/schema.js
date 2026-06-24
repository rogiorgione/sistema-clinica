const { run, get, all } = require('./connection');
const { hashPassword } = require('../auth');

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      phone_whatsapp TEXT,
      email TEXT,
      birth_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pendente',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS financial_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      budget_id INTEGER,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      due_date TEXT,
      payment_date TEXT,
      status TEXT NOT NULL DEFAULT 'pendente',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      procedure TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'agendado',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'leitura', active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT NOT NULL, module TEXT NOT NULL,
    details TEXT, ip TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS module_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, module_key TEXT NOT NULL, title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo', content TEXT NOT NULL DEFAULT '{}', created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`);


  await run(`CREATE TABLE IF NOT EXISTS marketing_content_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    week TEXT,
    channel TEXT NOT NULL DEFAULT 'Instagram',
    content_type TEXT NOT NULL DEFAULT 'Reels',
    category TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    caption TEXT,
    cta TEXT,
    hashtags TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_captions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    caption TEXT NOT NULL,
    cta TEXT,
    hashtags TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_reels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    hook TEXT NOT NULL,
    script TEXT NOT NULL,
    cta TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 30,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    script TEXT NOT NULL,
    cta TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    metric_date TEXT NOT NULL,
    reach INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    followers INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_crm_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    phone_whatsapp TEXT,
    source TEXT,
    campaign TEXT,
    interest TEXT,
    status TEXT NOT NULL DEFAULT 'Novo lead',
    stage TEXT NOT NULL DEFAULT 'Novo lead',
    notes TEXT,
    next_contact_date TEXT,
    last_contact_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await addColumnIfMissing('marketing_crm_leads', 'phone_whatsapp', 'TEXT');
  await addColumnIfMissing('marketing_crm_leads', 'campaign', 'TEXT');
  await addColumnIfMissing('marketing_crm_leads', 'status', "TEXT NOT NULL DEFAULT 'Novo lead'");
  await addColumnIfMissing('marketing_crm_leads', 'last_contact_at', 'TEXT');
  await run(`UPDATE marketing_crm_leads SET phone_whatsapp = COALESCE(phone_whatsapp, phone) WHERE phone_whatsapp IS NULL`);
  await run(`UPDATE marketing_crm_leads SET status = COALESCE(NULLIF(status, ''), NULLIF(stage, ''), 'Novo lead'), stage = COALESCE(NULLIF(stage, ''), NULLIF(status, ''), 'Novo lead')`);
  await run(`UPDATE marketing_crm_leads SET status = 'Novo lead', stage = 'Novo lead' WHERE status = 'Novo Lead' OR stage = 'Novo Lead'`);
  await run(`UPDATE marketing_crm_leads SET status = 'Avaliação marcada', stage = 'Avaliação marcada' WHERE status = 'Avaliação Marcada' OR stage = 'Avaliação Marcada'`);

  await run(`CREATE TABLE IF NOT EXISTS marketing_lead_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_campaign_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internal_code TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL,
    treatment TEXT,
    responsible TEXT,
    status TEXT NOT NULL DEFAULT 'Ativa',
    cost REAL NOT NULL DEFAULT 0,
    observations TEXT,
    future_integration TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await addColumnIfMissing('marketing_campaign_links', 'cost', 'REAL NOT NULL DEFAULT 0');
  await addColumnIfMissing('marketing_campaign_links', 'future_integration', 'TEXT');
  await addColumnIfMissing('marketing_crm_leads', 'campaign_code', 'TEXT');

  await run(`CREATE TABLE IF NOT EXISTS marketing_commercial_agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_name TEXT NOT NULL,
    contact_date TEXT NOT NULL,
    contact_time TEXT,
    channel TEXT NOT NULL DEFAULT 'WhatsApp',
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_whatsapp_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS crm_pipeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'Instagram',
    budget REAL NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Ativa',
    start_date TEXT,
    end_date TEXT,
    objective TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    phone_whatsapp TEXT,
    email TEXT,
    source TEXT,
    campaign_id INTEGER,
    interest TEXT,
    pipeline_stage TEXT NOT NULL DEFAULT 'Novo lead',
    status TEXT NOT NULL DEFAULT 'Novo lead',
    temperature TEXT NOT NULL DEFAULT 'Morno',
    estimated_value REAL NOT NULL DEFAULT 0,
    notes TEXT,
    next_contact_date TEXT,
    last_contact_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES crm_campaigns(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    due_time TEXT,
    priority TEXT NOT NULL DEFAULT 'Média',
    status TEXT NOT NULL DEFAULT 'Pendente',
    automatic INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_objections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    category TEXT NOT NULL DEFAULT 'Preço',
    objection TEXT NOT NULL,
    suggested_response TEXT,
    status TEXT NOT NULL DEFAULT 'Aberta',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_followups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    task_id INTEGER,
    channel TEXT NOT NULL DEFAULT 'WhatsApp',
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    message TEXT,
    result TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES crm_tasks(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    campaign_id INTEGER,
    treatment TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Fechada',
    sale_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES crm_campaigns(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    type TEXT NOT NULL DEFAULT 'followup',
    title TEXT NOT NULL,
    message TEXT,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'Não lida',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS crm_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_leads INTEGER NOT NULL DEFAULT 0,
    converted_leads INTEGER NOT NULL DEFAULT 0,
    conversion_rate REAL NOT NULL DEFAULT 0,
    revenue REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await seedCrm();

  await run(`CREATE TABLE IF NOT EXISTS content_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS content_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER NOT NULL,
    week TEXT NOT NULL,
    month TEXT NOT NULL,
    format TEXT NOT NULL,
    category TEXT NOT NULL,
    theme TEXT,
    hook TEXT NOT NULL,
    script TEXT NOT NULL,
    caption TEXT NOT NULL,
    cta TEXT NOT NULL,
    hashtags TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_number, format)
  )`);
  await run(`CREATE TABLE IF NOT EXISTS content_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_date TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    week TEXT NOT NULL,
    month TEXT NOT NULL,
    platform TEXT NOT NULL,
    format TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    idea_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scheduled_date, platform, format),
    FOREIGN KEY (idea_id) REFERENCES content_ideas(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS content_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER,
    title TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    week TEXT NOT NULL,
    month TEXT NOT NULL,
    platform TEXT NOT NULL,
    format TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    hook TEXT NOT NULL,
    script TEXT NOT NULL,
    caption TEXT NOT NULL,
    cta TEXT NOT NULL,
    hashtags TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    integration_target TEXT,
    external_post_id TEXT,
    notes TEXT,
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, platform),
    FOREIGN KEY (idea_id) REFERENCES content_ideas(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS content_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    platform TEXT NOT NULL,
    metric_date TEXT NOT NULL,
    reach INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    saves INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES content_posts(id) ON DELETE SET NULL
  )`);

  for (const table of ['ai_prompts', 'ai_reels', 'ai_stories', 'ai_campaigns', 'ai_whatsapp', 'ai_hooks', 'ai_responses']) {
    await run(`CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      prompt TEXT,
      content TEXT NOT NULL,
      cta TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(title, category)
    )`);
  }

  await seedMarketing();
  await seedContentCalendar();
  await seedLeadCapture();
  await seedAiAssistant();



  await run(`CREATE TABLE IF NOT EXISTS appointment_waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    patient_name TEXT NOT NULL,
    phone_whatsapp TEXT,
    requested_from TEXT NOT NULL,
    requested_to TEXT,
    procedure TEXT NOT NULL DEFAULT 'Consulta',
    priority INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Aguardando',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS appointment_automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    automation_type TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'WhatsApp',
    scheduled_at TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    message TEXT NOT NULL,
    official_integration TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    target_amount REAL NOT NULL DEFAULT 0,
    current_amount REAL NOT NULL DEFAULT 0,
    target_date TEXT,
    category TEXT NOT NULL DEFAULT 'Faturamento',
    status TEXT NOT NULL DEFAULT 'Ativa',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS financial_installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    budget_id INTEGER,
    description TEXT NOT NULL,
    installment_number INTEGER NOT NULL DEFAULT 1,
    total_installments INTEGER NOT NULL DEFAULT 1,
    amount REAL NOT NULL DEFAULT 0,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS document_center (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'Contrato',
    local_path TEXT,
    signature_status TEXT NOT NULL DEFAULT 'Pendente',
    signature_provider TEXT NOT NULL DEFAULT 'Local',
    content TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS marketing_automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    trigger_event TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'WhatsApp',
    status TEXT NOT NULL DEFAULT 'Ativa',
    message_template TEXT NOT NULL,
    official_integration TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await seedPremiumOs();

  await initializeEnterprisePhase();

  await initializeTrafficAndSocial();
  await initializeEnterpriseSaas();
  await initializeEnterpriseDayModules();

  const administrator = await get('SELECT id FROM users WHERE email = ?', ['admin@belleart.local']);
  if (!administrator) await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Administrador BELLEART', 'admin@belleart.local', hashPassword(process.env.ADMIN_PASSWORD || 'admin123'), 'administrador']);
}

async function initializeEnterprisePhase() {
  await run(`CREATE TABLE IF NOT EXISTS patient_clinical_records (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, record_type TEXT NOT NULL DEFAULT 'histórico clínico', title TEXT NOT NULL, description TEXT, professional TEXT, record_date TEXT NOT NULL DEFAULT CURRENT_DATE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)`);
  await run(`CREATE TABLE IF NOT EXISTS patient_odontograms (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, tooth TEXT NOT NULL, condition TEXT NOT NULL DEFAULT 'saudável', treatment_plan TEXT, status TEXT NOT NULL DEFAULT 'planejado', notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)`);
  await run(`CREATE TABLE IF NOT EXISTS patient_media (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, media_type TEXT NOT NULL DEFAULT 'foto', title TEXT NOT NULL, file_path TEXT, document_type TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)`);
  await run(`CREATE TABLE IF NOT EXISTS patient_treatments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'planejado', start_date TEXT, end_date TEXT, estimated_amount REAL NOT NULL DEFAULT 0, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE)`);
  await run(`CREATE TABLE IF NOT EXISTS enterprise_backups (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE, backup_type TEXT NOT NULL DEFAULT 'SQLite', status TEXT NOT NULL DEFAULT 'Preparado', storage_path TEXT, restored_at TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS enterprise_subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, clinic_name TEXT NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'Enterprise', seats INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'Preparado', billing_cycle TEXT NOT NULL DEFAULT 'mensal', notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS enterprise_dashboards (id INTEGER PRIMARY KEY AUTOINCREMENT, dashboard_key TEXT NOT NULL UNIQUE, title TEXT NOT NULL, audience TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Ativo', notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  for (const item of [['clinic','Dashboard Clínica','Gestão clínica'],['marketing','Dashboard Marketing','Marketing'],['crm','Dashboard CRM','Comercial'],['financial','Dashboard Financeiro','Financeiro'],['whatsapp','Dashboard WhatsApp','Atendimento'],['premium','Dashboard Premium','Diretoria']]) await run('INSERT OR IGNORE INTO enterprise_dashboards (dashboard_key,title,audience,notes) VALUES (?,?,?,?)', [...item, 'Estrutura enterprise aditiva para indicadores reais.']);
  await run('INSERT OR IGNORE INTO enterprise_backups (title, backup_type, status, storage_path, notes) VALUES (?, ?, ?, ?, ?)', ['Rotina automática SQLite', 'SQLite', 'Preparado', 'local://database.sqlite', 'Base preparada para backup, restauração e exportação sem apagar dados.']);
  await run('INSERT OR IGNORE INTO enterprise_subscriptions (clinic_name, plan, seats, status, notes) VALUES (?, ?, ?, ?, ?)', ['BELLEART Clínica Matriz', 'Enterprise', 10, 'Preparado', 'Arquitetura futura para multiusuário, multiclínicas e SaaS.']);
}


async function initializeEnterpriseSaas() {
  const genericTables = [
    'clinical_records','clinical_evolutions','clinical_odontogram','clinical_anamnesis','clinical_treatment_plans','clinical_photos','clinical_attachments','clinical_prescriptions','clinical_certificates','clinical_consent_terms',
    'appointment_confirmations','appointment_no_shows','appointment_reschedules','appointment_reminders','professional_schedules','google_calendar_links',
    'enterprise_leads','enterprise_lead_history','enterprise_lead_tasks','enterprise_lead_scores','enterprise_lead_sources','enterprise_lead_campaigns',
    'finance_cashflow','finance_revenues','finance_expenses','finance_accounts_payable','finance_accounts_receivable','finance_installments','finance_overdue','finance_goals','finance_commissions','finance_professional_production','finance_forecasts','finance_dre',
    'marketing_posts','marketing_creatives','marketing_assets','marketing_hashtags','marketing_content_rankings','marketing_campaign_rankings','marketing_roi_reports',
    'whatsapp_conversations','whatsapp_contacts','whatsapp_labels','whatsapp_responsibles','whatsapp_business_settings','whatsapp_webhook_events',
    'ai_agents','ai_tasks','ai_outputs','ai_recommendations','ai_lead_scores','ai_content_generations','ai_report_generations','ai_prompt_library',
    'documents','document_templates','document_signatures','document_patient_links','document_exports',
    'automation_rules','automation_triggers','automation_actions','automation_logs','automation_queue',
    'reports','report_templates','report_exports','report_schedules',
    'backup_jobs','backup_files','backup_logs','system_health','security_events',
    'saas_clinics','saas_units','saas_plans','saas_subscriptions','saas_licenses','saas_limits','saas_billing'
  ];
  for (const table of genericTables) {
    await run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Preparado', payload TEXT NOT NULL DEFAULT '{}', created_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL)`);
  }
  await run(`CREATE TABLE IF NOT EXISTS advanced_appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, professional_id INTEGER, room_id INTEGER, title TEXT NOT NULL DEFAULT 'Consulta', start_at TEXT NOT NULL, end_at TEXT, status TEXT NOT NULL DEFAULT 'agendado', payload TEXT NOT NULL DEFAULT '{}', created_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS appointment_rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'Ativa', payload TEXT NOT NULL DEFAULT '{}', created_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS enterprise_pipeline_stages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'Ativa', position INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL DEFAULT '{}', created_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL)`);
  for (const [index, stage] of ['Novo lead','Primeiro contato','Avaliação agendada','Avaliação realizada','Orçamento entregue','Negociação','Fechado','Perdido'].entries()) {
    await run('INSERT OR IGNORE INTO enterprise_pipeline_stages (title, position, payload) VALUES (?, ?, ?)', [stage, index + 1, JSON.stringify({ kanban: true })]);
  }
  await run('INSERT OR IGNORE INTO appointment_rooms (title, payload) VALUES (?, ?)', ['Sala Clínica 1', JSON.stringify({ prepared_for_multi_room_schedule: true })]);
  await run('INSERT OR IGNORE INTO saas_plans (title, status, payload) VALUES (?, ?, ?)', ['BELLEART Enterprise Local', 'Preparado', JSON.stringify({ local_sqlite: true, future_subscription: true })]);
  await run('INSERT OR IGNORE INTO whatsapp_business_settings (title, status, payload) VALUES (?, ?, ?)', ['WhatsApp Business API Oficial', 'Não conectado', JSON.stringify({ provider: 'Meta Cloud API', stores_passwords: false, requires_authorization: true, token_storage: 'secure_reference_only' })]);
  await run('INSERT OR IGNORE INTO google_calendar_links (title, status, payload) VALUES (?, ?, ?)', ['Google Calendar OAuth', 'Não conectado', JSON.stringify({ oauth: true, stores_passwords: false, official_api: true })]);
}


async function initializeEnterpriseDayModules() {
  const tables = [
    'clinical_records','clinical_odontogram','clinical_evolutions','clinical_anamnesis','clinical_treatment_plans','clinical_photos','clinical_attachments','clinical_prescriptions','clinical_certificates','clinical_consent_terms','clinical_procedure_history',
    'enterprise_leads','enterprise_pipeline_stages','enterprise_lead_history','enterprise_lead_tasks','enterprise_lead_scores','enterprise_lead_sources','enterprise_lead_campaigns',
    'virtual_secretary_tasks','virtual_secretary_alerts','virtual_secretary_suggestions','virtual_secretary_priorities','virtual_secretary_call_queue','virtual_secretary_followups',
    'ai_agents','ai_agent_tasks','ai_agent_outputs','ai_recommendations','ai_lead_scores','ai_content_generations','ai_report_generations','ai_prompt_library',
    'automation_rules','automation_triggers','automation_actions','automation_logs','automation_queue','automation_conditions',
    'backup_jobs','backup_files','backup_logs','system_health','security_events','audit_events'
  ];
  for (const table of tables) {
    await run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Preparado', payload TEXT NOT NULL DEFAULT '{}', created_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL)`);
  }
  for (const [index, stage] of ['Novo Lead','Primeiro contato','Avaliação agendada','Avaliação realizada','Orçamento entregue','Negociação','Fechado','Perdido'].entries()) {
    await run('INSERT OR IGNORE INTO enterprise_pipeline_stages (title, status, payload) VALUES (?, ?, ?)', [stage, 'Ativa', JSON.stringify({ position: index + 1, kanban: true })]);
  }
  const agents = [
    ['Agente Marketing', 'Ativo', { gera: ['Reels','Stories','Carrosséis','Legendas','Anúncios'], official_apis_only: true }],
    ['Agente Comercial', 'Ativo', { foco: ['objeções','follow-ups','classificação de leads','ligações'] }],
    ['Agente Financeiro', 'Ativo', { foco: ['fluxo de caixa','metas','previsão','inadimplência'] }],
    ['Agente Executivo', 'Ativo', { foco: ['resumo do dia','indicadores','prioridades','riscos'] }],
  ];
  for (const [title, status, payload] of agents) await run('INSERT OR IGNORE INTO ai_agents (title, status, payload) VALUES (?, ?, ?)', [title, status, JSON.stringify(payload)]);
  const automations = [
    ['Lead novo → criar tarefa', 'Ativa', { trigger: 'lead_created', action: 'create_task' }],
    ['Orçamento entregue → follow-up em 1 dia', 'Ativa', { trigger: 'budget_delivered', action: 'schedule_followup', delay_days: 1 }],
    ['Paciente faltou → reagendar', 'Ativa', { trigger: 'appointment_missed', action: 'reschedule' }],
    ['Parcela atrasou → notificação', 'Ativa', { trigger: 'installment_overdue', action: 'notify' }],
  ];
  for (const [title, status, payload] of automations) await run('INSERT OR IGNORE INTO automation_rules (title, status, payload) VALUES (?, ?, ?)', [title, status, JSON.stringify(payload)]);
  await run('INSERT OR IGNORE INTO system_health (title, status, payload) VALUES (?, ?, ?)', ['Status geral BELLEART OS', 'Estável', JSON.stringify({ sqlite_preserved: true, pwa_ready: true })]);
  await run('INSERT OR IGNORE INTO backup_jobs (title, status, payload) VALUES (?, ?, ?)', ['Backup manual SQLite', 'Preparado', JSON.stringify({ type: 'sqlite_export', destructive: false })]);
  await run('INSERT OR IGNORE INTO security_events (title, status, payload) VALUES (?, ?, ?)', ['Política de integrações oficiais', 'Ativa', JSON.stringify({ stores_social_passwords: false, oauth_only: true, no_frontend_tokens: true })]);
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function seedCrm() {
  const stages = ['Novo lead', 'Contato feito', 'Avaliação marcada', 'Proposta enviada', 'Negociação', 'Fechado', 'Perdido'];
  for (const [index, stage] of stages.entries()) {
    await run('INSERT OR IGNORE INTO crm_pipeline (name, description, position, active) VALUES (?, ?, ?, ?)', [stage, `Etapa comercial ${stage} da Fase 7.`, index + 1, 1]);
  }
  const count = await get('SELECT COUNT(*) AS total FROM crm_campaigns');
  if (!count.total) {
    await run('INSERT OR IGNORE INTO crm_objections (category, objection, suggested_response, status) VALUES (?, ?, ?, ?)', ['Preço', 'Está caro', 'Explique opções de pagamento, valor do planejamento e convide para avaliação individual.', 'Aberta']);
    await run('INSERT OR IGNORE INTO crm_objections (category, objection, suggested_response, status) VALUES (?, ?, ?, ?)', ['Medo', 'Tenho medo do procedimento', 'Acolha a preocupação, explique as etapas com linguagem simples e reforce a avaliação profissional.', 'Aberta']);
    await run('INSERT INTO crm_campaigns (name, channel, budget, cost, status, objective, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Avaliação de Implantes', 'Instagram', 1000, 0, 'Ativa', 'Gerar avaliações qualificadas', 'Campanha inicial da Central Comercial Inteligente']);
    await run('INSERT INTO crm_campaigns (name, channel, budget, cost, status, objective, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Reativação WhatsApp', 'WhatsApp', 0, 0, 'Ativa', 'Retomar conversas paradas', 'Campanha inicial da Central Comercial Inteligente']);
  }
}

async function seedLeadCapture() {
  for (const source of ['Instagram', 'TikTok', 'Facebook', 'WhatsApp', 'Indicação', 'Panfleto', 'Google', 'Tráfego pago']) {
    await run('INSERT OR IGNORE INTO marketing_lead_sources (name, notes) VALUES (?, ?)', [source, 'Fonte padrão de captação BELLEART']);
  }
  const campaigns = [
    ['IG-IMPLANTES', 'Instagram', 'Implantes', 'Marketing', 'Ativa', 0, 'Link para bio e direct do Instagram', 'Meta Ads'],
    ['TT-ESTETICA', 'TikTok', 'Estética', 'Marketing', 'Ativa', 0, 'Campanha orgânica para vídeos curtos', 'TikTok Ads'],
    ['WA-AVALIACAO', 'WhatsApp', 'Avaliação', 'Recepção', 'Ativa', 0, 'Entrada manual e futura API oficial', 'WhatsApp Business API'],
    ['PANFLETO-QR', 'Panfleto', 'Clínica geral', 'Comercial', 'Ativa', 0, 'Estrutura preparada para QR Code impresso', 'QR Code de panfleto'],
  ];
  for (const campaign of campaigns) {
    await run('INSERT OR IGNORE INTO marketing_campaign_links (internal_code, origin, treatment, responsible, status, cost, observations, future_integration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', campaign);
  }
}

async function seedMarketing() {
  const count = await get('SELECT COUNT(*) AS total FROM marketing_captions');
  if (count.total) return;
  const categories = ['Implantes', 'Prótese Protocolo', 'Ortodontia', 'Botox', 'Harmonização', 'Clareamento'];
  const storyCategories = ['Bastidores', 'Promoções', 'Autoridade', 'Depoimentos'];
  const today = new Date();
  for (let day = 1; day <= 30; day += 1) {
    const category = categories[(day - 1) % categories.length];
    const date = new Date(today); date.setDate(today.getDate() + day - 1);
    const iso = date.toISOString().slice(0, 10);
    await run('INSERT INTO marketing_reels (title, category, hook, script, cta, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)', [`Reel ${day} - ${category}`, category, `Você sabia que ${category.toLowerCase()} pode transformar sorrisos?`, `Mostre uma dúvida frequente, explique em linguagem simples e finalize convidando para avaliação na BELLEART.`, 'Agende sua avaliação pelo WhatsApp.', 35]);
    await run('INSERT INTO marketing_captions (title, category, caption, cta, hashtags) VALUES (?, ?, ?, ?, ?)', [`Legenda ${day} - ${category}`, category, `Conteúdo educativo sobre ${category.toLowerCase()} para ajudar pacientes a decidirem com segurança.`, 'Fale com a BELLEART e agende sua avaliação.', `#BELLEART #Odontologia #${category.replace(/\s/g, '')}`]);
    await run('INSERT INTO marketing_content_calendar (title, publish_date, week, channel, content_type, category, status, caption, cta, hashtags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [`Post dia ${day} - ${category}`, iso, `Semana ${Math.ceil(day / 7)}`, 'Instagram', 'Reels', category, 'Pendente', `Legenda ${day} - ${category}`, 'Enviar mensagem no WhatsApp', `#BELLEART #${category.replace(/\s/g, '')}`]);
    for (let s = 1; s <= 3; s += 1) {
      const storyCategory = storyCategories[(day + s - 2) % storyCategories.length];
      await run('INSERT INTO marketing_stories (title, category, script, cta) VALUES (?, ?, ?, ?)', [`Story ${day}.${s} - ${storyCategory}`, storyCategory, `Story de ${storyCategory.toLowerCase()} com enquete, prova social ou bastidor da clínica.`, 'Responder no direct ou WhatsApp.']);
    }
  }
  for (const platform of ['Instagram', 'TikTok', 'Facebook', 'WhatsApp']) {
    await run('INSERT INTO marketing_metrics (platform, metric_date, reach, views, followers, likes, shares) VALUES (?, ?, ?, ?, ?, ?, ?)', [platform, today.toISOString().slice(0, 10), 0, 0, 0, 0, 0]);
  }
  for (const category of ['Implantes', 'Ortodontia', 'Prótese', 'Reativação', 'Pós-operatório']) {
    await run('INSERT INTO marketing_whatsapp_templates (title, category, message) VALUES (?, ?, ?)', [`Mensagem - ${category}`, category, `Olá! Aqui é da BELLEART. Preparamos uma orientação sobre ${category.toLowerCase()} para você. Podemos te ajudar hoje?`]);
  }
}

async function seedContentCalendar() {
  const categoryNames = ['Implantes', 'Prótese Protocolo', 'Ortodontia', 'Botox', 'Preenchimento', 'Harmonização Facial', 'Clareamento', 'Próteses', 'Limpeza', 'Bastidores', 'Autoridade', 'Depoimentos'];
  const themes = ['Bastidores', 'Antes e depois ético', 'Perguntas frequentes', 'Promoções', 'Autoridade', 'Depoimentos'];
  const platforms = ['Instagram', 'TikTok', 'Facebook', 'WhatsApp'];
  const formats = ['Reels', 'Stories', 'Carrosséis'];
  for (const name of categoryNames) {
    await run('INSERT OR IGNORE INTO content_categories (name, description) VALUES (?, ?)', [name, `Categoria editorial BELLEART para ${name}.`]);
  }
  const count = await get('SELECT COUNT(*) AS total FROM content_ideas');
  if (count.total >= 1095) return;
  const start = new Date('2026-01-01T00:00:00.000Z');
  for (let day = 1; day <= 365; day += 1) {
    const date = new Date(start); date.setUTCDate(start.getUTCDate() + day - 1);
    const scheduledDate = date.toISOString().slice(0, 10);
    const week = `Semana ${Math.ceil(day / 7)}`;
    const month = scheduledDate.slice(0, 7);
    for (const [formatIndex, format] of formats.entries()) {
      const category = categoryNames[(day + formatIndex - 1) % categoryNames.length];
      const theme = themes[(day + formatIndex - 1) % themes.length];
      const platform = platforms[(day + formatIndex - 1) % platforms.length];
      const title = `${format} Dia ${day} — ${category}`;
      const hook = format === 'Stories' ? `Enquete rápida: você já tem dúvida sobre ${category}?` : `O que ninguém te explicou sobre ${category}`;
      const script = `Conteúdo de ${theme.toLowerCase()} sobre ${category}. Explique em linguagem simples, evite promessas de resultado e convide para avaliação individual na BELLEART.`;
      const caption = `${category}: informação segura, acolhedora e ética para ajudar você a cuidar do sorriso. Resultados variam conforme avaliação profissional.`;
      const cta = platform === 'WhatsApp' ? 'Responder esta mensagem para agendar avaliação.' : 'Chame a BELLEART no WhatsApp e agende sua avaliação.';
      const hashtags = `#BELLEART #Odontologia #${category.replace(/\s/g, '')} #${format.replace(/é/g, 'e')}`;
      const duration = format === 'Stories' ? 15 : format === 'Reels' ? 35 : 0;
      await run('INSERT OR IGNORE INTO content_ideas (day_number, week, month, format, category, theme, hook, script, caption, cta, hashtags, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [day, week, month, format, category, theme, hook, script, caption, cta, hashtags, duration]);
      const idea = await get('SELECT id FROM content_ideas WHERE day_number = ? AND format = ?', [day, format]);
      await run('INSERT OR IGNORE INTO content_calendar (scheduled_date, day_number, week, month, platform, format, category, status, idea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [scheduledDate, day, week, month, platform, format, category, day % 11 === 0 ? 'Agendado' : 'Pendente', idea.id]);
      await run('INSERT OR IGNORE INTO content_posts (idea_id, title, scheduled_date, week, month, platform, format, category, status, hook, script, caption, cta, hashtags, duration_seconds, integration_target) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [idea.id, title, scheduledDate, week, month, platform, format, category, day % 29 === 0 ? 'Publicado' : day % 11 === 0 ? 'Agendado' : 'Pendente', hook, script, caption, cta, hashtags, duration, platform]);
    }
  }
  for (const platform of platforms) {
    await run('INSERT INTO content_metrics (post_id, platform, metric_date, reach, views, likes, comments, shares, saves) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [null, platform, new Date().toISOString().slice(0, 10), 0, 0, 0, 0, 0, 0]);
  }
}


async function seedAiAssistant() {
  const resourceConfig = {
    ai_prompts: ['Prompt', 'Crie uma peça educativa e ética sobre {category} para pacientes da BELLEART.'],
    ai_reels: ['Reel', 'Roteiro curto com gancho, explicação simples, prova de autoridade e CTA para avaliação.'],
    ai_stories: ['Story', 'Sequência de 3 stories com enquete, bastidor e chamada para conversa no WhatsApp.'],
    ai_campaigns: ['Campanha', 'Campanha multicanal com objetivo, público, promessa ética, canais e acompanhamento.'],
    ai_whatsapp: ['WhatsApp', 'Mensagem acolhedora para iniciar ou retomar conversa sem pressão comercial.'],
    ai_hooks: ['Gancho', 'Gancho de abertura para vídeo curto com curiosidade e linguagem simples.'],
    ai_responses: ['Resposta', 'Resposta para dúvida frequente com clareza, segurança e convite para avaliação individual.'],
  };
  const categories = ['Implantes', 'Ortodontia', 'Botox', 'Preenchimento', 'Clareamento', 'Próteses'];
  const angles = ['dúvidas frequentes', 'mitos e verdades', 'cuidados antes do tratamento', 'cuidados depois do tratamento', 'benefícios percebidos', 'medos comuns', 'avaliação inicial', 'planejamento personalizado', 'tecnologia da clínica', 'segurança do paciente', 'bastidores', 'depoimento ético', 'comparação educativa', 'checklist', 'sinais de alerta', 'manutenção', 'tempo de tratamento', 'investimento consciente', 'perguntas para o dentista', 'convite para avaliação'];
  for (const [table, [prefix, basePrompt]] of Object.entries(resourceConfig)) {
    const count = await get(`SELECT COUNT(*) AS total FROM ${table}`);
    if (count.total >= categories.length * angles.length) continue;
    for (const category of categories) {
      for (const [index, angle] of angles.entries()) {
        const title = `${prefix} BELLEART ${category} — ${angle}`;
        const prompt = basePrompt.replace('{category}', category);
        const content = `${prefix} sobre ${category}: abordar ${angle} com linguagem humana, objetiva e ética. Explicar que cada caso precisa de avaliação profissional, evitar promessas de resultado e orientar o paciente a conversar com a equipe BELLEART.`;
        const cta = 'Agende uma avaliação na BELLEART pelo WhatsApp.';
        const notes = `Seed Fase 6 nº ${index + 1} para ${category}.`;
        await run(`INSERT OR IGNORE INTO ${table} (title, category, prompt, content, cta, notes) VALUES (?, ?, ?, ?, ?, ?)`, [title, category, prompt, content, cta, notes]);
      }
    }
  }
}

async function seedPremiumOs() {
  const rules = [
    ['Confirmação automática de consulta', 'appointment_created', 'WhatsApp', 'Ativa', 'Olá, {nome}! Sua consulta na BELLEART está marcada para {data} às {hora}. Pode confirmar presença?', 'WhatsApp Business API'],
    ['Lembrete 24h antes', 'appointment_reminder_24h', 'WhatsApp', 'Ativa', 'Lembrete BELLEART: esperamos você amanhã às {hora}.', 'WhatsApp Business API'],
    ['Reativação de paciente esquecido', 'patient_inactive_90d', 'WhatsApp', 'Ativa', 'Olá, {nome}! Sentimos sua falta. Vamos agendar uma revisão?', 'WhatsApp Business API'],
    ['Nutrição de lead quente', 'hot_lead_detected', 'WhatsApp', 'Ativa', 'Olá, {nome}! Posso te ajudar a escolher um horário para avaliação?', 'WhatsApp Business API'],
  ];
  for (const rule of rules) await run('INSERT OR IGNORE INTO marketing_automation_rules (title, trigger_event, channel, status, message_template, official_integration) VALUES (?, ?, ?, ?, ?, ?)', rule);
  await run('INSERT OR IGNORE INTO financial_goals (title, target_amount, target_date, category, status) VALUES (?, ?, ?, ?, ?)', ['Meta mensal de faturamento BELLEART', 100000, new Date().toISOString().slice(0, 7) + '-28', 'Faturamento', 'Ativa']);
  await run('INSERT OR IGNORE INTO document_center (title, document_type, signature_status, signature_provider, content) VALUES (?, ?, ?, ?, ?)', ['Modelo de contrato odontológico', 'Contrato', 'Modelo', 'Local', 'Modelo local para contrato, termos e assinatura digital futura.']);
}

async function initializeTrafficAndSocial() {
  await run(`CREATE TABLE IF NOT EXISTS ads_platforms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, type TEXT NOT NULL DEFAULT 'paid', status TEXT NOT NULL DEFAULT 'Preparado', official_api TEXT, oauth_scopes TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS ads_campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, platform TEXT NOT NULL, objective TEXT, status TEXT NOT NULL DEFAULT 'Ativa', budget REAL NOT NULL DEFAULT 0, spent REAL NOT NULL DEFAULT 0, start_date TEXT, end_date TEXT, target_audience TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS ads_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, platform TEXT NOT NULL, metric_date TEXT NOT NULL DEFAULT CURRENT_DATE, impressions INTEGER NOT NULL DEFAULT 0, reach INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0, leads INTEGER NOT NULL DEFAULT 0, cost_per_lead REAL NOT NULL DEFAULT 0, scheduled_consultations INTEGER NOT NULL DEFAULT 0, closed_treatments INTEGER NOT NULL DEFAULT 0, revenue_generated REAL NOT NULL DEFAULT 0, roi REAL NOT NULL DEFAULT 0, conversion_rate REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (campaign_id) REFERENCES ads_campaigns(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS ads_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, source TEXT, platform TEXT, campaign_id INTEGER, interest TEXT, status TEXT NOT NULL DEFAULT 'Novo lead', scheduled_consultation INTEGER NOT NULL DEFAULT 0, closed_treatment INTEGER NOT NULL DEFAULT 0, revenue REAL NOT NULL DEFAULT 0, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (campaign_id) REFERENCES ads_campaigns(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS ads_budget (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, platform TEXT, month TEXT NOT NULL, planned_amount REAL NOT NULL DEFAULT 0, spent_amount REAL NOT NULL DEFAULT 0, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (campaign_id) REFERENCES ads_campaigns(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS social_integrations (id INTEGER PRIMARY KEY AUTOINCREMENT, platform TEXT NOT NULL UNIQUE, provider TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Preparado', oauth_authorize_url TEXT, oauth_scopes TEXT, webhook_url TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS social_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, integration_id INTEGER, platform TEXT NOT NULL, account_name TEXT NOT NULL, account_external_id TEXT, status TEXT NOT NULL DEFAULT 'Preparado', permissions TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (integration_id) REFERENCES social_integrations(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS social_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, integration_id INTEGER, account_id INTEGER, token_type TEXT NOT NULL DEFAULT 'Bearer', access_token TEXT, refresh_token TEXT, expires_at TEXT, scopes TEXT, status TEXT NOT NULL DEFAULT 'Preparado', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (integration_id) REFERENCES social_integrations(id) ON DELETE SET NULL, FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS social_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, platform TEXT NOT NULL, title TEXT NOT NULL, content TEXT, media_url TEXT, status TEXT NOT NULL DEFAULT 'Rascunho', scheduled_at TEXT, published_at TEXT, external_post_id TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS social_post_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, platform TEXT NOT NULL, metric_date TEXT NOT NULL DEFAULT CURRENT_DATE, impressions INTEGER NOT NULL DEFAULT 0, reach INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0, comments INTEGER NOT NULL DEFAULT 0, shares INTEGER NOT NULL DEFAULT 0, saves INTEGER NOT NULL DEFAULT 0, leads INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS social_webhooks (id INTEGER PRIMARY KEY AUTOINCREMENT, integration_id INTEGER, platform TEXT NOT NULL, event_type TEXT NOT NULL, callback_url TEXT, verify_token_hint TEXT, status TEXT NOT NULL DEFAULT 'Preparado', last_payload TEXT, last_received_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (integration_id) REFERENCES social_integrations(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS api_credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, provider TEXT NOT NULL, app_id TEXT, app_secret TEXT, client_id TEXT, client_secret TEXT, redirect_uri TEXT, scopes TEXT, status TEXT NOT NULL DEFAULT 'Preparado', notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(provider))`);
  await seedTrafficAndSocial();
}

async function seedTrafficAndSocial() {
  const platforms = [
    ['Instagram','paid','Preparado','Instagram Graph API','instagram_basic,instagram_manage_insights,pages_show_list','OAuth oficial Meta/Instagram sem senhas.'],
    ['Facebook','paid','Preparado','Meta Graph API, Facebook Pages API, Meta Marketing API','pages_show_list,pages_read_engagement,ads_read,ads_management','OAuth oficial Meta/Facebook sem senhas.'],
    ['TikTok','paid','Preparado','TikTok Content Posting API, TikTok Business API','user.info.basic,video.publish,business.basic','OAuth oficial TikTok sem senhas.'],
    ['Google Ads','paid','Preparado','Google Ads API','https://www.googleapis.com/auth/adwords','OAuth oficial Google sem senhas.'],
    ['WhatsApp','owned','Preparado','WhatsApp Business API','whatsapp_business_management,whatsapp_business_messaging','Token oficial da Meta Cloud API.'],
    ['Indicação','organic','Ativa','Manual','','Origem manual.'], ['Site','organic','Ativa','Formulário do site','','Origem manual/site.'], ['Panfleto','offline','Ativa','QR Code','','Origem offline.']
  ];
  for (const item of platforms) await run('INSERT OR IGNORE INTO ads_platforms (name,type,status,official_api,oauth_scopes,notes) VALUES (?,?,?,?,?,?)', item);
  for (const item of platforms.slice(0,5)) await run('INSERT OR IGNORE INTO social_integrations (platform,provider,status,oauth_scopes,notes) VALUES (?,?,?,?,?)', [item[0], item[3], 'Preparado', item[4], item[5]]);
  for (const provider of ['Meta Graph API','Instagram Graph API','Facebook Pages API','Meta Marketing API','TikTok Content Posting API','TikTok Business API','Google Ads API','WhatsApp Business API']) await run('INSERT OR IGNORE INTO api_credentials (provider,status,notes) VALUES (?,?,?)', [provider, 'Preparado', 'Cadastrar app_id/app_secret/client_id e tokens oficiais. Nunca armazenar senhas de redes sociais.']);
  const count = await get('SELECT COUNT(*) AS total FROM ads_campaigns');
  if (!count.total) {
    const names = ['Implantes Premium','Prótese Protocolo','Ortodontia','Botox','Clareamento','Harmonização Facial'];
    const plats = ['Instagram','Facebook','TikTok','Google Ads','Instagram','Facebook'];
    for (let i=0;i<names.length;i+=1) {
      const result = await run('INSERT INTO ads_campaigns (name,platform,objective,status,budget,spent,start_date,target_audience,notes) VALUES (?,?,?,?,?,?,?,?,?)', [names[i], plats[i], 'Gerar leads qualificados', 'Ativa', 1000 + i*250, 200 + i*75, new Date().toISOString().slice(0,10), 'Pacientes odontológicos', 'Seed Fase 8']);
      await run('INSERT INTO ads_metrics (campaign_id,platform,metric_date,impressions,reach,clicks,leads,cost_per_lead,scheduled_consultations,closed_treatments,revenue_generated,roi,conversion_rate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [result.id, plats[i], new Date().toISOString().slice(0,10), 10000+i*1000, 7000+i*800, 300+i*30, 20+i*3, 10+i, 5+i, 1+i%3, 5000+i*1200, 100, 8+i]);
    }
  }
}

module.exports = initializeDatabase;
