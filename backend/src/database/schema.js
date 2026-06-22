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

  const administrator = await get('SELECT id FROM users WHERE email = ?', ['admin@belleart.local']);
  if (!administrator) await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Administrador BELLEART', 'admin@belleart.local', hashPassword(process.env.ADMIN_PASSWORD || 'admin123'), 'administrador']);
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
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

module.exports = initializeDatabase;
