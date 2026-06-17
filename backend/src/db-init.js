import { pool } from './config/db.js';

const ddlFolders = `
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(50) DEFAULT '#185FA5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const ddlLeads = `
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    segment VARCHAR(50) NOT NULL DEFAULT 'OEM',
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(255),
    city VARCHAR(255),
    notes TEXT,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const ddlNotes = `
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    lead_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const alterLeads = `
ALTER TABLE leads ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL;
`;

const alterNotes = `
ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL;
`;

const initialFolders = [
  { name: 'High Priority', color: '#ef4444' },
  { name: 'Q3 Campaigns', color: '#10b981' },
  { name: 'Partner Outreach', color: '#8b5cf6' }
];

const initialLeads = [
  {
    name: 'Rahul Sharma',
    company: 'Tata Motors',
    segment: 'OEM',
    status: 'New',
    email: 'rahul.sharma@tatamotors.com',
    phone: '+91 98765 43210',
    job_title: 'Sourcing Manager',
    city: 'Pune',
    notes: 'Outreached via LinkedIn. Awaiting connection acceptance.',
    folderName: 'High Priority'
  },
  {
    name: 'Ananya Rao',
    company: 'L&T Construction',
    segment: 'EPC',
    status: 'Contacted',
    email: 'ananya.rao@lntecc.com',
    phone: '+91 91234 56789',
    job_title: 'Procurement Lead',
    city: 'Bengaluru',
    notes: 'Sent Email 1. Had a brief chat, they are evaluating vendors for a new solar mounting structural project.',
    folderName: 'Q3 Campaigns'
  },
  {
    name: 'Vikram Mehta',
    company: 'Studio Form Architects',
    segment: 'Architecture',
    status: 'Qualified',
    email: 'vikram@studioform.in',
    phone: '+91 99887 76655',
    job_title: 'Principal Architect',
    city: 'Mumbai',
    notes: 'Needs custom metal cladding screens for a commercial project. Qualified budget and timeline.',
    folderName: 'Partner Outreach'
  },
  {
    name: 'Prakash Patel',
    company: 'Gujarat Heavy Industries',
    segment: 'Factory',
    status: 'Proposal',
    email: 'p.patel@ghi.co.in',
    phone: '+91 88776 65544',
    job_title: 'Plant Operations Head',
    city: 'Ahmedabad',
    notes: 'Sent quote for custom jigs & fixtures. Price details shared on Monday.',
    folderName: 'High Priority'
  },
  {
    name: 'Col. K. Singh',
    company: 'Alpha Defence Systems',
    segment: 'Defence',
    status: 'Won',
    email: 'k.singh@alphadefence.in',
    phone: '+91 77665 54433',
    job_title: 'Director of Procurement',
    city: 'New Delhi',
    notes: 'Purchase Order received for precision enclosures. Production batch in planning phase.',
    folderName: ''
  },
  {
    name: 'Siddharth Nair',
    company: 'Zenith Elevators',
    segment: 'OEM',
    status: 'Lost',
    email: 's.nair@zenithelevators.com',
    phone: '+91 90123 45678',
    job_title: 'Purchase Executive',
    city: 'Chennai',
    notes: 'Lost to a local competitor offering 15% lower price.',
    folderName: ''
  },
  {
    name: 'Meera Deshmukh',
    company: 'Vanguard Infra',
    segment: 'EPC',
    status: 'Cold',
    email: 'meera.d@vanguardinfra.com',
    phone: '+91 89012 34567',
    job_title: 'Project Coordinator',
    city: 'Hyderabad',
    notes: 'Project put on hold indefinitely. Re-engagement scheduled for next year.',
    folderName: 'Q3 Campaigns'
  }
];

const initialNotes = [
  {
    lead_name: 'Alpha Defence Systems',
    title: 'PO Received',
    body: 'Received formal PO-10294 for the precision enclosures. Delivered drawings to manufacturing team.',
    folderName: 'High Priority'
  },
  {
    lead_name: 'L&T Construction',
    title: 'Introductory call completed',
    body: 'Had standard intro call. Explained our capability in laser cutting and bending. They are sending RFQ documents by this weekend.',
    folderName: 'Q3 Campaigns'
  },
  {
    lead_name: '',
    title: 'General Team Sync',
    body: 'Discussed Q3 target for OEM segment. Goal: Secure 3 new active accounts in Bengaluru.',
    folderName: 'Q3 Campaigns'
  }
];

export async function initDb() {
  try {
    console.log('Initializing database tables...');
    await pool.query(ddlFolders);
    await pool.query(ddlLeads);
    await pool.query(ddlNotes);
    
    // Ensure alterations are executed if upgrading existing schema
    await pool.query(alterLeads);
    await pool.query(alterNotes);
    console.log('Database tables verified/created/altered successfully.');

    // Seed Folders if empty
    const checkFolders = await pool.query('SELECT COUNT(*) FROM folders');
    const folderMap = {}; // name -> id
    
    if (parseInt(checkFolders.rows[0].count) === 0) {
      console.log('Folders table is empty. Seeding initial folders...');
      for (const f of initialFolders) {
        const query = `
          INSERT INTO folders (name, color)
          VALUES ($1, $2)
          ON CONFLICT (name) DO NOTHING
          RETURNING id;
        `;
        const res = await pool.query(query, [f.name, f.color]);
        if (res.rows.length > 0) {
          folderMap[f.name] = res.rows[0].id;
        }
      }
    } else {
      // Load existing folders into map
      const res = await pool.query('SELECT id, name FROM folders');
      res.rows.forEach(r => folderMap[r.name] = r.id);
    }

    // Check if leads table is empty
    const checkLeads = await pool.query('SELECT COUNT(*) FROM leads');
    if (parseInt(checkLeads.rows[0].count) === 0) {
      console.log('Leads table is empty. Seeding initial leads with folder assignments...');
      for (const lead of initialLeads) {
        const fId = lead.folderName ? folderMap[lead.folderName] : null;
        const query = `
          INSERT INTO leads (name, company, segment, status, email, phone, job_title, city, notes, folder_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id;
        `;
        const res = await pool.query(query, [
          lead.name,
          lead.company,
          lead.segment,
          lead.status,
          lead.email,
          lead.phone,
          lead.job_title,
          lead.city,
          lead.notes,
          fId
        ]);
        
        // Find corresponding note to link
        const matchingNote = initialNotes.find(n => n.lead_name === lead.company);
        if (matchingNote) {
          const noteFId = matchingNote.folderName ? folderMap[matchingNote.folderName] : null;
          const noteQuery = `
            INSERT INTO notes (lead_id, lead_name, title, body, folder_id)
            VALUES ($1, $2, $3, $4, $5);
          `;
          await pool.query(noteQuery, [res.rows[0].id, lead.company, matchingNote.title, matchingNote.body, noteFId]);
        }
      }

      // Seed general notes (not matching any lead company)
      for (const note of initialNotes) {
        if (!note.lead_name || !initialLeads.some(l => l.company === note.lead_name)) {
          const noteFId = note.folderName ? folderMap[note.folderName] : null;
          const noteQuery = `
            INSERT INTO notes (lead_id, lead_name, title, body, folder_id)
            VALUES (NULL, $1, $2, $3, $4);
          `;
          await pool.query(noteQuery, [note.lead_name || '', note.title, note.body, noteFId]);
        }
      }
      console.log('Database seeding complete.');
    } else {
      console.log('Leads table already contains data. Skipping seeding.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}
