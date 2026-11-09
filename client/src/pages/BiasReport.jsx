
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBiasReport } from '../services/api'

const BiasReport = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAfter, setShowAfter] = useState(false)

  const { jobId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBiasReport(jobId)
        setReport(res.data.report)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [jobId])

  const getStatusStyle = (status) =>
    status === 'Fair'
      ? {
          color: '#6ee7b7',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(52, 211, 153, 0.35)'
        }
      : {
          color: '#fca5a5',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(248, 113, 113, 0.35)'
        }

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingCard}>
          <div style={s.spinner} />
          <h2 style={s.loadingTitle}>Generating Fairness Report</h2>
          <p style={s.loadingText}>
            Analysing candidate screening metrics...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={s.loadingPage}>
        <div style={s.errorCard}>
          <div style={s.errorIcon}>!</div>
          <h2 style={s.loadingTitle}>Unable to load report</h2>
          <p style={s.loadingText}>{error}</p>
          <button style={s.primaryBackBtn} onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  const data = showAfter
    ? report.after_mitigation
    : report.before_mitigation

  return (
    <div style={s.container}>
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      {/* Navigation */}
      <header style={s.navbar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>S</div>
          <div>
            <h1 style={s.navTitle}>Smart Recruitment</h1>
            <p style={s.navSubtitle}>ANALYTICS PLATFORM</p>
          </div>
        </div>

        <button
          style={s.backBtn}
          onClick={() => navigate(-1)}
        >
          <span style={s.backArrow}>←</span>
          Back to Rankings
        </button>
      </header>

      <main style={s.content}>
        {/* Page heading */}
        <section style={s.headingSection}>
          <div style={s.headingIcon}>✦</div>

          <div>
            <div style={s.eyebrow}>REPORTS / FAIRNESS ANALYSIS</div>
            <h2 style={s.pageTitle}>Fairness Report</h2>
            <p style={s.subtitle}>
              Explore screening outcomes and compare fairness metrics
              before and after reweighing.
            </p>
          </div>
        </section>

        {/* Summary cards */}
        <section style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryTop}>
              <span style={s.summaryLabel}>Total Candidates</span>
              <span style={s.summaryIcon}>◎</span>
            </div>
            <div style={s.summaryValue}>{report.total_candidates}</div>
            <div style={s.summaryCaption}>Candidates analysed</div>
            <div style={{ ...s.cardAccent, background: '#38bdf8' }} />
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryTop}>
              <span style={s.summaryLabel}>Junior Candidates</span>
              <span style={s.summaryIcon}>↗</span>
            </div>
            <div style={s.summaryValue}>{report.junior_count}</div>
            <div style={s.summaryCaption}>Junior experience group</div>
            <div style={{ ...s.cardAccent, background: '#818cf8' }} />
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryTop}>
              <span style={s.summaryLabel}>Senior Candidates</span>
              <span style={s.summaryIcon}>↗</span>
            </div>
            <div style={s.summaryValue}>{report.senior_count}</div>
            <div style={s.summaryCaption}>Senior experience group</div>
            <div style={{ ...s.cardAccent, background: '#c084fc' }} />
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryTop}>
              <span style={s.summaryLabel}>Median Experience</span>
              <span style={s.summaryIcon}>◷</span>
            </div>
            <div style={s.summaryValue}>
              {report.median_experience}
              <span style={s.unit}> yrs</span>
            </div>
            <div style={s.summaryCaption}>Across analysed candidates</div>
            <div style={{ ...s.cardAccent, background: '#34d399' }} />
          </div>
        </section>

        {/* Comparison controls */}
        <section style={s.analysisSection}>
          <div style={s.sectionHeader}>
            <div>
              <h3 style={s.sectionTitle}>Fairness metrics</h3>
              <p style={s.sectionDescription}>
                Compare the reported metrics for each evaluation stage.
              </p>
            </div>

            <span style={s.metricsCount}>02 METRICS</span>
          </div>

          <div style={s.toggle}>
            <button
              type="button"
              style={{
                ...s.toggleBtn,
                ...(showAfter ? {} : s.toggleActive)
              }}
              onClick={() => setShowAfter(false)}
            >
              <span style={s.toggleDotBefore} />
              Before Mitigation
            </button>

            <button
              type="button"
              style={{
                ...s.toggleBtn,
                ...(showAfter ? s.toggleActive : {})
              }}
              onClick={() => setShowAfter(true)}
            >
              <span style={s.toggleDotAfter} />
              After Reweighing
            </button>
          </div>

          <div style={s.stageBanner}>
            <span
              style={{
                ...s.stageDot,
                background: showAfter ? '#34d399' : '#38bdf8'
              }}
            />
            <span style={s.stageText}>
              Currently viewing:{' '}
              <strong style={s.stageStrong}>
                {showAfter ? 'After Reweighing' : 'Before Mitigation'}
              </strong>
            </span>
          </div>

          {/* Metric cards */}
          <div style={s.metricsGrid}>
            <div style={s.metricCard}>
              <div style={s.metricCardTop}>
                <div style={s.metricIconBlue}>↔</div>
                <span style={s.metricTag}>RATIO</span>
              </div>

              <h3 style={s.metricTitle}>Disparate Impact</h3>

              <p style={s.metricDesc}>
                Ratio of junior to senior candidate hire rates.
              </p>

              <div style={s.metricResult}>
                <span style={s.metricValue}>
                  {data.disparate_impact}
                </span>
                <span
                  style={{
                    ...s.statusBadge,
                    ...getStatusStyle(data.di_status)
                  }}
                >
                  {data.di_status}
                </span>
              </div>

              <div style={s.range}>
                <div style={s.rangeHeader}>
                  <span style={s.rangeLabel}>Reference range</span>
                  <span style={s.rangeTarget}>0.8 – 1.2</span>
                </div>

                <div style={s.rangebar}>
                  <div style={s.rangeFairZone} />
                  <div
                    style={{
                      ...s.rangeIndicator,
                      left: `${Math.min(
                        Math.max((data.disparate_impact / 2) * 100, 0),
                        100
                      )}%`,
                      background:
                        data.di_status === 'Fair' ? '#34d399' : '#fb7185'
                    }}
                  />
                </div>

                <div style={s.rangeEnds}>
                  <span>0</span>
                  <span>1</span>
                  <span>2+</span>
                </div>
              </div>

              <div style={s.metricFooter}>
                <span style={s.footerDot} />
                <span>Target range: 0.8 to 1.2</span>
              </div>
            </div>

            <div style={s.metricCard}>
              <div style={s.metricCardTop}>
                <div style={s.metricIconPurple}>±</div>
                <span style={s.metricTag}>DIFFERENCE</span>
              </div>

              <h3 style={s.metricTitle}>
                Statistical Parity Difference
              </h3>

              <p style={s.metricDesc}>
                Difference between junior and senior candidate hire rates.
              </p>

              <div style={s.metricResult}>
                <span style={s.metricValue}>
                  {data.statistical_parity_difference}
                </span>
                <span
                  style={{
                    ...s.statusBadge,
                    ...getStatusStyle(data.spd_status)
                  }}
                >
                  {data.spd_status}
                </span>
              </div>

              <div style={s.parityScale}>
                <div style={s.parityLabels}>
                  <span>-1</span>
                  <span>-0.1 to 0.1</span>
                  <span>+1</span>
                </div>

                <div style={s.parityTrack}>
                  <div style={s.parityCenter} />
                  <div
                    style={{
                      ...s.parityMarker,
                      left: `${Math.min(
                        Math.max(
                          ((Number(data.statistical_parity_difference) + 1) / 2) * 100,
                          0
                        ),
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>

              <div style={s.metricFooter}>
                <span style={s.footerDotPurple} />
                <span>Closer to zero indicates a smaller difference</span>
              </div>
            </div>
          </div>
        </section>

        {/* Explanation panel */}
        <section style={s.explainer}>
          <div style={s.explainerIcon}>
            {showAfter ? '✓' : 'i'}
          </div>

          <div style={s.explainerContent}>
            <h3 style={s.explainerTitle}>Understanding these results</h3>

            <p style={s.explainerText}>
              {showAfter
                ? 'The report is displaying the metrics after reweighing. Reweighing adjusts sample weights during model training or evaluation, depending on the implementation. Compare these values with the before-mitigation results to see whether the reported metrics moved closer to their reference ranges.'
                : 'The report is displaying the metrics before mitigation. These values describe differences in the observed hire rates between the junior and senior groups. A value outside the selected reference range may indicate a disparity, but it does not by itself prove that the difference was caused by unfair bias.'}
            </p>

            <p style={s.cautionText}>
              These metrics compare experience groups, not gender or race.
              A result within a reference range alone does not prove that a
              recruitment process is fair.
            </p>
          </div>
        </section>

        <footer style={s.pageFooter}>
          <span>SMART RECRUITMENT ANALYTICS</span>
          <span style={s.footerSeparator}>•</span>
          <span>Fairness evaluation</span>
        </footer>
      </main>
    </div>
  )
}

const s = {
  container: {
    position: 'relative',
    isolation: 'isolate',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #080d1b 0%, #0d1527 55%, #0a1020 100%)',
    color: '#f1f5f9',
    fontFamily: "Inter, 'Segoe UI', sans-serif"
  },

  glowOne: {
    position: 'absolute',
    zIndex: -1,
    top: '-200px',
    left: '-150px',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'rgba(56, 189, 248, 0.08)',
    filter: 'blur(100px)',
    pointerEvents: 'none'
  },

  glowTwo: {
    position: 'absolute',
    zIndex: -1,
    right: '-180px',
    top: '400px',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.09)',
    filter: 'blur(110px)',
    pointerEvents: 'none'
  },

  navbar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '18px',
    padding: '20px clamp(20px, 5vw, 72px)',
    background: 'rgba(13, 21, 39, 0.88)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.13)',
    backdropFilter: 'blur(18px)'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px'
  },

  brandIcon: {
    width: '43px',
    height: '43px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '13px',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    color: '#08111f',
    fontSize: '23px',
    fontWeight: '850',
    boxShadow: '0 5px 20px rgba(56, 189, 248, 0.16)'
  },

  navTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '17px',
    fontWeight: '750',
    letterSpacing: '-0.3px'
  },

  navSubtitle: {
    margin: '5px 0 0',
    color: '#7dd3fc',
    fontSize: '9px',
    fontWeight: '750',
    letterSpacing: '2px'
  },

  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    padding: '11px 16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: 'rgba(30, 41, 59, 0.75)',
    color: '#e2e8f0',
    fontSize: '12px',
    fontWeight: '650',
    cursor: 'pointer'
  },

  backArrow: {
    fontSize: '17px',
    color: '#7dd3fc'
  },

  content: {
    width: '100%',
    maxWidth: '1250px',
    boxSizing: 'border-box',
    padding: '42px clamp(20px, 5vw, 64px) 30px',
    margin: '0 auto'
  },

  headingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '17px',
    marginBottom: '30px'
  },

  headingIcon: {
    width: '57px',
    height: '57px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '17px',
    background: 'rgba(56, 189, 248, 0.11)',
    border: '1px solid rgba(56, 189, 248, 0.23)',
    color: '#7dd3fc',
    fontSize: '27px'
  },

  eyebrow: {
    marginBottom: '8px',
    color: '#7dd3fc',
    fontSize: '10px',
    fontWeight: '750',
    letterSpacing: '2px'
  },

  pageTitle: {
    margin: '0 0 7px',
    color: '#f8fafc',
    fontSize: 'clamp(25px, 3vw, 34px)',
    lineHeight: 1.2,
    fontWeight: '800',
    letterSpacing: '-1px'
  },

  subtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.7
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
    gap: '16px',
    marginBottom: '42px'
  },

  summaryCard: {
    position: 'relative',
    overflow: 'hidden',
    minWidth: 0,
    padding: '22px 21px',
    borderRadius: '17px',
    border: '1px solid rgba(148, 163, 184, 0.13)',
    background: 'linear-gradient(145deg, rgba(24, 36, 59, 0.96), rgba(17, 25, 45, 0.96))',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.10)'
  },

  summaryTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '20px'
  },

  summaryLabel: {
    color: '#a8b5ca',
    fontSize: '12px',
    fontWeight: '600'
  },

  summaryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '31px',
    height: '31px',
    borderRadius: '10px',
    background: 'rgba(56, 189, 248, 0.10)',
    color: '#7dd3fc',
    fontSize: '19px'
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: '31px',
    lineHeight: 1.2,
    fontWeight: '800',
    letterSpacing: '-0.8px',
    overflowWrap: 'anywhere'
  },

  unit: {
    color: '#94a3b8',
    fontSize: '15px',
    fontWeight: '600'
  },

  summaryCaption: {
    marginTop: '9px',
    color: '#71819b',
    fontSize: '11px'
  },

  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '3px',
    opacity: 0.8
  },

  analysisSection: {
    marginBottom: '27px'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '20px'
  },

  sectionTitle: {
    margin: '0 0 7px',
    color: '#f1f5f9',
    fontSize: '21px',
    fontWeight: '750',
    letterSpacing: '-0.4px'
  },

  sectionDescription: {
    margin: 0,
    color: '#8493aa',
    fontSize: '12px',
    lineHeight: 1.6
  },

  metricsCount: {
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    background: 'rgba(30, 41, 59, 0.6)',
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px'
  },

  toggle: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '6px',
    marginBottom: '15px',
    borderRadius: '13px',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    background: 'rgba(11, 18, 34, 0.78)'
  },

  toggleBtn: {
    flex: '1 1 190px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    padding: '13px 15px',
    border: '1px solid transparent',
    borderRadius: '9px',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '650',
    cursor: 'pointer'
  },

  toggleActive: {
    border: '1px solid rgba(56, 189, 248, 0.18)',
    background: 'linear-gradient(110deg, rgba(56, 189, 248, 0.16), rgba(129, 140, 248, 0.12))',
    color: '#e0f2fe',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)'
  },

  toggleDotBefore: {
    width: '7px',
    height: '7px',
    flexShrink: 0,
    borderRadius: '50%',
    background: '#38bdf8'
  },

  toggleDotAfter: {
    width: '7px',
    height: '7px',
    flexShrink: 0,
    borderRadius: '50%',
    background: '#34d399'
  },

  stageBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 15px',
    marginBottom: '18px',
    borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.10)',
    background: 'rgba(17, 25, 45, 0.7)'
  },

  stageDot: {
    width: '8px',
    height: '8px',
    flexShrink: 0,
    borderRadius: '50%'
  },

  stageText: {
    color: '#94a3b8',
    fontSize: '12px'
  },

  stageStrong: {
    color: '#e2e8f0'
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
    gap: '18px'
  },

  metricCard: {
    minWidth: 0,
    padding: '25px',
    borderRadius: '18px',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background: 'linear-gradient(150deg, rgba(24, 36, 59, 0.97), rgba(15, 23, 42, 0.97))',
    boxShadow: '0 16px 38px rgba(0, 0, 0, 0.12)'
  },

  metricCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '22px'
  },

  metricIconBlue: {
    width: '43px',
    height: '43px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '13px',
    background: 'rgba(56, 189, 248, 0.12)',
    color: '#7dd3fc',
    fontSize: '24px',
    fontWeight: '700'
  },

  metricIconPurple: {
    width: '43px',
    height: '43px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '13px',
    background: 'rgba(167, 139, 250, 0.13)',
    color: '#c4b5fd',
    fontSize: '25px',
    fontWeight: '700'
  },

  metricTag: {
    color: '#71819b',
    fontSize: '10px',
    fontWeight: '750',
    letterSpacing: '1.5px'
  },

  metricTitle: {
    margin: '0 0 10px',
    color: '#f1f5f9',
    fontSize: '18px',
    lineHeight: 1.4,
    fontWeight: '750'
  },

  metricDesc: {
    minHeight: '38px',
    margin: '0 0 21px',
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.7
  },

  metricResult: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '22px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)'
  },

  metricValue: {
    color: '#f8fafc',
    fontSize: 'clamp(29px, 4vw, 38px)',
    fontWeight: '800',
    lineHeight: 1.2,
    letterSpacing: '-1px',
    overflowWrap: 'anywhere'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '750'
  },

  range: {
    marginTop: '22px'
  },

  rangeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px'
  },

  rangeLabel: {
    color: '#94a3b8',
    fontSize: '11px'
  },

  rangeTarget: {
    color: '#6ee7b7',
    fontSize: '11px',
    fontWeight: '700'
  },

  rangebar: {
    position: 'relative',
    height: '7px',
    borderRadius: '10px',
    background: '#29354c',
    overflow: 'visible'
  },

  rangeFairZone: {
    position: 'absolute',
    left: '40%',
    width: '20%',
    height: '100%',
    borderRadius: '10px',
    background: 'rgba(52, 211, 153, 0.5)'
  },

  rangeIndicator: {
    position: 'absolute',
    top: '-4px',
    width: '15px',
    height: '15px',
    border: '3px solid #18243b',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 12px rgba(0, 0, 0, 0.35)'
  },

  rangeEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '9px',
    color: '#64748b',
    fontSize: '10px'
  },

  parityScale: {
    marginTop: '22px'
  },

  parityLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '12px',
    color: '#94a3b8',
    fontSize: '10px'
  },

  parityTrack: {
    position: 'relative',
    height: '7px',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #f87171 0%, #334155 40%, #34d399 50%, #334155 60%, #f87171 100%)'
  },

  parityCenter: {
    position: 'absolute',
    left: '50%',
    top: '-4px',
    height: '15px',
    width: '2px',
    background: '#f8fafc',
    opacity: 0.8
  },

  parityMarker: {
    position: 'absolute',
    top: '-4px',
    width: '15px',
    height: '15px',
    border: '3px solid #18243b',
    borderRadius: '50%',
    background: '#c4b5fd',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 12px rgba(167, 139, 250, 0.4)'
  },

  metricFooter: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    marginTop: '23px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(148, 163, 184, 0.10)',
    color: '#71819b',
    fontSize: '10px',
    lineHeight: 1.6
  },

  footerDot: {
    width: '6px',
    height: '6px',
    flexShrink: 0,
    marginTop: '4px',
    borderRadius: '50%',
    background: '#38bdf8'
  },

  footerDotPurple: {
    width: '6px',
    height: '6px',
    flexShrink: 0,
    marginTop: '4px',
    borderRadius: '50%',
    background: '#a78bfa'
  },

  explainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '17px',
    marginTop: '24px',
    padding: '25px',
    borderRadius: '17px',
    border: '1px solid rgba(56, 189, 248, 0.18)',
    background: 'linear-gradient(120deg, rgba(14, 116, 144, 0.10), rgba(30, 41, 59, 0.6))'
  },

  explainerIcon: {
    width: '39px',
    height: '39px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(56, 189, 248, 0.13)',
    border: '1px solid rgba(56, 189, 248, 0.18)',
    color: '#7dd3fc',
    fontSize: '19px',
    fontWeight: '800'
  },

  explainerContent: {
    minWidth: 0,
    flex: 1
  },

  explainerTitle: {
    margin: '2px 0 11px',
    color: '#f1f5f9',
    fontSize: '16px',
    fontWeight: '750'
  },

  explainerText: {
    margin: 0,
    color: '#a8b5ca',
    fontSize: '12px',
    lineHeight: 1.9
  },

  cautionText: {
    margin: '13px 0 0',
    paddingTop: '12px',
    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
    color: '#7dd3fc',
    fontSize: '11px',
    lineHeight: 1.8
  },

  pageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '35px',
    paddingTop: '21px',
    borderTop: '1px solid rgba(148, 163, 184, 0.10)',
    color: '#64748b',
    fontSize: '9px',
    fontWeight: '650',
    letterSpacing: '1.3px'
  },

  footerSeparator: {
    color: '#38bdf8'
  },

  loadingPage: {
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#080d1b',
    fontFamily: "Inter, 'Segoe UI', sans-serif",
    color: '#f1f5f9'
  },

  loadingCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '35px 25px',
    textAlign: 'center',
    borderRadius: '20px',
    border: '1px solid #29354c',
    background: '#11192d'
  },

  spinner: {
    width: '36px',
    height: '36px',
    margin: '0 auto 22px',
    border: '3px solid #29354c',
    borderTop: '3px solid #38bdf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },

  loadingTitle: {
    margin: '0 0 10px',
    color: '#f8fafc',
    fontSize: '20px',
    fontWeight: '750'
  },

  loadingText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.7
  },

  errorCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '35px 25px',
    textAlign: 'center',
    borderRadius: '20px',
    border: '1px solid rgba(248, 113, 113, 0.22)',
    background: '#11192d'
  },

  errorIcon: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fca5a5',
    fontSize: '24px',
    fontWeight: '800'
  },

  primaryBackBtn: {
    marginTop: '22px',
    padding: '11px 20px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(110deg, #38bdf8, #818cf8)',
    color: '#08111f',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer'
  }
}

export default BiasReport
