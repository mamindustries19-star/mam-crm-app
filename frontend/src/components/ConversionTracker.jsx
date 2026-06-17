import React from 'react';

const CONV_COLORS = ['#378ADD', '#BA7517', '#639922', '#7F77DD', '#1D9E75'];

export default function ConversionTracker({ data }) {
  const { rates = {}, stageBreakdown = {}, segmentPerformance = [] } = data;
  const { leadToContact = 0, contactToQualified = 0, qualifiedToWon = 0, counts = {} } = rates;

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
  const totalLeads = counts.total || 1;

  return (
    <div className="conversion-page">
      {/* Metrics Row */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="metric metric-total">
          <div className="metric-label">Lead &rarr; Contact</div>
          <div className="metric-value">{leadToContact}%</div>
          <div className="metric-sub">{counts.contacted ?? 0} of {counts.total ?? 0} contacted</div>
        </div>
        <div className="metric metric-active">
          <div className="metric-label">Contact &rarr; Qualified</div>
          <div className="metric-value">{contactToQualified}%</div>
          <div className="metric-sub">{counts.qualified ?? 0} of {counts.contacted ?? 0} qualified</div>
        </div>
        <div className="metric metric-won">
          <div className="metric-label">Qualified &rarr; Won</div>
          <div className="metric-value">{qualifiedToWon}%</div>
          <div className="metric-sub">{counts.won ?? 0} of {counts.qualified ?? 0} won</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Stage Conversion Rates */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Stage Conversion Rates</span>
          </div>
          <div className="funnel-container">
            {stages.map((stage, i) => {
              const count = stageBreakdown[stage] ?? 0;
              const percentage = Math.round((count / totalLeads) * 100);
              const barWidth = Math.max(percentage, 4);

              return (
                <div key={stage} className="funnel-row">
                  <div className="funnel-label">{stage}</div>
                  <div className="funnel-bar-wrap">
                    <div
                      className="funnel-bar"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: CONV_COLORS[i] || '#cbd5e1'
                      }}
                    >
                      {percentage > 8 ? `${percentage}%` : ''}
                    </div>
                  </div>
                  <div className="funnel-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance By Segment */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Performance By Segment</span>
          </div>
          <div className="segment-perf-list">
            {segmentPerformance.length > 0 ? (
              segmentPerformance.map(d => (
                <div
                  key={d.segment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-tertiary)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.segment}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {d.total} leads &middot; {d.won} won
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {d.rate}%
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">No segment data available yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
