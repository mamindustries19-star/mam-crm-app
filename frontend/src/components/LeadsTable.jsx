import React, { useState } from 'react';

const SEGMENTS = ['OEM', 'EPC', 'Architecture', 'Factory', 'Defence'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Cold'];

export default function LeadsTable({ 
  leads, 
  onAddLead, 
  onEditLead, 
  onDeleteLead, 
  onUpdateStatus, 
  onAddLeadNote, 
  onImportCSV 
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSegment, setFilterSegment] = useState('');

  // Filter leads locally for responsive quick feedback
  const filteredLeads = leads.filter(lead => {
    const query = search.toLowerCase();
    const matchesSearch = !search || 
      (lead.name || '').toLowerCase().includes(query) ||
      (lead.company || '').toLowerCase().includes(query) ||
      (lead.email || '').toLowerCase().includes(query) ||
      (lead.phone || '').toLowerCase().includes(query);
      
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    const matchesSegment = !filterSegment || lead.segment === filterSegment;
    
    return matchesSearch && matchesStatus && matchesSegment;
  });

  return (
    <div className="leads-page">
      {/* Search and Filters */}
      <div className="search-row">
        <input 
          type="text" 
          placeholder="Search leads by name, company, email, phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="filter-select" 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select 
          className="filter-select" 
          value={filterSegment}
          onChange={(e) => setFilterSegment(e.target.value)}
        >
          <option value="">All Segments</option>
          {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Leads Table Card */}
      <div className="card" style={{ overflowX: 'auto', padding: '12px' }}>
        {filteredLeads.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name & City</th>
                <th>Company</th>
                <th>Segment</th>
                <th>Contact details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{lead.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      {lead.city || 'N/A'}
                    </div>
                    {/* Render Folder Badge */}
                    {lead.folder_name && (
                      <span 
                        className="folder-badge"
                        style={{ 
                          backgroundColor: `${lead.folder_color}12`,
                          color: lead.folder_color,
                          border: `1px solid ${lead.folder_color}33`
                        }}
                      >
                        <i className="ti ti-folder-filled"></i> {lead.folder_name}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.company}</div>
                    {lead.job_title && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {lead.job_title}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="tag">{lead.segment}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{lead.email || '-'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lead.phone || '-'}</div>
                  </td>
                  <td>
                    <select 
                      style={{ width: 'auto', fontSize: '12px', padding: '4px 8px' }}
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => onEditLead(lead)} 
                        title="Edit Lead"
                      >
                        <i className="ti ti-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => onAddLeadNote(lead)} 
                        title="Add Note"
                      >
                        <i className="ti ti-notebook"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => onDeleteLead(lead.id)} 
                        title="Delete Lead"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <i className="ti ti-users" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', opacity: 0.3 }}></i>
            No leads found matching current query.
          </div>
        )}
      </div>
    </div>
  );
}
