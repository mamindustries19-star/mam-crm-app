import React from 'react';

const SEGMENT_COLORS = {
  New: '#378ADD',
  Contacted: '#BA7517',
  Qualified: '#639922',
  Proposal: '#7F77DD',
  Won: '#1D9E75',
  Lost: '#E24B4A',
  Cold: '#888780'
};

export default function Dashboard({ data, onNavigate }) {
  const { metrics = {}, funnel = {}, recentLeads = [] } = data;
  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Cold'];

  // Calculate max count for scaling the funnel bar widths
  const counts = Object.values(funnel);
  const maxCount = Math.max(...counts, 1);

  const getStatusBadgeClass = (status) => {
    const map = {
      New: 'badge-new',
      Contacted: 'badge-contacted',
      Qualified: 'badge-qualified',
      Proposal: 'badge-proposal',
      Won: 'badge-won',
      Lost: 'badge-lost',
      Cold: 'badge-cold'
    };
    return `badge ${map[status] || 'badge-new'}`;
  };

  return (
    <div className="dashboard-page">
      {/* Metrics Grid */}
      <div className="metric-grid">
        <div className="metric metric-total">
          <div className="metric-label">Total Leads</div>
          <div className="metric-value">{metrics.totalLeads ?? 0}</div>
          <div className="metric-sub">Lifetime leads entered</div>
        </div>
        <div className="metric metric-active">
          <div className="metric-label">Active Pipeline</div>
          <div className="metric-value">{metrics.activePipeline ?? 0}</div>
          <div className="metric-sub">Leads in progress</div>
        </div>
        <div className="metric metric-won">
          <div className="metric-label">Won Leads</div>
          <div className="metric-value" style={{ color: 'var(--color-accent)' }}>{metrics.wonLeads ?? 0}</div>
          <div className="metric-sub">Closed deals</div>
        </div>
        <div className="metric metric-rate">
          <div className="metric-label">Conversion Rate</div>
          <div className="metric-value">{metrics.conversionRate ?? 0}%</div>
          <div className="metric-sub">Won / Total leads ratio</div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Pipeline Funnel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline Funnel</span>
            <button className="btn btn-sm" onClick={() => onNavigate('conversion')}>
              View Detailed Metrics
            </button>
          </div>
          <div className="funnel-container">
            {statuses.map(status => {
              const count = funnel[status] ?? 0;
              const widthPercentage = Math.max((count / maxCount) * 100, 5);
              return (
                <div key={status} className="funnel-row">
                  <div className="funnel-label">{status}</div>
                  <div className="funnel-bar-wrap">
                    <div
                      className="funnel-bar"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: SEGMENT_COLORS[status] || '#cbd5e1'
                      }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                  <div className="funnel-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Leads</span>
            <button className="btn btn-sm btn-primary" onClick={() => onNavigate('leads')}>
              Manage Leads
            </button>
          </div>
          <div className="recent-leads-list">
            {recentLeads.length > 0 ? (
              recentLeads.map(lead => (
                <div
                  key={lead.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-tertiary)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {lead.company} &middot; <span className="tag">{lead.segment}</span>
                    </div>
                  </div>
                  <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
                </div>
              ))
            ) : (
              <div className="empty">No leads found yet. Add some leads in the Lead Manager!</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
