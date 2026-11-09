import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getJob, uploadCVs } from '../services/api'

const UploadCV = () => {
  const [job,      setJob]      = useState(null)
  const [files,    setFiles]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const { jobId }               = useParams()
  const navigate                = useNavigate()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJob(jobId)
        setJob(res.data.job)
      } catch (err) { console.error(err) }
    }
    fetchJob()
  }, [jobId])

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      setError('Please select at least one PDF file')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('cvs', file))
      const res = await uploadCVs(jobId, formData)
      setSuccess(`✅ ${res.data.message}`)
      setFiles([])
      setTimeout(() => navigate(`/rankings/${jobId}`), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
          <h2 style={s.title}>Upload CVs</h2>
        </div>

        {job && (
          <div style={s.jobInfo}>
            <h3 style={s.jobTitle}>{job.title}</h3>
            <p style={s.jobDesc}>{job.description?.substring(0, 150)}...</p>
            <div style={s.tags}>
              {job.required_skills?.map((sk, i) => <span key={i} style={s.tag}>{sk}</span>)}
            </div>
          </div>
        )}

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <form onSubmit={handleUpload}>
          <label style={s.label}>Select PDF Files</label>
          <div style={s.dropZone}>
            <input
              type='file'
              multiple
              accept='.pdf'
              onChange={handleFileChange}
              style={s.fileInput}
              id='cv-upload'
            />
            <label htmlFor='cv-upload' style={s.dropLabel}>
              📄 Click to select PDF files
              <span style={s.dropSub}>Multiple files supported</span>
            </label>
          </div>

          {files.length > 0 && (
            <div style={s.fileList}>
              <p style={s.fileCount}>Selected: {files.length} file(s)</p>
              {files.map((f, i) => (
                <div key={i} style={s.fileItem}>
                  📄 {f.name} <span style={s.fileSize}>({(f.size/1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}

          <button style={s.uploadBtn} type='submit' disabled={loading}>
            {loading ? '⏳ Processing CVs — this may take a minute...' : '🚀 Upload & Score CVs'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  container  : { minHeight:'100vh', background:'#0f172a', padding:'32px', display:'flex', justifyContent:'center' },
  card       : { background:'#1e293b', borderRadius:'12px', padding:'32px', width:'100%', maxWidth:'600px', height:'fit-content' },
  header     : { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' },
  backBtn    : { background:'#334155', color:'#f1f5f9', border:'none', padding:'8px 16px', borderRadius:'6px', cursor:'pointer' },
  title      : { color:'#f1f5f9', margin:0 },
  jobInfo    : { background:'#0f172a', borderRadius:'8px', padding:'16px', marginBottom:'20px' },
  jobTitle   : { color:'#38bdf8', margin:'0 0 8px' },
  jobDesc    : { color:'#94a3b8', fontSize:'14px', margin:'0 0 12px' },
  tags       : { display:'flex', flexWrap:'wrap', gap:'6px' },
  tag        : { background:'#1e293b', color:'#38bdf8', padding:'4px 8px', borderRadius:'4px', fontSize:'12px' },
  label      : { display:'block', color:'#94a3b8', fontSize:'14px', marginBottom:'8px' },
  dropZone   : { border:'2px dashed #334155', borderRadius:'8px', padding:'32px', textAlign:'center', marginBottom:'16px', cursor:'pointer' },
  fileInput  : { display:'none' },
  dropLabel  : { color:'#94a3b8', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', fontSize:'16px' },
  dropSub    : { fontSize:'12px', color:'#475569' },
  fileList   : { background:'#0f172a', borderRadius:'8px', padding:'12px', marginBottom:'16px' },
  fileCount  : { color:'#38bdf8', margin:'0 0 8px', fontSize:'14px' },
  fileItem   : { color:'#94a3b8', fontSize:'13px', padding:'4px 0' },
  fileSize   : { color:'#475569' },
  uploadBtn  : { width:'100%', padding:'14px', background:'#38bdf8', color:'#0f172a', border:'none', borderRadius:'8px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' },
  error      : { background:'#450a0a', color:'#fca5a5', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  successBox : { background:'#052e16', color:'#86efac', padding:'10px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px' }
}

export default UploadCV