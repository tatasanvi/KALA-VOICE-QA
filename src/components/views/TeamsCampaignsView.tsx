import React, { useState } from 'react';
import { FolderGit2, Users, Flag, Award, CheckCircle2, PhoneCall } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface TeamsCampaignsViewProps {
  onSelectAgent: (id: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const TeamsCampaignsView: React.FC<TeamsCampaignsViewProps> = ({ 
  onSelectAgent, 
  onNavigate 
}) => {
  const campaigns = storageService.getCampaigns();
  const teams = storageService.getTeams();
  const agents = storageService.getAgents();

  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'TEAMS'>('CAMPAIGNS');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête & Onglets */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderGit2 size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Organisation : Équipes & Campagnes</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Structure opérationnelle multi-campagnes et gestion hiérarchique du centre de contacts.
          </p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'CAMPAIGNS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('CAMPAIGNS')}
          >
            <Flag size={13} />
            <span>Campagnes Métiers ({campaigns.length})</span>
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'TEAMS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('TEAMS')}
            style={{ marginLeft: '4px' }}
          >
            <Users size={13} />
            <span>Équipes & Superviseurs ({teams.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'CAMPAIGNS' ? (
        /* Cartes Campagnes */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {campaigns.map(camp => (
            <div key={camp.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge ${camp.type === 'ENTRANT' ? 'badge-blue' : 'badge-purple'}`}>
                    {camp.type}
                  </span>
                  <span className="badge badge-gray">{camp.clientSector}</span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {camp.name}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {camp.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agents Déployés</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{camp.activeAgentsCount} conseillers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Objectif Qualité</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>{camp.targetQualityScore} / 100</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Conformité légale : <strong style={{ color: '#34d399' }}>{camp.complianceRate}%</strong></span>
                <span>{camp.totalCallsCount} appels enregistrés</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cartes Équipes */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {teams.map(team => {
            const teamMembers = agents.filter(a => a.teamId === team.id);
            return (
              <div key={team.id} className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{team.name}</h3>
                  <span className="badge badge-green" style={{ fontSize: '12px' }}>
                    Score : {team.averageQualityScore}%
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {team.description}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12.5px' }}>
                  <strong>Superviseur référent :</strong> {team.supervisorName}
                </div>

                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Conseillers de l'équipe ({teamMembers.length}) :
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teamMembers.map(member => (
                    <div 
                      key={member.id} 
                      onClick={() => {
                        onSelectAgent(member.id);
                        onNavigate('agents');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      title="Cliquer pour voir la fiche 360°"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={member.avatarUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{member.name}</span>
                      </div>
                      <span className={`badge ${member.averageQualityScore >= 80 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                        {member.averageQualityScore}% QA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
