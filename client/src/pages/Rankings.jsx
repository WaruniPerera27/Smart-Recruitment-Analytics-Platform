
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRankings, getJob } from '../services/api'

const Rankings = () => {
  const [candidates, setCandidates] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { jobId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rankRes, jobRes] = await Promise.all([
          getRankings(jobId),
          getJob(jobId)
        ])
        setCandidates(rankRes.data.candidates)
        setJob(jobRes.data.job)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [jobId])

  const getBadgeStyle = (badge) => {
    if (badge === 'Strong Match')
      return {
        background: 'rgba(34,197,94,0.12)',
        color: '#86efac',
        border: '1px solid rgba(34,197,94,0.35)'
      }

    if (badge === 'Partial Match')
      return {
        background: 'rgba(245,158,11,0.12)',
        color: '#fcd34d',
        border: '1px solid rgba(245,158,11,0.35)'
      }

    return {
      background: 'rgba(239,68,68,0.12)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.35)'
    }
  }

  return (
    <div style={s.container}>
      {/* Navigation */}
      <header style={s.navbar}>
        <div style={s.brand}>
          <div style={s.logo}>S</div>
          <div>
            <h1 style={s.navTitle}>Smart Recruitment</h1>
            <p style={s.navSubtitle}>ANALYTICS PLATFORM</p>
          </div>
        </div>

        <button
          style={s.backBtn}
          onClick={() => navigate('/dashboard')}
        >
          <span>←</span> Dashboard
        </button>
      </header>

      <main style={s.content}>
        {/* Page heading */}
        <div style={s.pageIntro}>
          <div>
            <div style={s.eyebrow}>
              <span style={s.eyebrowDot} />
              RECRUITMENT MANAGEMENT
            </div>

            <h2 style={s.pageTitle}>Candidate Rankings</h2>

            <p style={s.pageDescription}>
              Review candidate scores, compare matching results, and explore
              individual candidate profiles.
            </p>
          </div>

          {job && (
            <button
              style={s.uploadBtn}
              onClick={() => navigate(`/upload/${jobId}`)}
            >
              <span style={s.plus}>+</span> Upload CVs
            </button>
          )}
        </div>

        {/* Job information */}
        {job && (
          <section style={s.jobCard}>
            <div style={s.jobIcon}>▤</div>

            <div style={s.jobInfo}>
              <span style={s.sectionLabel}>CURRENT JOB POSITION</span>
              <h3 style={s.jobTitle}>{job.title}</h3>
              <p style={s.jobDescription}>
                Ranked candidates for this job opening
              </p>
            </div>

            <div style={s.candidateCount}>
              <span style={s.countNumber}>
                {loading ? '—' : candidates.length}
              </span>
              <span style={s.countLabel}>Candidates</span>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading ? (
          <div style={s.stateCard}>
            <div style={s.spinner} />
            <h3 style={s.stateTitle}>Loading candidates</h3>
            <p style={s.stateText}>
              Please wait while we retrieve the latest rankings.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          /* Empty state */
          <div style={s.stateCard}>
            <div style={s.emptyIcon}>📄</div>
            <h3 style={s.stateTitle}>No candidates yet</h3>
            <p style={s.stateText}>
              Upload CVs to start comparing candidates for this position.
            </p>

            <button
              style={s.uploadBtn}
              onClick={() => navigate(`/upload/${jobId}`)}
            >
              + Upload Your First CV
            </button>
          </div>
        ) : (
          <>
            {/* Table heading */}
            <div style={s.tableHeading}>
              <div>
                <h3 style={s.tableTitle}>Ranked Candidates</h3>
                <p style={s.tableSubtitle}>
                  Candidates are displayed in the order returned by the API.
                </p>
              </div>

              <div style={s.totalPill}>
                <span style={s.eyebrowDot} />
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Responsive table */}
            <div style={s.tableOuter}>
              <div style={s.tableScroll}>
                <div style={s.table}>
                  <div style={s.tableHeader}>
                    <span style={s.th}>Rank</span>
                    <span style={s.th}>Candidate</span>
                    <span style={s.th}>Final Score</span>
                    <span style={s.th}>XGBoost</span>
                    <span style={s.th}>ANN</span>
                    <span style={s.th}>Similarity</span>
                    <span style={s.th}>Keyword</span>
                    <span style={s.th}>Match Status</span>
                    <span style={s.th}>Action</span>
                  </div>

                  {candidates.map((c, i) => (
                    <div key={c._id} style={s.tableRow}>
                      <span style={s.rankCell}>
                        <span style={i === 0 ? s.topRank : s.rankNumber}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </span>

                      <div style={s.candidateCell}>
                        <div style={s.avatar}>
                          {c.filename?.replace('.pdf', '').charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span style={s.candidateName} title={c.filename}>
                          {c.filename?.replace('.pdf', '')}
                        </span>
                      </div>

                      <div style={s.finalScoreCell}>
                        <span style={s.finalScore}>
                          {(c.final_score * 100).toFixed(1)}%
                        </span>
                        <div style={s.progressTrack}>
                          <div
                            style={{
                              ...s.progressFill,
                              width: `${Math.min(Math.max(c.final_score * 100, 0), 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      <span style={s.scoreCell}>
                        {(c.xgb_probability * 100).toFixed(1)}%
                      </span>

                      <span style={s.scoreCell}>
                        {(c.ann_probability * 100).toFixed(1)}%
                      </span>

                      <span style={s.scoreCell}>
                        {(c.embedding_similarity * 100).toFixed(1)}%
                      </span>

                      <span style={s.scoreCell}>
                        {(c.keyword_score * 100).toFixed(1)}%
                      </span>

                      <span>
                        <span style={{
                          ...s.badge,
                          ...getBadgeStyle(c.match_badge)
                        }}>
                          <span style={s.badgeDot} />
                          {c.match_badge}
                        </span>
                      </span>

                      <span>
                        <button
                          style={s.detailBtn}
                          onClick={() => navigate(`/candidate/${c._id}`)}
                        >
                          View Details <span>→</span>
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score information */}
            <div style={s.note}>
              <span style={s.noteIcon}>ⓘ</span>
              <p style={s.noteText}>
                Scores represent the individual scoring outputs returned by
                the system. Review the candidate details page for the feature
                breakdown and available explanations.
              </p>
            </div>

            {/* Fairness report */}
            <section style={s.fairnessCard}>
              <div style={s.fairnessIcon}>◈</div>

              <div style={s.fairnessInfo}>
                <h3 style={s.fairnessTitle}>Fairness Analysis</h3>
                <p style={s.fairnessText}>
                  View the available fairness metrics and compare the report
                  before and after reweighing.
                </p>
              </div>

              <button
                style={s.biasBtn}
                onClick={() => navigate(`/bias/${jobId}`)}
              >
                View Fairness Report <span>→</span>
              </button>
            </section>
          </>
        )}
      </main>

      <footer style={s.footer}>
        <span>Smart Recruitment Analytics Platform</span>
        <span>Candidate Management</span>
      </footer>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'radial-gradient(ellipse at 10% 0%, rgba(14,165,233,0.09), transparent 35%), radial-gradient(ellipse at 95% 10%, rgba(99,102,241,0.09), transparent 32%), #080e1c',
    color: '#f1f5f9',
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
    boxSizing: 'border-box'
  },

  navbar: {
    width: '100%',
    minHeight: '76px',
    boxSizing: 'border-box',
    padding: '16px clamp(18px, 4vw, 56px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    background: 'rgba(15,23,42,0.88)',
    borderBottom: '1px solid rgba(148,163,184,0.14)',
    backdropFilter: 'blur(16px)'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px'
  },

  logo: {
    width: '42px',
    height: '42px',
    borderRadius: '13px',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    color: '#07111f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '23px',
    boxShadow: '0 6px 22px rgba(56,189,248,0.18)'
  },

  navTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '750',
    letterSpacing: '-0.4px',
    color: '#f8fafc'
  },

  navSubtitle: {
    margin: '4px 0 0',
    fontSize: '10px',
    letterSpacing: '2.2px',
    color: '#38bdf8',
    fontWeight: '800'
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#172237',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '650'
  },

  content: {
    width: '100%',
    maxWidth: '1700px',
    margin: '0 auto',
    padding: 'clamp(20px, 3vw, 44px) clamp(16px, 4vw, 56px)',
    boxSizing: 'border-box'
  },

  pageIntro: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '30px'
  },

  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#7dd3fc',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.8px',
    marginBottom: '12px'
  },

  eyebrowDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#38bdf8',
    boxShadow: '0 0 10px rgba(56,189,248,0.6)',
    flexShrink: 0
  },

  pageTitle: {
    margin: '0 0 10px',
    color: '#f8fafc',
    fontSize: 'clamp(26px, 3vw, 36px)',
    lineHeight: 1.2,
    letterSpacing: '-1px',
    fontWeight: '800'
  },

  pageDescription: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.7,
    maxWidth: '650px'
  },

  uploadBtn: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px',
    padding: '12px 19px',
    borderRadius: '11px',
    border: 'none',
    background: 'linear-gradient(110deg, #38bdf8, #818cf8)',
    color: '#07111f',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(56,189,248,0.14)'
  },

  plus: {
    fontSize: '20px',
    lineHeight: 1
  },

  jobCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '17px',
    padding: '20px 23px',
    marginBottom: '30px',
    borderRadius: '16px',
    border: '1px solid rgba(56,189,248,0.18)',
    background: 'linear-gradient(110deg, rgba(30,41,59,0.92), rgba(17,27,48,0.92))',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
  },

  jobIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(56,189,248,0.12)',
    border: '1px solid rgba(56,189,248,0.2)',
    color: '#7dd3fc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    flexShrink: 0
  },

  jobInfo: {
    flex: 1,
    minWidth: 0
  },

  sectionLabel: {
    display: 'block',
    fontSize: '10px',
    letterSpacing: '1.4px',
    color: '#64748b',
    fontWeight: '800',
    marginBottom: '6px'
  },

  jobTitle: {
    margin: '0 0 5px',
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: '750',
    overflowWrap: 'anywhere'
  },

  jobDescription: {
    color: '#94a3b8',
    fontSize: '12px'
  },

  candidateCount: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '3px',
    paddingLeft: '20px',
    borderLeft: '1px solid #334155',
    flexShrink: 0
  },

  countNumber: {
    color: '#7dd3fc',
    fontSize: '25px',
    fontWeight: '800'
  },

  countLabel: {
    color: '#94a3b8',
    fontSize: '11px'
  },

  tableHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '17px'
  },

  tableTitle: {
    color: '#f1f5f9',
    fontSize: '18px',
    fontWeight: '750',
    margin: '0 0 6px'
  },

  tableSubtitle: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.6
  },

  totalPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 12px',
    borderRadius: '20px',
    background: '#172237',
    border: '1px solid #29374d',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: '650'
  },

  tableOuter: {
    width: '100%',
    border: '1px solid #273449',
    borderRadius: '16px',
    background: 'rgba(15,23,42,0.82)',
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.16)'
  },

  tableScroll: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    minWidth: '1120px',
    width: '100%'
  },

  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '55px minmax(190px, 1.7fr) 120px repeat(4, minmax(80px, 0.75fr)) minmax(135px, 1fr) 125px',
    gap: '12px',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#111b2e',
    borderBottom: '1px solid #29374d'
  },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '55px minmax(190px, 1.7fr) 120px repeat(4, minmax(80px, 0.75fr)) minmax(135px, 1fr) 125px',
    gap: '12px',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(51,65,85,0.48)',
    transition: 'background 0.2s'
  },

  th: {
    color: '#8191a8',
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap'
  },

  rankCell: {
    display: 'flex',
    alignItems: 'center'
  },

  rankNumber: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '750'
  },

  topRank: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(129,140,248,0.18))',
    border: '1px solid rgba(56,189,248,0.25)',
    color: '#7dd3fc',
    fontWeight: '800',
    fontSize: '11px'
  },

  candidateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    minWidth: 0
  },

  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '11px',
    background: 'linear-gradient(135deg, #164e63, #3730a3)',
    border: '1px solid rgba(125,211,252,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bae6fd',
    fontSize: '14px',
    fontWeight: '800',
    flexShrink: 0
  },

  candidateName: {
    color: '#e2e8f0',
    fontSize: '12px',
    fontWeight: '650',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  finalScoreCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px'
  },

  finalScore: {
    color: '#7dd3fc',
    fontSize: '15px',
    fontWeight: '850'
  },

  progressTrack: {
    width: '100%',
    height: '4px',
    background: '#29374d',
    borderRadius: '10px',
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #38bdf8, #818cf8)'
  },

  scoreCell: {
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 9px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '750',
    whiteSpace: 'nowrap'
  },

  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'currentColor'
  },

  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 11px',
    borderRadius: '9px',
    border: '1px solid rgba(56,189,248,0.23)',
    background: 'rgba(56,189,248,0.09)',
    color: '#7dd3fc',
    fontSize: '11px',
    fontWeight: '750',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  note: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '16px',
    padding: '14px 16px',
    borderRadius: '11px',
    border: '1px solid rgba(148,163,184,0.12)',
    background: 'rgba(30,41,59,0.42)'
  },

  noteIcon: {
    color: '#7dd3fc',
    fontSize: '16px',
    flexShrink: 0
  },

  noteText: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.7,
    margin: 0
  },

  fairnessCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '24px',
    padding: '22px',
    borderRadius: '16px',
    border: '1px solid rgba(129,140,248,0.22)',
    background: 'linear-gradient(110deg, rgba(49,46,129,0.19), rgba(30,41,59,0.72))'
  },

  fairnessIcon: {
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '13px',
    background: 'rgba(129,140,248,0.12)',
    color: '#a5b4fc',
    fontSize: '28px',
    flexShrink: 0
  },

  fairnessInfo: {
    flex: 1,
    minWidth: '200px'
  },

  fairnessTitle: {
    margin: '0 0 6px',
    color: '#f1f5f9',
    fontSize: '15px',
    fontWeight: '750'
  },

  fairnessText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.7
  },

  biasBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    padding: '12px 17px',
    borderRadius: '10px',
    border: '1px solid rgba(129,140,248,0.32)',
    background: 'linear-gradient(110deg, #4f46e5, #6366f1)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer'
  },

  stateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '300px',
    padding: '35px 20px',
    borderRadius: '16px',
    border: '1px solid #273449',
    background: 'rgba(15,23,42,0.7)',
    boxSizing: 'border-box'
  },

  spinner: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '3px solid #26364d',
    borderTopColor: '#38bdf8',
    marginBottom: '20px',
    animation: 'spin 1s linear infinite'
  },

  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'rgba(56,189,248,0.1)',
    border: '1px solid rgba(56,189,248,0.2)',
    fontSize: '28px',
    marginBottom: '18px'
  },

  stateTitle: {
    margin: '0 0 8px',
    color: '#f1f5f9',
    fontSize: '19px',
    fontWeight: '750'
  },

  stateText: {
    maxWidth: '390px',
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.7,
    marginBottom: '20px'
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '20px clamp(18px, 4vw, 56px)',
    borderTop: '1px solid rgba(148,163,184,0.12)',
    color: '#64748b',
    fontSize: '11px'
  }
}

export default Rankings
