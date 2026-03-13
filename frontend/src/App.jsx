import React, { useState, useEffect } from 'react';
import './App.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  TrendingUp,
  Target,
  PlusCircle,
  MoreHorizontal,
  ChevronRight,
  Zap,
  Loader2,
  X
} from 'lucide-react';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real Data State
  const [applications, setApplications] = useState([]);

  // Modal State
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [modalResume, setModalResume] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Analyzer State
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const baseUrl = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080';
      const resp = await axios.get(`${baseUrl}/api/v1/applications`);
      setApplications(resp.data);
    } catch (e) {
      console.error("Failed to fetch applications:", e);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAddNewApp = async () => {
    if (!companyName || !role) return;
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080';
      await axios.post(`${baseUrl}/api/v1/applications`, {
        companyName: companyName,
        jobTitle: role,
        jobDescription: jobDesc,
        resumeSnapshot: modalResume
      });
      // Clear and close
      setCompanyName('');
      setRole('');
      setJobDesc('');
      setModalResume('');
      setIsModalOpen(false);
      // Refetch
      fetchApplications();
    } catch (e) {
      console.error("Error creating app:", e);
      alert("Failed to create application. Check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jdText) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const baseUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${baseUrl}/api/analyze`, {
        resume_text: resumeText,
        jd_text: jdText
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Error analyzing:", error);
      alert("Something went wrong during analysis. Please ensure the Python backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'interview': return <span className="status-badge badge-interview"><span className="dot"></span>Interview</span>;
      case 'applied': return <span className="status-badge badge-applied"><span className="dot"></span>Applied</span>;
      case 'offer': return <span className="status-badge badge-offer"><span className="dot"></span>Offer</span>;
      case 'rejected': return <span className="status-badge badge-rejected"><span className="dot"></span>Rejected</span>;
      default: return <span className="status-badge badge-applied"><span className="dot"></span>{status || 'Saved'}</span>;
    }
  };

  const renderScoreCircle = (score) => {
    if (score == null) {
      return <div className="score-circle low" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--text-tertiary)' }}>N/A</div>;
    }
    let type = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
    return (
      <div className={`score-circle ${type}`}>
        {Math.round(score)}%
      </div>
    );
  };

  // Compute dynamic chart data
  const generateChartData = () => {
    const counts = {};
    applications.forEach(app => {
      if (app.missingKeywords) {
        app.missingKeywords.split(',').forEach(kw => {
          let clean = kw.trim();
          if (clean && clean.toLowerCase() !== "null") counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, freq]) => ({ name, freq }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 8); // top 8 missing
  };

  const chartData = applications.length ? generateChartData() : [
    { name: 'Java', freq: 8 }, { name: 'Spring Boot', freq: 7 }, { name: 'Python', freq: 5 },
    { name: 'FastAPI', freq: 4 }, { name: 'PostgreSQL', freq: 6 }, { name: 'React', freq: 3 }
  ];

  // Dynamic status counts
  const appsWithScores = applications.filter(a => a.matchScore);
  const avgScore = appsWithScores.length
    ? Math.round(appsWithScores.reduce((sum, a) => sum + a.matchScore, 0) / appsWithScores.length)
    : 84;

  const activeInterviews = applications.filter(a => a.status === 'INTERVIEW').length;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={24} />
          </div>
          <h1>JobEngine</h1>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Briefcase size={20} />
            Applications
          </button>
          <button
            className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <Target size={20} />
            AI Analyzer
          </button>
          <button
            className={`nav-item ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumes')}
          >
            <FileText size={20} />
            Resumes
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-header animate-slide-up">
              <div>
                <h2>Dashboard Overview</h2>
                <p className="subtitle">Track your applications and resume match scores</p>
              </div>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                <PlusCircle size={18} />
                New Application
              </button>
            </div>

            <div className="dashboard-grid">
              <div className="glass-panel col-4 animate-slide-up delay-1">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <Briefcase size={28} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Applications</span>
                    <span className="stat-value">{applications.length || 24}</span>
                  </div>
                </div>
              </div>
              <div className="glass-panel col-4 animate-slide-up delay-2">
                <div className="stat-card">
                  <div className="stat-icon success">
                    <Target size={28} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Avg. Match Score</span>
                    <span className="stat-value">{avgScore}%</span>
                  </div>
                </div>
              </div>
              <div className="glass-panel col-4 animate-slide-up delay-3">
                <div className="stat-card">
                  <div className="stat-icon warning">
                    <TrendingUp size={28} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Active Interviews</span>
                    <span className="stat-value">{applications.length ? activeInterviews : 3}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel col-12 animate-slide-up delay-2">
                <h3 style={{ marginBottom: '8px' }}>Keyword Gap Analysis</h3>
                <p className="subtitle" style={{ marginBottom: '24px' }}>Most frequent technical keywords found in your tracked job descriptions.</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252a3f" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7692" axisLine={false} tickLine={false} />
                      <YAxis stroke="#6b7692" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1d2d', borderColor: '#252a3f', borderRadius: '8px', color: '#f0f2f8' }}
                        itemStyle={{ color: '#b46bfa' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                      />
                      <Bar dataKey="freq" fill="url(#colorUv)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b46bfa" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel col-12 animate-slide-up delay-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Recent Applications</h3>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    View All <ChevronRight size={16} />
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div style={{ color: 'var(--text-tertiary)', padding: '24px 0', textAlign: 'center' }}>
                    No applications added yet. Click 'New Application' to get started!
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Role / Company</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                        <th>Match Score</th>
                        <th>AI Suggestions</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <span className="job-role">{app.jobTitle}</span>
                            <span className="job-company">{app.companyName}</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</td>
                          <td>{renderBadge(app.status)}</td>
                          <td>{renderScoreCircle(app.matchScore)}</td>
                          <td>
                            {!app.missingKeywords || app.missingKeywords.trim() === "" ? (
                              <span style={{ color: 'var(--success)' }}>Excellent Match!</span>
                            ) : (
                              <div style={{ maxWidth: '280px' }}>
                                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                  Missing keywords:
                                </span>
                                {app.missingKeywords.split(',').slice(0, 2).map((kw, i) => (
                                  <span key={i} className="keyword-tag missing">{kw.trim()}</span>
                                ))}
                                {app.missingKeywords.split(',').length > 2 && (
                                  <span className="keyword-tag">+{app.missingKeywords.split(',').length - 2}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <button style={{ color: 'var(--text-tertiary)' }} title="Options">
                              <MoreHorizontal size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'analyzer' && (
          <div className="animate-slide-up">
            <div className="dashboard-header">
              <div>
                <h2>AI Match Analyzer</h2>
                <p className="subtitle">Compare your resume against a job description instantly using our NLP engine.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="glass-panel col-12" style={{ marginBottom: "24px" }}>
                <div className="form-group">
                  <label>Job Description Extract</label>
                  <textarea
                    className="form-control"
                    rows="6"
                    placeholder="Paste the job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Your Resume Extract</label>
                  <textarea
                    className="form-control"
                    rows="6"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jdText || !resumeText}
                  style={{ opacity: (isAnalyzing || !jdText || !resumeText) ? 0.6 : 1, width: '100%', justifyContent: 'center', marginTop: '12px' }}
                >
                  {isAnalyzing ? <><Loader2 className="spinning" size={18} /> Analyzing...</> : <><Target size={18} /> Run AI Analysis</>}
                </button>
              </div>

              {analysisResult && (
                <div className="glass-panel col-12 animate-slide-up">
                  <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap style={{ color: "var(--accent-secondary)" }} /> Analysis Results
                  </h3>

                  <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className={`score-circle ${analysisResult.match_score >= 80 ? 'high' : analysisResult.match_score >= 60 ? 'medium' : 'low'}`} style={{ width: '120px', height: '120px', fontSize: '32px', border: '8px solid currentColor', margin: '0 auto 16px auto' }}>
                        {analysisResult.match_score}%
                      </div>
                      <span className="stat-label">Match Score</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Missing Core Keywords</h4>
                        {analysisResult.missing_keywords && analysisResult.missing_keywords.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {analysisResult.missing_keywords.map((kw, idx) => (
                              <span key={idx} className="keyword-tag missing">{kw}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--success)' }}>Your resume matches all core keywords perfectly!</span>
                        )}
                      </div>

                      <div>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>AI Suggested Improvements</h4>
                        <p style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
                          {analysisResult.suggested_improvements}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'applications' || activeTab === 'resumes') && (
          <div className="animate-slide-up">
            <div className="dashboard-header">
              <div>
                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                <p className="subtitle">This module is coming soon in Phase 4!</p>
              </div>
            </div>
            <div className="glass-panel col-12" style={{ padding: '80px 0', textAlign: 'center' }}>
              <div className="stat-icon primary" style={{ margin: '0 auto 24px auto', width: '80px', height: '80px' }}>
                <Zap size={40} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Module In Development</h3>
              <p className="subtitle">We're currently building out this functionality.</p>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Job Application</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input type="text" className="form-control" placeholder="e.g. Google" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Role / Position *</label>
                  <input type="text" className="form-control" placeholder="e.g. Senior Software Engineer" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea className="form-control" rows="4" placeholder="Paste the JD here so AI can extract missing keywords..." value={jobDesc} onChange={e => setJobDesc(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                  <label>Your Resume Extract</label>
                  <textarea className="form-control" rows="4" placeholder="Paste your resume specifically used for this application..." value={modalResume} onChange={e => setModalResume(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button className="btn-primary" onClick={handleAddNewApp} disabled={isSubmitting || !companyName || !role} style={{ opacity: (isSubmitting || !companyName || !role) ? 0.6 : 1 }}>
                  {isSubmitting ? <><Loader2 className="spinning" size={18} /> Saving & Analyzing...</> : <><Target size={18} /> Add Application & Analyze</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
