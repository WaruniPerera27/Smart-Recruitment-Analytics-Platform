
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJobs, deleteJob } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs()
      setJobs(res.data.jobs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job?')) return
    try {
      await deleteJob(jobId)
      setJobs(jobs.filter(j => j._id !== jobId))
    } catch (err) {
      console.error(err)
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
            <span style={s.navSubtitle}>ANALYTICS PLATFORM</span>
          </div>
        </div>

        <div style={s.navRight}>
          <div style={s.userInfo}>
            <div style={s.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={s.userDetails}>
              <span style={s.welcomeText}>Welcome back,</span>
              <span style={s.navUser}>{user?.name || 'User'}</span>
            </div>
          </div>

          <button
            style={s.logoutBtn}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <span>↪</span> Logout
          </button>
        </div>
      </header>

      <main style={s.content}>
        {/* Page heading */}
        <section style={s.hero}>
          <div>
            <span style={s.eyebrow}>
              <span style={s.statusDot} /> RECRUITMENT WORKSPACE
            </span>
            <h2 style={s.pageTitle}>Job Postings</h2>
            <p style={s.pageDescription}>
              Manage your job openings, upload CVs, and review candidate rankings
              from one place.
            </p>
          </div>

          <button
            style={s.createBtn}
            onClick={() => navigate('/create-job')}
          >
            <span style={s.plusIcon}>+</span>
            Create New Job
          </button>
        </section>

        {/* Summary */}
        {!loading && (
          <section style={s.summaryCard}>
            <div style={s.summaryIcon}>▤</div>
            <div>
              <span style={s.summaryLabel}>Total Job Postings</span>
              <div style={s.summaryValue}>{jobs.length}</div>
            </div>
            <div style={s.summaryNote}>
              {jobs.length === 1 ? '1 opening in your workspace' :
                `${jobs.length} openings in your workspace`}
            </div>
          </section>
        )}

        {/* Job listings */}
        <section style={s.listSection}>
          <div style={s.sectionHeading}>
            <div>
              <h3 style={s.sectionTitle}>Your Jobs</h3>
              <p style={s.sectionDescription}>
                Select a job to manage its candidates.
              </p>
            </div>
            {!loading && jobs.length > 0 && (
              <span style={s.countBadge}>{jobs.length} JOB{jobs.length !== 1 ? 'S' : ''}</span>
            )}
          </div>

          {loading ? (
            <div style={s.empty}>
              <div style={s.loadingIcon}>◌</div>
              <p style={s.emptyTitle}>Loading your jobs...</p>
              <p style={s.emptyDescription}>
                Please wait while we retrieve your job postings.
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>＋</div>
              <h3 style={s.emptyTitle}>No job postings yet</h3>
              <p style={s.emptyDescription}>
                Create your first job posting to start reviewing candidates.
              </p>
              <button
                style={s.createBtn}
                onClick={() => navigate('/create-job')}
              >
                + Create Your First Job
              </button>
            </div>
          ) : (
            <div style={s.grid}>
              {jobs.map((job, index) => (
                <article key={job._id} style={s.card}>
                  <div style={s.cardTop}>
                    <div style={s.jobIcon}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span style={s.activeBadge}>
                      <span style={s.smallDot} /> Job Posting
                    </span>
                  </div>

                  <h3 style={s.jobTitle}>{job.title}</h3>

                  <p style={s.jobDesc}>
                    {job.description?.substring(0, 120)}
                    {job.description?.length > 120 ? '...' : ''}
                  </p>

                  <div style={s.skillsHeading}>
                    <span style={s.skillsLabel}>REQUIRED SKILLS</span>
                    <span style={s.skillCount}>
                      {job.required_skills?.length || 0}
                    </span>
                  </div>

                  <div style={s.tags}>
                    {job.required_skills?.length > 0 ? (
                      job.required_skills.map((sk, i) => (
                        <span key={i} style={s.tag}>{sk}</span>
                      ))
                    ) : (
                      <span style={s.noSkills}>No skills specified</span>
                    )}
                  </div>

                  <div style={s.cardDivider} />

                  <div style={s.actions}>
                    <button
                      style={s.viewBtn}
                      onClick={() => navigate(`/rankings/${job._id}`)}
                    >
                      <span>▤</span> Rankings
                    </button>

                    <button
                      style={s.uploadBtn}
                      onClick={() => navigate(`/upload/${job._id}`)}
                    >
                      <span>↑</span> Upload CVs
                    </button>

                    <button
                      style={s.deleteBtn}
                      title="Delete job"
                      aria-label={`Delete ${job.title}`}
                      onClick={() => handleDelete(job._id)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer style={s.footer}>
          <span>Smart Recruitment Analytics Platform</span>
          <span>Candidate Management Workspace</span>
        </footer>
      </main>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: '#0b1120',
    color: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: 'border-box'
  },

  navbar: {
    width: '100%',
    minHeight: '78px',
    padding: '14px 5%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    background: '#111b2e',
    borderBottom: '1px solid #26354c',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  logo: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '13px',
    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    color: '#ffffff',
    fontSize: '23px',
    fontWeight: '900',
    boxShadow: '0 5px 16px rgba(56,189,248,0.2)'
  },

  navTitle: {
    color: '#f8fafc',
    margin: 0,
    fontSize: '18px',
    fontWeight: '750',
    letterSpacing: '-0.4px'
  },

  navSubtitle: {
    display: 'block',
    marginTop: '4px',
    color: '#7f91ad',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '1.8px'
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    flexWrap: 'wrap'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  avatar: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#233955',
    border: '1px solid #385574',
    color: '#7dd3fc',
    fontWeight: '800',
    fontSize: '16px'
  },

  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  welcomeText: {
    color: '#7f91ad',
    fontSize: '11px'
  },

  navUser: {
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: '650'
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#1b2940',
    color: '#cbd5e1',
    border: '1px solid #34455e',
    padding: '10px 15px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  content: {
    width: '100%',
    maxWidth: '1500px',
    boxSizing: 'border-box',
    padding: '42px 5% 24px',
    margin: '0 auto'
  },

  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  statusDot: {
    width: '7px',
    height: '7px',
    background: '#38bdf8',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(56,189,248,0.7)'
  },

  pageTitle: {
    color: '#f8fafc',
    margin: '0 0 10px',
    fontSize: 'clamp(28px, 3vw, 36px)',
    fontWeight: '800',
    letterSpacing: '-1px'
  },

  pageDescription: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.7',
    maxWidth: '600px'
  },

  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    background: 'linear-gradient(135deg, #38bdf8, #60a5fa)',
    color: '#07111f',
    border: 'none',
    padding: '13px 20px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(56,189,248,0.16)'
  },

  plusIcon: {
    fontSize: '20px',
    lineHeight: '1'
  },

  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '17px',
    padding: '20px 24px',
    marginBottom: '38px',
    background: 'linear-gradient(115deg, #14253c, #122035)',
    border: '1px solid #293e59',
    borderRadius: '14px',
    boxSizing: 'border-box',
    flexWrap: 'wrap'
  },

  summaryIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(56,189,248,0.12)',
    color: '#7dd3fc',
    fontSize: '25px'
  },

  summaryLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '3px'
  },

  summaryValue: {
    color: '#f8fafc',
    fontSize: '26px',
    fontWeight: '800'
  },

  summaryNote: {
    color: '#7f91ad',
    fontSize: '12px',
    marginLeft: 'auto'
  },

  listSection: {
    marginBottom: '40px'
  },

  sectionHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },

  sectionTitle: {
    color: '#f1f5f9',
    margin: '0 0 6px',
    fontSize: '20px',
    fontWeight: '750'
  },

  sectionDescription: {
    color: '#7f91ad',
    margin: 0,
    fontSize: '12px'
  },

  countBadge: {
    background: '#172840',
    color: '#7dd3fc',
    border: '1px solid #294461',
    borderRadius: '20px',
    padding: '7px 12px',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
    gap: '22px',
    alignItems: 'stretch'
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    boxSizing: 'border-box',
    background: 'linear-gradient(145deg, #162238, #111c2f)',
    border: '1px solid #293a52',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.12)'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },

  jobIcon: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: '#203754',
    color: '#7dd3fc',
    fontSize: '15px',
    fontWeight: '800'
  },

  activeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#a5b4c9',
    background: '#1a2b40',
    border: '1px solid #30445d',
    borderRadius: '20px',
    padding: '6px 10px',
    fontSize: '10px',
    fontWeight: '650'
  },

  smallDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#34d399'
  },

  jobTitle: {
    color: '#f1f5f9',
    margin: '0 0 10px',
    fontSize: '18px',
    lineHeight: '1.4',
    fontWeight: '750',
    overflowWrap: 'anywhere'
  },

  jobDesc: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: '1.8',
    margin: '0 0 24px',
    minHeight: '46px',
    overflowWrap: 'anywhere'
  },

  skillsHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    marginBottom: '12px'
  },

  skillsLabel: {
    color: '#7f91ad',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1.2px'
  },

  skillCount: {
    color: '#94a3b8',
    background: '#24344a',
    padding: '2px 7px',
    borderRadius: '5px',
    fontSize: '10px'
  },

  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '7px',
    minHeight: '28px',
    marginBottom: '20px'
  },

  tag: {
    background: 'rgba(56,189,248,0.08)',
    color: '#7dd3fc',
    border: '1px solid rgba(56,189,248,0.18)',
    padding: '6px 9px',
    borderRadius: '7px',
    fontSize: '11px',
    overflowWrap: 'anywhere'
  },

  noSkills: {
    color: '#64748b',
    fontSize: '12px'
  },

  cardDivider: {
    height: '1px',
    background: '#293a52',
    margin: 'auto 0 18px'
  },

  actions: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px'
  },

  viewBtn: {
    flex: '1 1 0',
    minWidth: 0,
    background: '#223b61',
    color: '#bfdbfe',
    border: '1px solid #345581',
    padding: '10px 5px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '750'
  },

  uploadBtn: {
    flex: '1 1 0',
    minWidth: 0,
    background: '#0e493e',
    color: '#a7f3d0',
    border: '1px solid #176653',
    padding: '10px 5px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '750'
  },

  deleteBtn: {
    flex: '0 0 38px',
    background: '#3a202c',
    color: '#fda4af',
    border: '1px solid #663044',
    padding: '6px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '22px',
    lineHeight: '1'
  },

  empty: {
    textAlign: 'center',
    padding: '65px 20px',
    background: '#111c2f',
    border: '1px dashed #34445d',
    borderRadius: '16px',
    color: '#94a3b8',
    boxSizing: 'border-box'
  },

  emptyIcon: {
    width: '58px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
    borderRadius: '18px',
    background: '#203754',
    color: '#7dd3fc',
    fontSize: '32px'
  },

  loadingIcon: {
    color: '#7dd3fc',
    fontSize: '38px',
    marginBottom: '12px'
  },

  emptyTitle: {
    color: '#e2e8f0',
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '750'
  },

  emptyDescription: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: '1.7',
    margin: '0 auto 22px',
    maxWidth: '400px'
  },

  info: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '40px'
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    borderTop: '1px solid #23334a',
    paddingTop: '20px',
    color: '#64748b',
    fontSize: '11px'
  }
}

export default Dashboard
