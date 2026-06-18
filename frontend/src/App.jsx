import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LeadsTable from './components/LeadsTable';
import ScriptsLibrary from './components/ScriptsLibrary';
import NotesManager from './components/NotesManager';
import ConversionTracker from './components/ConversionTracker';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5001/api').trim();
const SEGMENTS = ['OEM', 'EPC', 'Architecture', 'Factory', 'Defence'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Cold'];
const PRESET_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#475569'];

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  
  // Data States
  const [leads, setLeads] = useState([]);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [conversionData, setConversionData] = useState({});
  
  // Filter States
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'add-lead' | 'edit-lead' | 'add-note' | 'import-csv' | 'add-folder'
  const [activeLead, setActiveLead] = useState(null);
  const [modalForm, setModalForm] = useState({});

  // 1. Initial Load and Theme Setup
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('mam_crm_theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    refreshAllData(selectedFolderId);
  }, [selectedFolderId]);

  const refreshAllData = async (folderId = selectedFolderId) => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchLeads(folderId),
        fetchNotes(folderId),
        fetchFolders(),
        fetchDashboardData(folderId),
        fetchConversionData(folderId)
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Connection to backend failed. Please ensure the Express server on port 5001 is running.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('mam_crm_theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // 3. API Actions
  const fetchFolders = async () => {
    const res = await fetch(`${API_BASE}/folders`);
    if (!res.ok) throw new Error('Failed to fetch folders');
    const data = await res.json();
    setFolders(data);
  };

  const fetchLeads = async (folderId) => {
    const url = folderId ? `${API_BASE}/leads?folder_id=${folderId}` : `${API_BASE}/leads`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leads');
    const data = await res.json();
    setLeads(data);
  };

  const fetchNotes = async (folderId) => {
    const url = folderId ? `${API_BASE}/notes?folder_id=${folderId}` : `${API_BASE}/notes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notes');
    const data = await res.json();
    setNotes(data);
  };

  const fetchDashboardData = async (folderId) => {
    const url = folderId ? `${API_BASE}/stats/dashboard?folder_id=${folderId}` : `${API_BASE}/stats/dashboard`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    const data = await res.json();
    setDashboardData(data);
  };

  const fetchConversionData = async (folderId) => {
    const url = folderId ? `${API_BASE}/stats/conversion?folder_id=${folderId}` : `${API_BASE}/stats/conversion`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch conversion stats');
    const data = await res.json();
    setConversionData(data);
  };

  const handleCreateFolder = async (folderData) => {
    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
      if (res.status === 409) throw new Error('Folder name already exists');
      if (!res.ok) throw new Error('Failed to create folder');
      closeModal();
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation(); // Avoid triggering selection
    if (!window.confirm('Delete this folder? Leads and notes associated with it will not be deleted, but will lose their folder tag.')) return;
    try {
      const res = await fetch(`${API_BASE}/folders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      } else {
        refreshAllData(selectedFolderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateLead = async (leadData) => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (!res.ok) throw new Error('Failed to create lead');
      closeModal();
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateLead = async (id, leadData) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (!res.ok) throw new Error('Failed to update lead');
      closeModal();
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateLeadStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!res.ok) throw new Error('Failed to create note');
      closeModal();
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this outreach note?')) return;
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportCSV = async (csvText) => {
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      alert('No data found in CSV input');
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const parsedLeads = [];
    
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, j) => row[h] = vals[j] || '');
      
      if (row.name && row.company) {
        parsedLeads.push({
          name: row.name,
          company: row.company,
          segment: SEGMENTS.includes(row.segment) ? row.segment : 'OEM',
          status: STATUSES.includes(row.status) ? row.status : 'New',
          email: row.email || '',
          phone: row.phone || '',
          city: row.city || '',
          job_title: row.jobtitle || row['job title'] || '',
          folder_id: selectedFolderId || null // Automatically associate with selected folder if importing inside a folder
        });
      }
    }

    if (parsedLeads.length === 0) {
      alert('No valid rows found to import (Name and Company are required)');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/leads/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedLeads })
      });
      if (!res.ok) throw new Error('Failed to import CSV');
      const resData = await res.json();
      alert(resData.message);
      closeModal();
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Modal Handlers
  const openModal = (type, data = null) => {
    setModalType(type);
    setActiveLead(data);
    
    if (type === 'add-lead') {
      setModalForm({
        name: '', company: '', segment: 'OEM', status: 'New',
        email: '', phone: '', job_title: '', city: '', notes: '',
        folder_id: selectedFolderId || '', service: ''
      });
    } else if (type === 'edit-lead' && data) {
      setModalForm({
        name: data.name || '',
        company: data.company || '',
        segment: data.segment || 'OEM',
        status: data.status || 'New',
        email: data.email || '',
        phone: data.phone || '',
        job_title: data.job_title || '',
        city: data.city || '',
        notes: data.notes || '',
        folder_id: data.folder_id || '',
        service: data.service || ''
      });
    } else if (type === 'add-note') {
      setModalForm({
        title: '',
        body: '',
        lead_id: data ? data.id : '',
        lead_name: data ? data.company : '',
        folder_id: selectedFolderId || ''
      });
    } else if (type === 'import-csv') {
      setModalForm({ csv: '' });
    } else if (type === 'add-folder') {
      setModalForm({ name: '', color: '#3b82f6' });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setActiveLead(null);
    setModalForm({});
  };

  const handleModalInputChange = (key, value) => {
    setModalForm(prev => ({ ...prev, [key]: value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add-lead') {
      if (!modalForm.name || !modalForm.company) {
        alert('Name and Company are required!');
        return;
      }
      // Convert folder_id to integer or null
      const formatted = { ...modalForm, folder_id: modalForm.folder_id ? parseInt(modalForm.folder_id) : null };
      handleCreateLead(formatted);
    } else if (modalType === 'edit-lead' && activeLead) {
      if (!modalForm.name || !modalForm.company) {
        alert('Name and Company are required!');
        return;
      }
      const formatted = { ...modalForm, folder_id: modalForm.folder_id ? parseInt(modalForm.folder_id) : null };
      handleUpdateLead(activeLead.id, formatted);
    } else if (modalType === 'add-note') {
      if (!modalForm.title && !modalForm.body) {
        alert('Title or Body content is required!');
        return;
      }
      const formatted = { 
        ...modalForm, 
        lead_id: modalForm.lead_id ? parseInt(modalForm.lead_id) : null,
        folder_id: modalForm.folder_id ? parseInt(modalForm.folder_id) : null 
      };
      handleCreateNote(formatted);
    } else if (modalType === 'import-csv') {
      handleImportCSV(modalForm.csv);
    } else if (modalType === 'add-folder') {
      if (!modalForm.name) {
        alert('Folder name is required!');
        return;
      }
      handleCreateFolder(modalForm);
    }
  };

  const handleFolderClick = (id) => {
    if (selectedFolderId === id) {
      setSelectedFolderId(null); // Unclick to deselect
    } else {
      setSelectedFolderId(id);
    }
  };

  // Main Nav Sidebar configurations
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
    { id: 'leads', label: 'Lead Manager', icon: 'ti ti-users' },
    { id: 'scripts', label: 'Scripts Library', icon: 'ti ti-message' },
    { id: 'notes', label: 'Outreach Notes', icon: 'ti ti-notebook' },
    { id: 'conversion', label: 'Conversion Tracker', icon: 'ti ti-chart-bar' }
  ];

  const activeFolderName = folders.find(f => f.id === selectedFolderId)?.name || '';
  const activeFolderColor = folders.find(f => f.id === selectedFolderId)?.color || '';

  return (
    <div className="app">
      {/* Sidebar Layout */}
      <div className="sidebar">
        <div className="logo">
          <div className="logo-name">MAM Industries</div>
          <div className="logo-sub">Lead Full-Stack CRM</div>
        </div>

        {/* View Selection Navigation */}
        <div className="nav-group">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <i className={item.icon}></i>
              {item.label}
            </button>
          ))}
        </div>

        {/* Folders List Section */}
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">Folders</span>
          <button 
            className="sidebar-section-add-btn" 
            onClick={() => openModal('add-folder')}
            title="Create New Folder"
          >
            <i className="ti ti-plus"></i>
          </button>
        </div>
        
        <div className="folder-list">
          {folders.map(folder => (
            <button
              key={folder.id}
              className={`folder-item ${selectedFolderId === folder.id ? 'active' : ''}`}
              onClick={() => handleFolderClick(folder.id)}
            >
              <div className="folder-item-left">
                <span className="folder-dot" style={{ backgroundColor: folder.color }}></span>
                <span className="folder-item-name">{folder.name}</span>
              </div>
              <span 
                className="folder-delete-btn"
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                title="Delete Folder"
              >
                <i className="ti ti-trash"></i>
              </span>
            </button>
          ))}
          {folders.length === 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', padding: '6px 12px' }}>
              No folders created yet.
            </span>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? (
              <>
                <i className="ti ti-moon"></i> Dark Theme
              </>
            ) : (
              <>
                <i className="ti ti-sun"></i> Light Theme
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main">
        <div className="topbar">
          <span className="page-title">
            {navItems.find(item => item.id === currentPage)?.label || 'CRM'}
          </span>
          <div className="topbar-right">
            {currentPage === 'leads' && (
              <>
                <button className="btn btn-sm" onClick={() => openModal('import-csv')}>
                  <i className="ti ti-upload"></i> Import CSV
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('add-lead')}>
                  <i className="ti ti-plus"></i> Add Lead
                </button>
              </>
            )}
            {currentPage === 'notes' && (
              <button className="btn btn-primary btn-sm" onClick={() => openModal('add-note')}>
                <i className="ti ti-plus"></i> Add Note
              </button>
            )}
            <button className="btn btn-sm" onClick={() => refreshAllData()} title="Sync Server Data">
              <i className="ti ti-refresh"></i> Sync
            </button>
          </div>
        </div>

        <div className="content">
          {/* Active Folder Filter Banner */}
          {selectedFolderId && (
            <div className="filter-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="folder-dot" style={{ backgroundColor: activeFolderColor }}></span>
                <span>Filtered by Folder: <strong>{activeFolderName}</strong></span>
              </div>
              <button className="btn btn-sm" onClick={() => setSelectedFolderId(null)}>
                Clear Filter
              </button>
            </div>
          )}

          {error && (
            <div 
              style={{ 
                background: '#fef2f2', 
                border: '1px solid #fca5a5', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px', 
                color: '#b91c1c',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span><strong>Error:</strong> {error}</span>
              <button className="btn btn-sm" onClick={() => refreshAllData()}>Retry</button>
            </div>
          )}

          {loading ? (
            <div className="empty">
              <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', animation: 'spin 1.5s linear infinite' }}></i>
              Loading CRM Workspace Data...
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard data={dashboardData} onNavigate={setCurrentPage} />
              )}
              {currentPage === 'leads' && (
                <LeadsTable
                  leads={leads}
                  onAddLead={() => openModal('add-lead')}
                  onEditLead={(lead) => openModal('edit-lead', lead)}
                  onDeleteLead={handleDeleteLead}
                  onUpdateStatus={handleUpdateLeadStatus}
                  onAddLeadNote={(lead) => openModal('add-note', lead)}
                  onImportCSV={() => openModal('import-csv')}
                />
              )}
              {currentPage === 'scripts' && <ScriptsLibrary />}
              {currentPage === 'notes' && (
                <NotesManager
                  notes={notes}
                  onAddNote={() => openModal('add-note')}
                  onDeleteNote={handleDeleteNote}
                />
              )}
              {currentPage === 'conversion' && (
                <ConversionTracker data={conversionData} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Renderer */}
      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {modalType === 'add-lead' && 'Add Lead'}
                {modalType === 'edit-lead' && 'Edit Lead'}
                {modalType === 'add-note' && (activeLead ? `Add Note — ${activeLead.name}` : 'Add Note')}
                {modalType === 'import-csv' && 'Import Leads from CSV'}
                {modalType === 'add-folder' && 'Create New Folder'}
              </span>
              <button className="close-btn" onClick={closeModal}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              {/* Add / Edit Lead Fields */}
              {(modalType === 'add-lead' || modalType === 'edit-lead') && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={modalForm.name || ''}
                        onChange={(e) => handleModalInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company *</label>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={modalForm.company || ''}
                        onChange={(e) => handleModalInputChange('company', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Segment</label>
                      <select
                        value={modalForm.segment || 'OEM'}
                        onChange={(e) => handleModalInputChange('segment', e.target.value)}
                      >
                        {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        value={modalForm.status || 'New'}
                        onChange={(e) => handleModalInputChange('status', e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Service Required</label>
                      <input
                        type="text"
                        placeholder="e.g. EPC Solar structures"
                        value={modalForm.service || ''}
                        onChange={(e) => handleModalInputChange('service', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Procurement Lead"
                        value={modalForm.job_title || ''}
                        onChange={(e) => handleModalInputChange('job_title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Folder Association</label>
                      <select
                        value={modalForm.folder_id || ''}
                        onChange={(e) => handleModalInputChange('folder_id', e.target.value)}
                      >
                        <option value="">No Folder (General Workspace)</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={modalForm.city || ''}
                        onChange={(e) => handleModalInputChange('city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        placeholder="email@company.com"
                        value={modalForm.email || ''}
                        onChange={(e) => handleModalInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        placeholder="+91 ..."
                        value={modalForm.phone || ''}
                        onChange={(e) => handleModalInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Details / Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Outreach notes or website enquiry details..."
                      value={modalForm.notes || ''}
                      onChange={(e) => handleModalInputChange('notes', e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Add Note Fields */}
              {modalType === 'add-note' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Intro Call Done, Proposal Sent"
                      value={modalForm.title || ''}
                      onChange={(e) => handleModalInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    {!activeLead && (
                      <div className="form-group">
                        <label className="form-label">Related Lead Company / Person</label>
                        <input
                          type="text"
                          placeholder="e.g. Tata Motors"
                          value={modalForm.lead_name || ''}
                          onChange={(e) => handleModalInputChange('lead_name', e.target.value)}
                        />
                      </div>
                    )}
                    <div className="form-group" style={{ gridColumn: activeLead ? 'span 2' : 'auto' }}>
                      <label className="form-label">Folder Association</label>
                      <select
                        value={modalForm.folder_id || ''}
                        onChange={(e) => handleModalInputChange('folder_id', e.target.value)}
                      >
                        <option value="">No Folder (General Workspace)</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Note Details *</label>
                    <textarea
                      rows="4"
                      placeholder="What happened during this contact? Any next steps?"
                      value={modalForm.body || ''}
                      onChange={(e) => handleModalInputChange('body', e.target.value)}
                      required
                    ></textarea>
                  </div>
                </>
              )}

              {/* Import CSV Fields */}
              {modalType === 'import-csv' && (
                <>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    Paste comma-separated rows below. Header row must contain <code>name</code> and <code>company</code> columns. Other supported columns are: <code>segment, status, email, phone, city, job title</code>.
                  </p>
                  <div className="form-group">
                    <textarea
                      rows="8"
                      placeholder="name,company,segment,status,email,phone,city&#10;Rahul Sharma,Tata Motors,OEM,New,rahul@tata.com,+91 9876543210,Pune"
                      value={modalForm.csv || ''}
                      onChange={(e) => handleModalInputChange('csv', e.target.value)}
                      required
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Create Folder Fields */}
              {modalType === 'add-folder' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Folder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. High Priority, Q3 Campaigns"
                      value={modalForm.name || ''}
                      onChange={(e) => handleModalInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Folder Color Icon</label>
                    <div className="folder-color-input-grid">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`folder-color-option ${modalForm.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleModalInputChange('color', color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
              >
                {modalType === 'add-lead' && 'Save Lead'}
                {modalType === 'edit-lead' && 'Update Lead'}
                {modalType === 'add-note' && 'Save Note'}
                {modalType === 'import-csv' && 'Import Leads'}
                {modalType === 'add-folder' && 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Dynamic spinner spin style helper */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
