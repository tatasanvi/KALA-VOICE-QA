import React from 'react';
import { 
  LayoutDashboard, PhoneCall, Mic, Sparkles, CheckCircle2, 
  TrendingUp, GraduationCap, Users, FolderGit2, Flag, 
  FileText, FlaskConical, Settings
} from 'lucide-react';
import { UserRole } from '../../types';

export type ViewType = 
  | 'dashboard'
  | 'calls'
  | 'transcriptions'
  | 'analytics'
  | 'quality'
  | 'coaching'
  | 'training'
  | 'agents'
  | 'teams'
  | 'campaigns'
  | 'reports'
  | 'experimentation'
  | 'settings';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <Mic size={20} />
        </div>
        <div>
          <div className="brand-title">KALA VOICE</div>
          <div className="brand-tagline">Intelligence & Qualité</div>
        </div>
      </div>

      {/* Navigation Métier Contact Center */}
      <div className="nav-section">
        <div className="nav-section-title">Opérations & Analyse</div>
        
        <button 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectView('dashboard')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'calls' ? 'active' : ''}`}
          onClick={() => onSelectView('calls')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <PhoneCall size={18} />
          <span>Appels</span>
          <span className="nav-badge">4</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'transcriptions' ? 'active' : ''}`}
          onClick={() => onSelectView('transcriptions')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <Mic size={18} />
          <span>Studio Transcription</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => onSelectView('analytics')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <Sparkles size={18} />
          <span>Analyse IA</span>
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Qualité & Accompagnement</div>

        <button 
          className={`nav-item ${activeView === 'quality' ? 'active' : ''}`}
          onClick={() => onSelectView('quality')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <CheckCircle2 size={18} />
          <span>Contrôle Qualité</span>
          <span className="nav-badge urgent">2</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'coaching' ? 'active' : ''}`}
          onClick={() => onSelectView('coaching')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <TrendingUp size={18} />
          <span>Coaching</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'training' ? 'active' : ''}`}
          onClick={() => onSelectView('training')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <GraduationCap size={18} />
          <span>Formation</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'agents' ? 'active' : ''}`}
          onClick={() => onSelectView('agents')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <Users size={18} />
          <span>Profils Agents</span>
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Organisation & Rapports</div>

        <button 
          className={`nav-item ${activeView === 'teams' ? 'active' : ''}`}
          onClick={() => onSelectView('teams')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <FolderGit2 size={18} />
          <span>Équipes & Campagnes</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
          onClick={() => onSelectView('reports')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <FileText size={18} />
          <span>Rapports & Exports</span>
        </button>
      </div>

      <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
        <div className="nav-section-title" style={{ color: '#c084fc' }}>Mémoire Master IA</div>

        <button 
          className={`nav-item ${activeView === 'experimentation' ? 'active' : ''}`}
          onClick={() => onSelectView('experimentation')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <FlaskConical size={18} color="#c084fc" />
          <span style={{ color: '#e9d5ff', fontWeight: 600 }}>Expérimentation</span>
          <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: '10px' }}>WER/CER</span>
        </button>

        <button 
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectView('settings')}
          style={{ width: '100%', background: 'none', textAlign: 'left' }}
        >
          <Settings size={18} />
          <span>Paramètres & Audit</span>
        </button>
      </div>
    </aside>
  );
};
