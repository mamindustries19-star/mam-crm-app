import React, { useState } from 'react';

export default function NotesManager({ notes, onAddNote, onDeleteNote }) {
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(note => {
    const query = search.toLowerCase();
    return !search || 
      (note.title || '').toLowerCase().includes(query) ||
      (note.body || '').toLowerCase().includes(query) ||
      (note.lead_name || '').toLowerCase().includes(query) ||
      (note.lead_person_name || '').toLowerCase().includes(query) ||
      (note.lead_company_name || '').toLowerCase().includes(query);
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="notes-page">
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Outreach Notes</span>
          <button className="btn btn-primary btn-sm" onClick={onAddNote}>
            <i className="ti ti-plus"></i> Add note
          </button>
        </div>

        {/* Search */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Search notes by keyword, topic, or lead company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Notes List */}
        <div className="notes-list" style={{ marginTop: '20px' }}>
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => {
              // Get related lead name
              const relatedLead = note.lead_company_name || note.lead_person_name || note.lead_name || '';
              return (
                <div key={note.id} className="note-card">
                  <div className="note-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span>{formatDate(note.created_at || note.date)}</span>
                    {relatedLead && <span>&middot; Lead: {relatedLead}</span>}
                    {note.folder_name && (
                      <span 
                        className="folder-badge"
                        style={{ 
                          backgroundColor: `${note.folder_color}12`,
                          color: note.folder_color,
                          border: `1px solid ${note.folder_color}33`,
                          marginTop: 0
                        }}
                      >
                        <i className="ti ti-folder-filled"></i> {note.folder_name}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', marginTop: '6px' }}>
                    {note.title}
                  </div>
                  <div className="note-text">{note.body}</div>
                  <div className="note-actions">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDeleteNote(note.id)}
                    >
                      <i className="ti ti-trash"></i> Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty">
              <i className="ti ti-notebook" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', opacity: 0.3 }}></i>
              No outreach notes found. Add your first note to start tracking lead interactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
