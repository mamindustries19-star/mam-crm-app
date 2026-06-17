import React, { useState } from 'react';

const SEGMENTS = ['OEM', 'EPC', 'Architecture', 'Factory', 'Defence'];

const SCRIPTS = {
  OEM: {
    email: [
      { num: 'Email 1 — Introduction', text: `Subject: Precision fabrication partner for [Company Name]\n\nHi [Name],\n\nI noticed [Company] manufactures [product type] and I wanted to reach out directly.\n\nMAM Industries is a Bengaluru-based precision metal fabrication company — laser cutting, CNC bending, MIG/TIG welding, powder coating — all under one roof. We work with OEMs across automotive and industrial machinery.\n\nI'd love to understand your current fabrication requirements and see if we can be a fit. Would a quick 15-minute call this week work?\n\nBest,\n[Your name]\nMAM Industries | mamindustries.in` },
      { num: 'Email 2 — Follow-up (Day 5)', text: `Subject: Re: Precision fabrication for [Company]\n\nHi [Name],\n\nFollowing up on my earlier note. We recently helped an OEM in [city] reduce fabrication lead times by 30% by consolidating their vendor base with us.\n\nGiven your production volumes, I believe we could offer similar value — consistent quality, on-time delivery, and a single accountable partner.\n\nAre you the right person to discuss fabrication vendors, or should I reach out to someone else on your team?\n\nBest,\n[Your name]` },
      { num: 'Email 3 — Final nudge (Day 12)', text: `Subject: One last note — MAM Industries\n\nHi [Name],\n\nI'll keep this brief. If you're evaluating fabrication partners or have a project coming up, I'd love a chance to quote.\n\nWe offer: laser cutting up to [spec], CNC bending, full welding (MIG/TIG/CO2), and powder coating — all from our Bengaluru facility.\n\nHappy to share our capability sheet or arrange a facility visit. Just reply with a good time.\n\n[Your name]\nMAM Industries` }
    ],
    linkedin: [
      { num: 'Connection request (300 chars max)', text: `Hi [Name], came across [Company] while researching OEM fabrication requirements in India. We're a Bengaluru precision fabrication shop — laser cutting, welding, powder coating. Thought there could be a fit. Happy to connect.` },
      { num: 'Message 1 — After connecting (48–72 hrs)', text: `Hi [Name], thanks for connecting!\n\nMAM Industries does precision metal fabrication — laser cutting, CNC bending, MIG/TIG welding, powder coating. We work with OEMs across automotive and industrial machinery.\n\nCurious — does [Company] work with external fabrication vendors, or is it all done in-house? Just want to understand your setup before suggesting anything.` },
      { num: 'Message 2 — Follow-up (Day 7)', text: `Hi [Name], just following up on my earlier message.\n\nWe recently helped an OEM reduce sourcing complexity by consolidating multiple fabrication steps with us under one roof. Happy to share specifics if it's relevant.\n\nIs fabrication something you're looking to optimise right now, or would it be better to reconnect next quarter?` }
    ]
  },
  EPC: {
    email: [
      { num: 'Email 1 — Introduction', text: `Subject: Structural & precision fabrication for [Project/Company]\n\nHi [Name],\n\nI'm reaching out because [Company]'s project pipeline caught our attention — particularly the [type of project, if known].\n\nMAM Industries provides structural and precision metal fabrication out of Bengaluru — laser cutting, CNC bending, MIG/TIG welding, and powder coating. We're set up to meet the delivery timelines that EPC projects demand.\n\nAre you responsible for vendor evaluation on the fabrication side? If so, I'd love to understand your upcoming requirements.\n\n[Your name]\nMAM Industries` },
      { num: 'Email 2 — Follow-up (Day 5)', text: `Subject: Re: Fabrication vendor for [Company]\n\nHi [Name],\n\nQuick follow-up. One thing EPC contractors often tell us is that vendor consolidation and reliable delivery are the two things they struggle with most on fabrication.\n\nWe're built for exactly that — multi-process capability in one facility, project-specific scheduling, and documented quality control.\n\nEven if you don't have an immediate requirement, it may be worth a brief call to add us to your approved vendor list for future projects.\n\n[Your name]` },
      { num: 'Email 3 — Final nudge (Day 12)', text: `Subject: Approved vendor list — MAM Industries\n\nHi [Name],\n\nLast note from my end. If there's a project in the pipeline that needs fabrication capability — structural, precision, or decorative metal — we'd like to be considered.\n\nHappy to send our capability sheet, company profile, and quality documentation for your records. No obligation.\n\n[Your name]\nMAM Industries` }
    ],
    linkedin: [
      { num: 'Connection request', text: `Hi [Name], noticed [Company] is active in EPC/infrastructure projects in India. MAM Industries offers precision and structural metal fabrication from Bengaluru — we work with contractors on project-specific requirements. Would love to connect.` },
      { num: 'Message 1 — After connecting', text: `Hi [Name], thanks for connecting!\n\nWe do precision metal fabrication — laser cutting, CNC bending, welding, powder coating. A few EPC contractors use us for project-specific fabrication where standard vendor catalogues don't cut it.\n\nAre you involved in vendor selection for fabrication on your projects, or is that handled separately?` },
      { num: 'Message 2 — Follow-up', text: `Hi [Name], just circling back. We're looking to expand our EPC client base and get onto vendor lists for upcoming infrastructure and industrial projects.\n\nWould it be useful to send over our company profile and capability doc? That way we're on your radar when a requirement comes up — no pressure to engage right now.` }
    ]
  },
  Architecture: {
    email: [
      { num: 'Email 1 — Introduction', text: `Subject: Custom metalwork for your projects — MAM Industries\n\nHi [Name],\n\nI came across [Firm]'s portfolio and was particularly impressed by [project or style]. It got me thinking about how we might support your work.\n\nMAM Industries specialises in precision metal fabrication — we do a lot of custom structural and decorative metalwork for architecture and interior fit-out projects. Laser-cut screens, bespoke staircases, cladding, furniture frames — we can prototype and produce.\n\nAre you working on any projects where custom metal fabrication would be relevant?\n\n[Your name]\nMAM Industries` },
      { num: 'Email 2 — Follow-up (Day 5)', text: `Subject: Re: Custom metal fabrication — [Firm]\n\nHi [Name],\n\nFollowing up briefly. We've worked with architects on everything from decorative laser-cut panels to structural support elements — and we're happy to work from CAD files or drawings.\n\nIf it'd help, I can share a few examples of custom architectural metalwork we've done recently.\n\nWorth a 10-minute call?\n\n[Your name]` },
      { num: 'Email 3 — Final nudge', text: `Subject: Portfolio & capability — MAM Industries\n\nHi [Name],\n\nLast note. I'll send over our capability sheet and a few project photos in case it's useful for future reference.\n\nIf you ever have a project that needs custom fabrication — prototypes, one-offs, or production runs — we're easy to work with and based in Bengaluru.\n\n[Your name]\nMAM Industries` }
    ],
    linkedin: [
      { num: 'Connection request', text: `Hi [Name], love [Firm]'s work — especially the use of metalwork in your recent projects. We do precision and custom metal fabrication at MAM Industries. Thought it'd be worth connecting in case there's a fit on a future project.` },
      { num: 'Message 1 — After connecting', text: `Hi [Name], thanks for connecting!\n\nWe do custom metal fabrication — laser cutting, CNC bending, welding, powder coating. A lot of our work is bespoke: decorative screens, staircases, structural frames, furniture — working from CAD or drawings.\n\nDo you tend to source metalwork locally in Bengaluru, or does it depend on the project?` },
      { num: 'Message 2 — Follow-up', text: `Hi [Name], just following up. Happy to share our portfolio and capability doc — it might be useful to have on file for when a project comes up that needs custom metalwork.\n\nAlternatively, if there's something specific you're working on right now, I'd love to understand the brief.` }
    ]
  },
  Factory: {
    email: [
      { num: 'Email 1 — Introduction', text: `Subject: Fabrication support for [Company] — MAM Industries\n\nHi [Name],\n\nI'm reaching out because manufacturing and plant operations teams often need a reliable fabrication partner for both planned and unplanned requirements.\n\nMAM Industries offers laser cutting, CNC bending, MIG/TIG/CO2 welding, and powder coating from our Bengaluru facility. We work with factory and plant teams on everything from jigs and fixtures to replacement parts and custom assemblies.\n\nDo you have a current fabrication vendor, or is this something you'd be open to exploring?\n\n[Your name]\nMAM Industries` },
      { num: 'Email 2 — Follow-up (Day 5)', text: `Subject: Re: Fabrication for [Company]\n\nHi [Name],\n\nFollowing up on my note. The most common thing we hear from plant teams is that their current vendors are slow to respond or can't handle the variety of requirements that come up.\n\nWe're a multi-process shop, so we can handle most metal fabrication needs under one roof — and we're set up to turn around urgent requirements quickly.\n\nWorth a brief call this week?\n\n[Your name]` },
      { num: 'Email 3 — Final nudge', text: `Subject: Last note — MAM Industries fabrication\n\nHi [Name],\n\nI'll keep it short. If you have upcoming fabrication requirements — or want a backup vendor for urgent plant needs — we'd love to be on your list.\n\nReply and I'll send over our capability sheet and pricing overview.\n\n[Your name]\nMAM Industries` }
    ],
    linkedin: [
      { num: 'Connection request', text: `Hi [Name], I work with manufacturing and plant operations teams on precision metal fabrication requirements. MAM Industries — Bengaluru, multi-process shop. Thought it'd be worth connecting.` },
      { num: 'Message 1 — After connecting', text: `Hi [Name], thanks for connecting!\n\nWe do fabrication for plant and factory teams — laser cutting, CNC bending, welding, powder coating. Everything from jigs and fixtures to replacement components and custom assemblies.\n\nDoes [Company] work with external fabricators, or is everything done in-house?` },
      { num: 'Message 2 — Follow-up', text: `Hi [Name], just following up. Happy to share our capability sheet and turnaround times — might be worth having on file as a backup vendor even if you have a primary supplier right now.\n\nLet me know if that'd be useful.` }
    ]
  },
  Defence: {
    email: [
      { num: 'Email 1 — Introduction', text: `Subject: Precision fabrication capability — MAM Industries\n\nDear [Name],\n\nI am writing to introduce MAM Industries, a Bengaluru-based precision metal fabrication company specialising in laser cutting, CNC bending, MIG/TIG/CO2 welding, and powder coating.\n\nWe understand that defence and aerospace procurement involves rigorous qualification and documentation requirements. We are prepared to support that process and would welcome the opportunity to discuss our capabilities in relation to [Company]'s requirements.\n\nPlease let me know if it would be appropriate to submit a formal capability document or arrange a facility review.\n\nYours sincerely,\n[Your name]\nMAM Industries` },
      { num: 'Email 2 — Follow-up (Day 7)', text: `Subject: Re: MAM Industries — Precision fabrication\n\nDear [Name],\n\nI am following up on my previous correspondence. We understand procurement cycles in defence and aerospace are long, and we are not looking for an immediate commitment.\n\nOur intent is to be considered for future requirements by providing our full capability documentation, quality records, and facility details at your convenience.\n\nPlease advise on the appropriate process to be registered as a potential vendor.\n\nYours sincerely,\n[Your name]` },
      { num: 'Email 3 — Final nudge (Day 21)', text: `Subject: Vendor registration — MAM Industries\n\nDear [Name],\n\nThis is my final follow-up. I would appreciate guidance on the appropriate channel to submit our company profile and capability document for vendor registration consideration.\n\nIf now is not the right time, I am happy to reconnect at your preferred date.\n\nYours sincerely,\n[Your name]\nMAM Industries` }
    ],
    linkedin: [
      { num: 'Connection request', text: `Dear [Name], I represent MAM Industries, a precision metal fabrication company in Bengaluru — laser cutting, CNC bending, welding, powder coating. We are exploring opportunities in the defence and aerospace supply chain. Would appreciate connecting.` },
      { num: 'Message 1 — After connecting', text: `Dear [Name], thank you for connecting.\n\nMAM Industries provides precision metal fabrication and we are in the process of qualifying for defence and aerospace supply chain opportunities.\n\nCould you advise on the appropriate process to introduce our capabilities to your procurement or vendor development team?` },
      { num: 'Message 2 — Follow-up', text: `Dear [Name], following up on my earlier message. We are happy to share our full capability document, quality records, and facility details. Our intent is simply to be on your radar for future requirements.\n\nPlease let me know how best to proceed.` }
    ]
  }
};

export default function ScriptsLibrary() {
  const [currentSeg, setCurrentSeg] = useState('OEM');
  const [currentChannel, setCurrentChannel] = useState('email');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  const currentData = SCRIPTS[currentSeg]?.[currentChannel] || [];

  return (
    <div className="scripts-page">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Select Segment Target</span>
        </div>
        
        {/* Segment Tabs */}
        <div className="script-tabs">
          {SEGMENTS.map(s => (
            <button
              key={s}
              className={`script-tab ${currentSeg === s ? 'active' : ''}`}
              onClick={() => setCurrentSeg(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Channel Selection Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`script-tab ${currentChannel === 'email' ? 'active' : ''}`}
            onClick={() => setCurrentChannel('email')}
          >
            <i className="ti ti-mail"></i> Email Outreach
          </button>
          <button
            className={`script-tab ${currentChannel === 'linkedin' ? 'active' : ''}`}
            onClick={() => setCurrentChannel('linkedin')}
          >
            <i className="ti ti-brand-linkedin"></i> LinkedIn Social
          </button>
        </div>

        {/* Scripts Content */}
        <div className="scripts-content">
          {currentData.map((script, idx) => (
            <div key={idx} className="script-block">
              <div className="script-num">{script.num}</div>
              <div className="script-text">{script.text}</div>
              <button
                className="btn btn-sm copy-btn btn-primary"
                onClick={() => handleCopy(script.text, idx)}
              >
                {copiedIndex === idx ? (
                  <>
                    <i className="ti ti-check"></i> Copied
                  </>
                ) : (
                  <>
                    <i className="ti ti-copy"></i> Copy Script
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
