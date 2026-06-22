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

  await seedMarketing();

  const administrator = await get('SELECT id FROM users WHERE email = ?', ['admin@belleart.local']);
  if (!administrator) await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Administrador BELLEART', 'admin@belleart.local', hashPassword(process.env.ADMIN_PASSWORD || 'admin123'), 'administrador']);
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
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

module.exports = initializeDatabase;
