
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../services/api'

const CreateJob = () => {
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createJob({ ...formData, required_skills: skills })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      <main style={s.wrapper}>
        <button
          type="button"
          style={s.backBtn}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#26364e'
            e.currentTarget.style.borderColor = '#38bdf8'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#172338'
            e.currentTarget.style.borderColor = '#334155'
          }}
        >
          <span style={s.backIcon}>←</span>
          Back to Dashboard
        </button>

        <div style={s.card}>
          <div style={s.topAccent} />

          <div style={s.heading}>
            <div style={s.iconBox}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M12 11v5M9.5 13.5h5" />
              </svg>
            </div>

            <div>
              <p style={s.eyebrow}>RECRUITMENT MANAGEMENT</p>
              <h1 style={s.title}>Create New Job</h1>
              <p style={s.subtitle}>
                Set up a new opportunity and find the right candidates.
              </p>
            </div>
          </div>

          <div style={s.divider} />

          {error && (
            <div style={s.error}>
              <span style={s.errorIcon}>!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.sectionHeading}>
              <span style={s.sectionNumber}>01</span>
              <span style={s.sectionTitle}>Job Information</span>
            </div>

            <label style={s.label} htmlFor="job-title">
              Job Title <span style={s.required}>*</span>
            </label>

            <input
              id="job-title"
              style={s.input}
              type="text"
              placeholder="e.g. Data Scientist"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              onFocus={e => {
                e.currentTarget.style.borderColor = '#38bdf8'
                e.currentTarget.style.boxShadow = '0 0 0 3px #38bdf81c'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#334155'
                e.currentTarget.style.boxShadow = 'none'
              }}
              required
            />

            <label style={s.label} htmlFor="job-description">
              Job Description <span style={s.required}>*</span>
            </label>

            <textarea
              id="job-description"
              style={s.textarea}
              rows={6}
              placeholder="Describe the role, responsibilities, qualifications, and what makes this opportunity special..."
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              onFocus={e => {
                e.currentTarget.style.borderColor = '#38bdf8'
                e.currentTarget.style.boxShadow = '0 0 0 3px #38bdf81c'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#334155'
                e.currentTarget.style.boxShadow = 'none'
              }}
              required
            />

            <div style={s.sectionHeading}>
              <span style={s.sectionNumber}>02</span>
              <span style={s.sectionTitle}>Required Skills</span>
              <span style={s.optionalBadge}>Add relevant skills</span>
            </div>

            <p style={s.helperText}>
              Add the technical or professional skills candidates should have.
            </p>

            <div style={s.skillRow}>
              <div style={s.skillInputWrap}>
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  style={s.skillInput}
                  type="text"
                  placeholder="e.g. Python, SQL, Machine Learning"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addSkill())
                  }
                  onFocus={e => {
                    e.currentTarget.parentElement.style.borderColor = '#38bdf8'
                  }}
                  onBlur={e => {
                    e.currentTarget.parentElement.style.borderColor = '#334155'
                  }}
                />
              </div>

              <button
                type="button"
                style={s.addBtn}
                onClick={addSkill}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#7dd3fc'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#38bdf8'
                }}
              >
                <span style={s.plus}>+</span> Add Skill
              </button>
            </div>

            <div style={s.skillArea}>
              {skills.length > 0 ? (
                <>
                  <div style={s.skillAreaHeader}>
                    <span style={s.skillCount}>
                      {skills.length} {skills.length === 1 ? 'skill' : 'skills'} added
                    </span>
                    <span style={s.skillHint}>Click × to remove</span>
                  </div>

                  <div style={s.tags}>
                    {skills.map((sk, i) => (
                      <span key={i} style={s.tag}>
                        <span style={s.tagDot} />
                        {sk}
                        <button
                          type="button"
                          aria-label={`Remove ${sk}`}
                          style={s.remove}
                          onClick={() =>
                            setSkills(skills.filter(s => s !== sk))
                          }
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#f87171'
                            e.currentTarget.style.background = '#7f1d1d'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = '#94a3b8'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={s.emptySkills}>
                  <span style={s.emptyIcon}>＋</span>
                  <span>No skills added yet</span>
                  <span style={s.emptyHint}>
                    Your required skills will appear here.
                  </span>
                </div>
              )}
            </div>

            <div style={s.footerDivider} />

            <div style={s.formFooter}>
              <p style={s.footerNote}>
                <span style={s.required}>*</span> Required fields
              </p>

              <div style={s.actions}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>

                <button
                  style={{
                    ...s.submitBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  type="submit"
                  disabled={loading}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.background = '#7dd3fc'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px #38bdf82e'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#38bdf8'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={s.spinner} />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Job
                      <span style={s.submitArrow}>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <p style={s.bottomNote}>
          <span style={s.bottomDot} />
          Smart Recruitment Analytics Platform
        </p>
      </main>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    background: '#0b1120',
    padding: '36px 20px 28px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#e2e8f0'
  },
  glowOne: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: '#0ea5e9',
    opacity: 0.07,
    filter: 'blur(100px)',
    top: '-180px',
    right: '-100px',
    pointerEvents: 'none'
  },
  glowTwo: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: '#6366f1',
    opacity: 0.06,
    filter: 'blur(100px)',
    bottom: '-100px',
    left: '-100px',
    pointerEvents: 'none'
  },
  wrapper: {
    width: '100%',
    maxWidth: '760px',
    position: 'relative',
    zIndex: 1
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#172338',
    color: '#cbd5e1',
    border: '1px solid #334155',
    padding: '10px 15px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
    transition: 'all 0.2s ease'
  },
  backIcon: {
    fontSize: '19px',
    lineHeight: 1,
    color: '#38bdf8'
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(145deg, #172338 0%, #111c2e 100%)',
    border: '1px solid #29384e',
    borderRadius: '18px',
    padding: '32px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    boxShadow: '0 24px 70px #00000030'
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: '32px',
    right: '32px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)'
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '26px'
  },
  iconBox: {
    width: '58px',
    height: '58px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#38bdf8',
    background: 'linear-gradient(145deg, #12334a, #172c48)',
    border: '1px solid #28516c',
    borderRadius: '15px'
  },
  eyebrow: {
    margin: '0 0 7px',
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#38bdf8',
    fontWeight: 800
  },
  title: {
    margin: '0 0 7px',
    fontSize: '27px',
    fontWeight: 750,
    letterSpacing: '-0.8px',
    color: '#f1f5f9'
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#94a3b8'
  },
  divider: {
    height: '1px',
    background: '#29384e',
    marginBottom: '26px'
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '25px',
    marginBottom: '17px'
  },
  sectionNumber: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#38bdf8',
    background: '#12334a',
    border: '1px solid #28516c',
    borderRadius: '6px',
    padding: '5px 7px'
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: 700
  },
  optionalBadge: {
    marginLeft: 'auto',
    color: '#94a3b8',
    fontSize: '11px',
    background: '#1e293b',
    border: '1px solid #334155',
    padding: '5px 9px',
    borderRadius: '20px'
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 650,
    marginBottom: '8px',
    marginTop: '18px'
  },
  required: {
    color: '#38bdf8',
    fontWeight: 800
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid #334155',
    outline: 'none',
    background: '#0b1424',
    color: '#f1f5f9',
    fontSize: '13px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid #334155',
    outline: 'none',
    background: '#0b1424',
    color: '#f1f5f9',
    fontSize: '13px',
    lineHeight: 1.7,
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '145px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  helperText: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.6,
    margin: '-7px 0 14px'
  },
  skillRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '10px',
    marginBottom: '12px'
  },
  skillInputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
    background: '#0b1424',
    border: '1px solid #334155',
    borderRadius: '9px',
    padding: '0 12px',
    transition: 'border-color 0.2s ease'
  },
  skillInput: {
    width: '100%',
    minWidth: 0,
    padding: '13px 0',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#f1f5f9',
    fontSize: '12px',
    boxSizing: 'border-box'
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flexShrink: 0,
    background: '#38bdf8',
    color: '#082f49',
    border: 'none',
    padding: '0 17px',
    borderRadius: '9px',
    fontWeight: 750,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  plus: {
    fontSize: '20px',
    fontWeight: 400,
    lineHeight: 1
  },
  skillArea: {
    background: '#0b1424',
    border: '1px solid #253349',
    borderRadius: '11px',
    padding: '15px',
    minHeight: '105px',
    boxSizing: 'border-box'
  },
  skillAreaHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '13px'
  },
  skillCount: {
    color: '#cbd5e1',
    fontSize: '11px',
    fontWeight: 700
  },
  skillHint: {
    color: '#64748b',
    fontSize: '10px'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: '#123047',
    color: '#bae6fd',
    border: '1px solid #23516a',
    padding: '6px 7px 6px 10px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 550
  },
  tagDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#38bdf8'
  },
  remove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '5px',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '17px',
    lineHeight: 1,
    transition: 'all 0.2s ease'
  },
  emptySkills: {
    minHeight: '75px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#94a3b8',
    fontSize: '12px',
    textAlign: 'center'
  },
  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '27px',
    height: '27px',
    borderRadius: '8px',
    border: '1px dashed #475569',
    color: '#64748b',
    fontSize: '20px',
    marginBottom: '2px'
  },
  emptyHint: {
    color: '#64748b',
    fontSize: '11px'
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#351b27',
    color: '#fda4af',
    border: '1px solid #7f3346',
    padding: '12px 14px',
    borderRadius: '9px',
    marginBottom: '20px',
    fontSize: '13px',
    lineHeight: 1.5
  },
  errorIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '21px',
    height: '21px',
    flexShrink: 0,
    borderRadius: '50%',
    background: '#7f3346',
    color: '#ffe4e6',
    fontWeight: 800
  },
  footerDivider: {
    height: '1px',
    background: '#29384e',
    margin: '27px 0 20px'
  },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px'
  },
  footerNote: {
    margin: 0,
    fontSize: '11px',
    color: '#64748b'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cancelBtn: {
    background: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #334155',
    padding: '12px 17px',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 650,
    cursor: 'pointer'
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#38bdf8',
    color: '#082f49',
    border: 'none',
    padding: '12px 19px',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitArrow: {
    fontSize: '17px',
    lineHeight: 1
  },
  spinner: {
    width: '13px',
    height: '13px',
    border: '2px solid #082f49',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    display: 'inline-block'
  },
  bottomNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '22px 0 0',
    color: '#64748b',
    fontSize: '11px',
    letterSpacing: '0.3px'
  },
  bottomDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#38bdf8',
    boxShadow: '0 0 10px #38bdf866'
  }
}

export default CreateJob
