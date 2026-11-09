
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCandidateDetail } from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

const CandidateDetail = () => {
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCandidateDetail(id)
        setCandidate(res.data.candidate)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return <div style={s.loading}>
      <div style={s.loadingBox}>
        <div style={s.spinner}></div>
        <p>Loading candidate details...</p>
      </div>
    </div>
  }

  if (!candidate) {
    return (
      <div style={s.loading}>
        <div style={s.emptyCard}>
          <span style={s.emptyIcon}>!</span>
          <h2>Candidate not found</h2>
          <p>The candidate details could not be loaded.</p>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  const getBadgeStyle = (badge) => {
    if (badge === 'Strong Match')
      return {
        background: 'rgba(34,197,94,0.12)',
        color: '#4ade80',
        border: '1px solid rgba(34,197,94,0.35)'
      }

    if (badge === 'Partial Match')
      return {
        background: 'rgba(245,158,11,0.12)',
        color: '#fbbf24',
        border: '1px solid rgba(245,158,11,0.35)'
      }

    return {
      background: 'rgba(239,68,68,0.12)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.35)'
    }
  }

  // SHAP chart data
  const shapData = Object.entries(candidate.shap_explanation || {})
    .map(([key, val]) => ({
      feature: key,
      value: parseFloat(val),
      color: val >= 0 ? '#22c55e' : '#ef4444'
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  // Scoring methods data
  const scoreData = [
    {
      method: 'XGBoost',
      score: (candidate.xgb_probability * 100).toFixed(1)
    },
    {
      method: 'ANN',
      score: (candidate.ann_probability * 100).toFixed(1)
    },
    {
      method: 'Similarity',
      score: (candidate.embedding_similarity * 100).toFixed(1)
    },
    {
      method: 'Keyword',
      score: (candidate.keyword_score * 100).toFixed(1)
    }
  ]

  return (
    <div style={s.container}>
      {/* Navigation */}
      <header style={s.navbar}>
        <div style={s.brand}>
          <div style={s.logo}>S</div>
          <div>
            <h1 style={s.navTitle}>Smart Recruitment</h1>
            <span style={s.navSubtitle}>ANALYTICS PLATFORM</span>
          </div>
        </div>

        <button
          style={s.backBtn}
          onClick={() => navigate(-1)}
        >
          <span>←</span> Back to Rankings
        </button>
      </header>

      <main style={s.content}>
        {/* Page heading */}
        <div style={s.pageHeading}>
          <div>
            <div style={s.eyebrow}>CANDIDATE ANALYSIS</div>
            <h2 style={s.pageTitle}>Candidate Details</h2>
            <p style={s.pageSubtitle}>
              Review candidate information, screening scores and model explanations.
            </p>
          </div>
          <div style={s.recordBadge}>
            <span style={s.recordDot}></span>
            Candidate Record
          </div>
        </div>

        {/* Candidate overview */}
        <section style={s.heroCard}>
          <div style={s.heroLeft}>
            <div style={s.avatar}>
              {(candidate.filename?.replace('.pdf', '') || 'C')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div style={s.candidateInfo}>
              <span style={s.sectionEyebrow}>CANDIDATE PROFILE</span>
              <h2 style={s.name}>
                {candidate.filename?.replace('.pdf', '') || 'Unnamed Candidate'}
              </h2>
              <div style={s.badgeRow}>
                <span style={{
                  ...s.badge,
                  ...getBadgeStyle(candidate.match_badge)
                }}>
                  {candidate.match_badge || 'Not classified'}
                </span>
                <span style={s.profileNote}>Screening assessment</span>
              </div>
            </div>
          </div>

          <div style={s.scorePanel}>
            <span style={s.scoreLabel}>FINAL SCREENING SCORE</span>
            <div style={s.scoreNumber}>
              {(candidate.final_score * 100).toFixed(1)}
              <span style={s.percent}>%</span>
            </div>
            <div style={s.scoreTrack}>
              <div style={{
                ...s.scoreFill,
                width: `${Math.min(
                  Math.max(candidate.final_score * 100, 0),
                  100
                )}%`
              }} />
            </div>
            <span style={s.scoreFootnote}>
              Combined screening score
            </span>
          </div>
        </section>

        {/* Main grid */}
        <div style={s.grid}>
          {/* Extracted features */}
          <section style={s.card}>
            <div style={s.cardHeading}>
              <div style={s.cardIcon}>▤</div>
              <div>
                <h3 style={s.cardTitle}>Extracted CV Features</h3>
                <p style={s.cardSubtitle}>
                  Information extracted from the candidate's CV
                </p>
              </div>
            </div>

            <div style={s.featureList}>
              {Object.entries(candidate.features || {}).length > 0 ? (
                Object.entries(candidate.features || {}).map(([key, val]) => (
                  <div key={key} style={s.featureRow}>
                    <span style={s.featureKey}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={s.featureVal}>
                      {String(val ?? '—')}
                    </span>
                  </div>
                ))
              ) : (
                <p style={s.emptyText}>No extracted features available.</p>
              )}
            </div>
          </section>

          {/* Scoring breakdown */}
          <section style={s.card}>
            <div style={s.cardHeading}>
              <div style={s.cardIcon}>▥</div>
              <div>
                <h3 style={s.cardTitle}>Scoring Breakdown</h3>
                <p style={s.cardSubtitle}>
                  Scores from the individual screening methods
                </p>
              </div>
            </div>

            <div style={s.chartContainer}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={scoreData}
                  margin={{ top: 10, right: 8, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#29364d"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="method"
                    tick={{ fill: '#9caec5', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9caec5', fontSize: 11 }}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#101a2d',
                      border: '1px solid #34445f',
                      borderRadius: '10px',
                      color: '#f1f5f9'
                    }}
                    formatter={(val) => [`${val}%`, 'Score']}
                    cursor={{ fill: 'rgba(56,189,248,0.06)' }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  >
                    {scoreData.map((item, i) => (
                      <Cell
                        key={i}
                        fill={['#38bdf8', '#818cf8', '#2dd4bf', '#fbbf24'][i]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.scoreGrid}>
              {scoreData.map((item, i) => (
                <div key={i} style={s.scoreItem}>
                  <span style={{
                    ...s.scoreDot,
                    background: ['#38bdf8', '#818cf8', '#2dd4bf', '#fbbf24'][i]
                  }} />
                  <span style={s.scoreItemLabel}>{item.method}</span>
                  <span style={s.scoreItemVal}>{item.score}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* SHAP explanation */}
          <section style={s.cardFull}>
            <div style={s.cardHeading}>
              <div style={s.cardIconPurple}>⌕</div>
              <div>
                <h3 style={s.cardTitle}>SHAP Explanation</h3>
                <p style={s.cardSubtitle}>
                  Feature contributions to the model output
                </p>
              </div>
              <div style={s.legend}>
                <span><i style={{ ...s.legendDot, background: '#22c55e' }} /> Positive</span>
                <span><i style={{ ...s.legendDot, background: '#ef4444' }} /> Negative</span>
              </div>
            </div>

            <p style={s.shapDesc}>
              Positive values indicate features pushing the model output higher;
              negative values indicate features pushing it lower. The meaning
              depends on the model output being explained.
            </p>

            {shapData.length > 0 ? (
              <div style={s.shapChart}>
                <ResponsiveContainer width="100%" height={Math.max(250, shapData.length * 45)}>
                  <BarChart
                    data={shapData}
                    layout="vertical"
                    margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#29364d"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: '#9caec5', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      width={120}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#101a2d',
                        border: '1px solid #34445f',
                        borderRadius: '10px',
                        color: '#f1f5f9'
                      }}
                      formatter={(val) => [
                        Number(val).toFixed(4),
                        'SHAP Value'
                      ]}
                    />
                    <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                      {shapData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.value >= 0 ? '#22c55e' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={s.chartEmpty}>
                <span style={s.chartEmptyIcon}>⌁</span>
                <p>No SHAP explanation data is available for this candidate.</p>
              </div>
            )}
          </section>

          {/* CV preview */}
          <section style={s.cardFull}>
            <div style={s.cardHeading}>
              <div style={s.cardIcon}>▤</div>
              <div>
                <h3 style={s.cardTitle}>CV Text Preview</h3>
                <p style={s.cardSubtitle}>
                  Extracted text available for review
                </p>
              </div>
            </div>

            <div style={s.cvPreview}>
              <div style={s.cvTopBar}>
                <span style={s.cvFileIcon}>PDF</span>
                <span style={s.cvFileName}>
                  {candidate.filename || 'Candidate CV'}
                </span>
              </div>
              <p style={s.cvText}>
                {candidate.cv_text_preview || 'No preview available'}
              </p>
            </div>
          </section>
        </div>

        <footer style={s.footer}>
          <span>Smart Recruitment Analytics Platform</span>
          <span>Candidate Screening & Analysis</span>
        </footer>
      </main>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: '#0a1020',
    color: '#f1f5f9',
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
    boxSizing: 'border-box'
  },

  loading: {
    minHeight: '100vh',
    width: '100%',
    background: '#0a1020',
    color: '#a9b8cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },

  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
    color: '#9caec5'
  },

  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #26354e',
    borderTop: '3px solid #38bdf8',
    borderRadius: '50%',
    animation: 'candidateSpin 0.8s linear infinite'
  },

  emptyCard: {
    textAlign: 'center',
    background: '#111b2e',
    border: '1px solid #29364d',
    borderRadius: '18px',
    padding: '36px',
    maxWidth: '420px'
  },

  emptyIcon: {
    display: 'inline-flex',
    width: '42px',
    height: '42px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#35202b',
    color: '#fca5a5',
    fontSize: '24px',
    marginBottom: '12px'
  },

  emptyText: {
    color: '#8495ad',
    fontSize: '14px',
    padding: '12px 0'
  },

  navbar: {
    minHeight: '76px',
    padding: '14px 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
    background: '#0e1729',
    borderBottom: '1px solid #26334a',
    boxSizing: 'border-box'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  logo: {
    width: '42px',
    height: '42px',
    borderRadius: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    color: '#07111f',
    fontSize: '23px',
    fontWeight: '900',
    boxShadow: '0 5px 20px rgba(56,189,248,0.15)'
  },

  navTitle: {
    margin: 0,
    color: '#f1f5f9',
    fontSize: '17px',
    fontWeight: '750',
    letterSpacing: '-0.3px'
  },

  navSubtitle: {
    display: 'block',
    color: '#38bdf8',
    fontSize: '9px',
    fontWeight: '800',
    letterSpacing: '2px',
    marginTop: '4px'
  },

  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#18243a',
    color: '#dbe7f6',
    border: '1px solid #34445e',
    padding: '10px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '650',
    transition: 'background 0.2s'
  },

  content: {
    width: '100%',
    maxWidth: '1500px',
    padding: '36px 5%',
    margin: '0 auto',
    boxSizing: 'border-box'
  },

  pageHeading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '26px'
  },

  eyebrow: {
    color: '#38bdf8',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2px',
    marginBottom: '8px'
  },

  pageTitle: {
    color: '#f1f5f9',
    fontSize: '30px',
    letterSpacing: '-0.8px',
    margin: '0 0 8px',
    fontWeight: '800'
  },

  pageSubtitle: {
    color: '#8fa2bb',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0
  },

  recordBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    color: '#a8bad0',
    background: '#111b2e',
    border: '1px solid #29364d',
    borderRadius: '30px',
    padding: '10px 15px',
    fontSize: '12px',
    fontWeight: '600'
  },

  recordDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#38bdf8',
    boxShadow: '0 0 10px rgba(56,189,248,0.6)'
  },

  heroCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '28px',
    flexWrap: 'wrap',
    background: 'linear-gradient(120deg, #131f35 0%, #111a2c 65%, #172039 100%)',
    border: '1px solid #2a3a55',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
    boxSizing: 'border-box'
  },

  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flex: '1 1 300px',
    minWidth: 0
  },

  avatar: {
    width: '64px',
    height: '64px',
    flexShrink: 0,
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #164e63, #3730a3)',
    color: '#dbeafe',
    border: '1px solid #3c6090',
    fontSize: '27px',
    fontWeight: '800'
  },

  candidateInfo: {
    minWidth: 0
  },

  sectionEyebrow: {
    display: 'block',
    color: '#8195b1',
    fontSize: '10px',
    letterSpacing: '1.8px',
    fontWeight: '750',
    marginBottom: '7px'
  },

  name: {
    color: '#f8fafc',
    fontSize: 'clamp(18px, 2.3vw, 25px)',
    fontWeight: '750',
    letterSpacing: '-0.5px',
    margin: '0 0 13px',
    overflowWrap: 'anywhere'
  },

  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },

  badge: {
    display: 'inline-block',
    padding: '6px 11px',
    borderRadius: '30px',
    fontSize: '11px',
    fontWeight: '750'
  },

  profileNote: {
    color: '#8293aa',
    fontSize: '11px'
  },

  scorePanel: {
    flex: '0 1 260px',
    minWidth: '220px',
    padding: '18px 20px',
    background: 'rgba(7,15,30,0.5)',
    border: '1px solid #2a3a55',
    borderRadius: '15px',
    boxSizing: 'border-box'
  },

  scoreLabel: {
    display: 'block',
    color: '#8ea3bd',
    fontSize: '10px',
    fontWeight: '750',
    letterSpacing: '1.3px',
    marginBottom: '8px'
  },

  scoreNumber: {
    color: '#67d5ff',
    fontSize: '38px',
    lineHeight: '1.2',
    fontWeight: '850',
    letterSpacing: '-1.5px',
    marginBottom: '12px'
  },

  percent: {
    fontSize: '20px',
    marginLeft: '3px',
    color: '#8b9cff'
  },

  scoreTrack: {
    width: '100%',
    height: '6px',
    background: '#28364d',
    borderRadius: '20px',
    overflow: 'hidden'
  },

  scoreFill: {
    height: '100%',
    borderRadius: '20px',
    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
    transition: 'width 0.4s ease'
  },

  scoreFootnote: {
    display: 'block',
    color: '#788ca7',
    fontSize: '10px',
    marginTop: '9px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '22px',
    alignItems: 'start'
  },

  card: {
    minWidth: 0,
    background: '#111b2e',
    border: '1px solid #29374f',
    borderRadius: '17px',
    padding: '24px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
    boxSizing: 'border-box'
  },

  cardFull: {
    gridColumn: '1 / -1',
    minWidth: 0,
    background: '#111b2e',
    border: '1px solid #29374f',
    borderRadius: '17px',
    padding: '24px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
    boxSizing: 'border-box'
  },

  cardHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    marginBottom: '23px',
    flexWrap: 'wrap'
  },

  cardIcon: {
    width: '42px',
    height: '42px',
    flexShrink: 0,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#67d5ff',
    background: 'rgba(56,189,248,0.10)',
    border: '1px solid rgba(56,189,248,0.16)',
    fontSize: '22px'
  },

  cardIconPurple: {
    width: '42px',
    height: '42px',
    flexShrink: 0,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a5b4fc',
    background: 'rgba(129,140,248,0.12)',
    border: '1px solid rgba(129,140,248,0.2)',
    fontSize: '24px'
  },

  cardTitle: {
    color: '#f1f5f9',
    fontSize: '16px',
    fontWeight: '750',
    margin: '0 0 5px'
  },

  cardSubtitle: {
    color: '#8295af',
    fontSize: '11px',
    lineHeight: '1.5',
    margin: 0
  },

  featureList: {
    width: '100%'
  },

  featureRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '15px',
    padding: '13px 0',
    borderBottom: '1px solid #26334a'
  },

  featureKey: {
    color: '#92a4bd',
    fontSize: '12px',
    textTransform: 'capitalize',
    overflowWrap: 'anywhere',
    flex: '1 1 45%'
  },

  featureVal: {
    color: '#e2eaf5',
    fontSize: '12px',
    fontWeight: '650',
    textAlign: 'right',
    overflowWrap: 'anywhere',
    flex: '1 1 45%'
  },

  chartContainer: {
    width: '100%',
    minWidth: 0
  },

  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '12px'
  },

  scoreItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    background: '#0b1425',
    border: '1px solid #24334a',
    borderRadius: '10px',
    padding: '12px'
  },

  scoreDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0
  },

  scoreItemLabel: {
    color: '#9bacc2',
    fontSize: '11px',
    flex: '1'
  },

  scoreItemVal: {
    color: '#e8f3ff',
    fontWeight: '750',
    fontSize: '13px'
  },

  legend: {
    display: 'flex',
    gap: '15px',
    marginLeft: 'auto',
    color: '#9aacc2',
    fontSize: '11px',
    flexWrap: 'wrap'
  },

  legendDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    marginRight: '5px'
  },

  shapDesc: {
    color: '#91a3bb',
    fontSize: '12px',
    lineHeight: '1.7',
    margin: '-5px 0 20px'
  },

  shapChart: {
    width: '100%',
    minWidth: 0
  },

  chartEmpty: {
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#8495ad',
    background: '#0b1425',
    border: '1px dashed #34445e',
    borderRadius: '12px',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px'
  },

  chartEmptyIcon: {
    color: '#8191ff',
    fontSize: '30px'
  },

  cvPreview: {
    background: '#0b1425',
    border: '1px solid #26354d',
    borderRadius: '12px',
    overflow: 'hidden'
  },

  cvTopBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 16px',
    background: '#152139',
    borderBottom: '1px solid #29374f'
  },

  cvFileIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#3a2633',
    color: '#fda4af',
    borderRadius: '5px',
    padding: '5px 7px',
    fontSize: '9px',
    fontWeight: '850'
  },

  cvFileName: {
    color: '#c6d3e5',
    fontSize: '12px',
    overflowWrap: 'anywhere'
  },

  cvText: {
    color: '#a8b7cb',
    fontSize: '12px',
    lineHeight: '1.9',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    margin: 0,
    padding: '20px',
    maxHeight: '400px',
    overflowY: 'auto'
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    color: '#657991',
    fontSize: '10px',
    borderTop: '1px solid #202d43',
    marginTop: '30px',
    padding: '20px 0 4px'
  }
}

export default CandidateDetail
