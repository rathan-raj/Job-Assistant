import React, { useState } from 'react';
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

const MOCK_APPLICATIONS = [
  { id: 1, role: 'Backend Engineer', company: 'TechCorp', status: 'interview', date: '2026-03-10', matchScore: 88, missingKeywords: ['GraphQL', 'Redis'] },
  { id: 2, role: 'Software Developer', company: 'GlobalSoft', status: 'applied', date: '2026-03-12', matchScore: 92, missingKeywords: ['Docker'] },
  { id: 3, role: 'Full Stack Engineer', company: 'StartupX', status: 'offer', date: '2026-03-01', matchScore: 95, missingKeywords: [] },
  { id: 4, role: 'Python Developer', company: 'DataSystems', status: 'rejected', date: '2026-02-28', matchScore: 45, missingKeywords: ['FastAPI', 'scikit-learn', 'Pandas'] },
];

const MOCK_CHART_DATA = [
  { name: 'Java', freq: 8 },
  { name: 'Spring Boot', freq: 7 },
  { name: 'Python', freq: 5 },
  { name: 'FastAPI', freq: 4 },
  { name: 'PostgreSQL', freq: 6 },
  { name: 'React', freq: 3 },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // AI Analyzer State
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText || !jdText) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await axios.post('http://localhost:8000/api/analyze', {
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
    switch(status) {
      case 'interview': return <span className="status-badge badge-interview"><span className="dot"></span>Interview</span>;
      case 'applied': return <span className="status-badge badge-applied"><span className="dot"></span>Applied</span>;
      case 'offer': return <span className="status-badge badge-offer"><span className="dot"></span>Offer</span>;
      case 'rejected': return <span className="status-badge badge-rejected"><span className="dot"></span>Rejected</span>;
      default: return null;
    }
  };

  const renderScoreCircle = (score) => {
    let type = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
    return (
      <div className={`score-circle ${type}`}>
        {score}%
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
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
              {/* Stats Row */}
              <div className="glass-panel col-4 animate-slide-up delay-1">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <Briefcase size={28} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Applications</span>
                    <span className="stat-value">24</span>
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
                    <span className="stat-value">84%</span>
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
                    <span className="stat-value">3</span>
                  </div>
                </div>
              </div>

              {/* Keyword Gap Chart */}
              <div className="glass-panel col-12 animate-slide-up delay-2">
                <h3 style={{ marginBottom: '8px' }}>Keyword Gap Analysis</h3>
                <p className="subtitle" style={{ marginBottom: '24px' }}>Most frequent technical keywords found in your tracked job descriptions.</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                          <stop offset="0%" stopColor="#b46bfa" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Applications Table */}
              <div className="glass-panel col-12 animate-slide-up delay-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Recent Applications</h3>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
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
                    {MOCK_APPLICATIONS.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <span className="job-role">{app.role}</span>
                          <span className="job-company">{app.company}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{app.date}</td>
                        <td>{renderBadge(app.status)}</td>
                        <td>{renderScoreCircle(app.matchScore)}</td>
                        <td>
                          {app.missingKeywords.length === 0 ? (
                            <span style={{ color: 'var(--success)' }}>Excellent Match!</span>
                          ) : (
                            <div style={{ maxWidth: '280px' }}>
                              <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Missing keywords:
                              </span>
                              {app.missingKeywords.slice(0, 2).map((kw, i) => (
                                <span key={i} className="keyword-tag missing">{kw}</span>
                              ))}
                              {app.missingKeywords.length > 2 && (
                                <span className="keyword-tag">+{app.missingKeywords.length - 2}</span>
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
                    <Zap style={{ color: "var(--accent-secondary)" }}/> Analysis Results
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

        {/* Modal Overlay Component */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Job Application</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Google" />
                </div>
                <div className="form-group">
                  <label>Role / Position</label>
                  <input type="text" className="form-control" placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea className="form-control" rows="4" placeholder="Paste the JD here to analyze against your resume..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => {
                  alert('Integration to Spring Boot Backend coming soon!');
                  setIsModalOpen(false);
                }}>
                  <Target size={18} /> Add Application & Analyze
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
