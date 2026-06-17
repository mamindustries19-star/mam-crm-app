import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { initDb } from './db-init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Root path welcome route
app.get('/', (req, res) => {
  res.json({ message: 'MAM Industries CRM API is online and running successfully!' });
});

// Debug endpoint to check DB connection status
app.get('/api/debug-db', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'DATABASE_URL environment variable is not defined on Vercel'
      });
    }

    const maskedDbUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      message: 'Database connected successfully',
      time: result.rows[0].now,
      databaseUrlUsed: maskedDbUrl
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
      databaseUrlUsed: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
        : 'none'
    });
  }
});

// Initialize database tables and seed if empty
try {
  await initDb();
} catch (e) {
  console.error('Failed to initialize database, but starting server anyway:', e);
}

// REST API Endpoints

// 1. FOLDERS API
// GET /api/folders - List all folders
app.get('/api/folders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching folders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/folders - Create a folder
app.post('/api/folders', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const query = `
      INSERT INTO folders (name, color)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [name, color || '#185FA5']);
    
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Folder name already exists' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/folders/:id - Delete a folder
app.delete('/api/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const checkFolder = await pool.query('SELECT * FROM folders WHERE id = $1', [id]);
    if (checkFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await pool.query('DELETE FROM folders WHERE id = $1', [id]);
    res.json({ message: 'Folder deleted successfully', id });
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 2. LEADS API
// GET /api/leads - List all leads with search, status/segment filters, and folder filters
app.get('/api/leads', async (req, res) => {
  try {
    const { q, status, segment, folder_id } = req.query;
    let query = `
      SELECT l.*, f.name as folder_name, f.color as folder_color 
      FROM leads l 
      LEFT JOIN folders f ON l.folder_id = f.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (l.name ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (segment) {
      query += ` AND l.segment = $${paramIndex}`;
      params.push(segment);
      paramIndex++;
    }

    if (folder_id) {
      query += ` AND l.folder_id = $${paramIndex}`;
      params.push(folder_id);
      paramIndex++;
    }

    query += ' ORDER BY l.id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/leads - Create a new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, company, segment, status, email, phone, job_title, city, notes, folder_id } = req.body;
    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' });
    }

    const query = `
      INSERT INTO leads (name, company, segment, status, email, phone, job_title, city, notes, folder_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      name,
      company,
      segment || 'OEM',
      status || 'New',
      email || '',
      phone || '',
      job_title || '',
      city || '',
      notes || '',
      folder_id || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/leads/:id - Update an existing lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, segment, status, email, phone, job_title, city, notes, folder_id } = req.body;

    const checkLead = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (checkLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const current = checkLead.rows[0];

    const query = `
      UPDATE leads
      SET name = $1, company = $2, segment = $3, status = $4, email = $5, phone = $6, job_title = $7, city = $8, notes = $9, folder_id = $10
      WHERE id = $11
      RETURNING *;
    `;

    const result = await pool.query(query, [
      name !== undefined ? name : current.name,
      company !== undefined ? company : current.company,
      segment !== undefined ? segment : current.segment,
      status !== undefined ? status : current.status,
      email !== undefined ? email : current.email,
      phone !== undefined ? phone : current.phone,
      job_title !== undefined ? job_title : current.job_title,
      city !== undefined ? city : current.city,
      notes !== undefined ? notes : current.notes,
      folder_id !== undefined ? folder_id : current.folder_id,
      id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/leads/:id - Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const checkLead = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (checkLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    res.json({ message: 'Lead deleted successfully', id });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/leads/import - Bulk import leads from parsed CSV JSON
app.post('/api/leads/import', async (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Leads array is required' });
    }

    const imported = [];
    for (const lead of leads) {
      const { name, company, segment, status, email, phone, city, job_title, folder_id } = lead;
      if (name && company) {
        const query = `
          INSERT INTO leads (name, company, segment, status, email, phone, job_title, city, folder_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
        const result = await pool.query(query, [
          name,
          company,
          segment || 'OEM',
          status || 'New',
          email || '',
          phone || '',
          job_title || '',
          city || '',
          folder_id || null
        ]);
        imported.push(result.rows[0]);
      }
    }

    res.status(201).json({ message: `Successfully imported ${imported.length} leads`, count: imported.length });
  } catch (err) {
    console.error('Error importing leads:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 3. NOTES API
// GET /api/notes - List notes with search and optional folder filtering
app.get('/api/notes', async (req, res) => {
  try {
    const { q, folder_id } = req.query;
    let query = `
      SELECT n.*, l.name as lead_person_name, l.company as lead_company_name, 
             f.name as folder_name, f.color as folder_color 
      FROM notes n
      LEFT JOIN leads l ON n.lead_id = l.id
      LEFT JOIN folders f ON n.folder_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (n.title ILIKE $${paramIndex} OR n.body ILIKE $${paramIndex} OR n.lead_name ILIKE $${paramIndex} OR l.name ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (folder_id) {
      query += ` AND n.folder_id = $${paramIndex}`;
      params.push(folder_id);
      paramIndex++;
    }

    query += ' ORDER BY n.id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { lead_id, lead_name, title, body, folder_id } = req.body;
    if (!title && !body) {
      return res.status(400).json({ error: 'Title or body is required' });
    }

    const query = `
      INSERT INTO notes (lead_id, lead_name, title, body, folder_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      lead_id || null,
      lead_name || '',
      title || '',
      body || '',
      folder_id || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const checkNote = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    if (checkNote.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ message: 'Note deleted successfully', id });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 4. STATS API
// GET /api/stats/dashboard - Metrics, pipeline funnel, and recent leads
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    const { folder_id } = req.query;
    let leadsFilter = 'WHERE 1=1';
    const params = [];
    if (folder_id) {
      leadsFilter += ' AND folder_id = $1';
      params.push(folder_id);
    }

    // Total leads
    const totalResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter}`, params);
    const totalLeads = parseInt(totalResult.rows[0].count);

    // Active pipeline
    const activeResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter} AND status NOT IN ('Won', 'Lost')`, params);
    const activePipeline = parseInt(activeResult.rows[0].count);

    // Won leads
    const wonResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter} AND status = 'Won'`, params);
    const wonLeads = parseInt(wonResult.rows[0].count);

    // Conversion rate
    const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Funnel stage counts
    const funnelResult = await pool.query(`SELECT status, COUNT(*) FROM leads ${leadsFilter} GROUP BY status`, params);
    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Cold'];
    const funnelCounts = {};
    statuses.forEach(s => funnelCounts[s] = 0);
    funnelResult.rows.forEach(row => {
      if (funnelCounts[row.status] !== undefined) {
        funnelCounts[row.status] = parseInt(row.count);
      }
    });

    // Recent leads
    const recentLeadsResult = await pool.query(`SELECT * FROM leads ${leadsFilter} ORDER BY id DESC LIMIT 5`, params);

    res.json({
      metrics: {
        totalLeads,
        activePipeline,
        wonLeads,
        conversionRate
      },
      funnel: funnelCounts,
      recentLeads: recentLeadsResult.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/conversion - Conversion percentages and Segment performance
app.get('/api/stats/conversion', async (req, res) => {
  try {
    const { folder_id } = req.query;
    let leadsFilter = 'WHERE 1=1';
    const params = [];
    if (folder_id) {
      leadsFilter += ' AND folder_id = $1';
      params.push(folder_id);
    }

    const totalResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter}`, params);
    const total = parseInt(totalResult.rows[0].count) || 1;

    const contactedResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter} AND status NOT IN ('New')`, params);
    const contacted = parseInt(contactedResult.rows[0].count);

    const qualifiedResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter} AND status IN ('Qualified', 'Proposal', 'Won')`, params);
    const qualified = parseInt(qualifiedResult.rows[0].count);

    const wonResult = await pool.query(`SELECT COUNT(*) FROM leads ${leadsFilter} AND status = 'Won'`, params);
    const won = parseInt(wonResult.rows[0].count);

    // Stage rates
    const rates = {
      leadToContact: Math.round((contacted / total) * 100),
      contactToQualified: contacted ? Math.round((qualified / contacted) * 100) : 0,
      qualifiedToWon: qualified ? Math.round((won / qualified) * 100) : 0,
      counts: {
        total,
        contacted,
        qualified,
        won
      }
    };

    // Stage conversion breakdown
    const funnelResult = await pool.query(`SELECT status, COUNT(*) FROM leads ${leadsFilter} AND status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Won') GROUP BY status`, params);
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
    const stageBreakdown = {};
    stages.forEach(s => stageBreakdown[s] = 0);
    funnelResult.rows.forEach(row => {
      stageBreakdown[row.status] = parseInt(row.count);
    });

    // Segment performance
    const segmentResult = await pool.query(`
      SELECT 
        segment, 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Won' THEN 1 END) as won
      FROM leads 
      ${leadsFilter}
      GROUP BY segment
    `, params);

    const segments = ['OEM', 'EPC', 'Architecture', 'Factory', 'Defence'];
    const segmentData = segments.map(seg => {
      const row = segmentResult.rows.find(r => r.segment === seg);
      const totalCount = row ? parseInt(row.total) : 0;
      const wonCount = row ? parseInt(row.won) : 0;
      return {
        segment: seg,
        total: totalCount,
        won: wonCount,
        rate: totalCount ? Math.round((wonCount / totalCount) * 100) : 0
      };
    });

    res.json({
      rates,
      stageBreakdown,
      segmentPerformance: segmentData
    });
  } catch (err) {
    console.error('Error fetching conversion stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. WEBSITE INTEGRATION WEBHOOK
// Secure endpoint to receive real-time leads from the main website
app.post('/api/integration/website-enquiry', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const SECRET_KEY = process.env.WEBSITE_SYNC_KEY || 'mam_secure_sync_secret_123';
    
    // Authenticate the incoming request
    if (!apiKey || apiKey !== SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized integration request' });
    }

    const { name, company, email, phone, city, message, service } = req.body;
    if (!name || !company) {
      return res.status(400).json({ error: 'Name and Company are required' });
    }

    // Map service keywords to CRM business segments
    let segment = 'OEM'; 
    if (service) {
      const sLower = service.toLowerCase();
      if (sLower.includes('architect') || sLower.includes('design')) segment = 'Architecture';
      else if (sLower.includes('epc') || sLower.includes('solar') || sLower.includes('infra')) segment = 'EPC';
      else if (sLower.includes('factory') || sLower.includes('plant') || sLower.includes('machinery')) segment = 'Factory';
      else if (sLower.includes('defence') || sLower.includes('aerospace')) segment = 'Defence';
    }

    // Insert lead into separate CRM PostgreSQL database
    const query = `
      INSERT INTO leads (name, company, segment, status, email, phone, city, notes)
      VALUES ($1, $2, $3, 'New', $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const notesContent = `Website Enquiry Message: ${message || 'No message provided.'}`;
    const result = await pool.query(query, [name, company, segment, email || '', phone || '', city || '', notesContent]);

    res.status(201).json({ 
      message: 'Lead synced successfully to CRM database', 
      leadId: result.rows[0].id 
    });
  } catch (err) {
    console.error('Integration Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
