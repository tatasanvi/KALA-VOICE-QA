import 'dotenv/config';
import db from './index.js';

// Local reference data only: real calls and recordings must come from manual uploads.
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.trim()) {
  throw new Error('Seed de test refusé : utilisez uniquement une base SQLite locale hors production.');
}

const sqlite = (db as any).session.client;
const today = new Date().toISOString().slice(0, 10);

async function seedTestData() {
  const supervisor = await sqlite.prepare("SELECT id, name FROM users WHERE role IN ('ADMIN', 'QUALITE_FORMATION') ORDER BY role LIMIT 1").get() as any;
  if (!supervisor) throw new Error('Aucun compte Responsable/Qualité local. Créez un compte, puis relancez le seed.');

  const teams = [
    { id: 'test-team-accueil', name: 'TEST · Accueil & qualification', description: 'Équipe fictive pour valider les parcours et filtres.' },
    { id: 'test-team-fidelisation', name: 'TEST · Fidélisation', description: 'Équipe fictive pour les cas de rétention.' },
    { id: 'test-team-support', name: 'TEST · Support client', description: 'Équipe fictive pour les cas de support.' },
  ];
  const campaigns = [
    { id: 'test-campaign-service', name: 'TEST · Service client', sector: 'Service client' },
    { id: 'test-campaign-retention', name: 'TEST · Fidélisation', sector: 'Télécommunications' },
    { id: 'test-campaign-support', name: 'TEST · Support', sector: 'Support technique' },
  ];

  const insertTeam = sqlite.prepare(`INSERT OR IGNORE INTO teams
    (id, name, supervisor_id, supervisor_name, description, member_count, average_quality_score, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, ?)`);
  for (const team of teams) await insertTeam.run(team.id, team.name, supervisor.id, supervisor.name, team.description, today);

  const insertCampaign = sqlite.prepare(`INSERT OR IGNORE INTO campaigns
    (id, name, type, client_sector, target_quality_score, active_agents_count, total_calls_count, compliance_rate, description, created_at)
    VALUES (?, ?, 'ENTRANT', ?, 80, 0, 0, 0, 'Données de référence fictives; aucun appel ni résultat simulé.', ?)`);
  for (const campaign of campaigns) await insertCampaign.run(campaign.id, campaign.name, campaign.sector, today);

  const linkedUser = await sqlite.prepare("SELECT id, name, email FROM users WHERE role = 'AGENT' AND is_active = 1 ORDER BY id LIMIT 1").get() as any;
  const agents = [
    ...(linkedUser ? [{ id: `test-agent-${linkedUser.id}`, userId: linkedUser.id, name: linkedUser.name, email: linkedUser.email, teamId: teams[0].id, campaignId: campaigns[0].id }] : []),
    { id: 'test-agent-001', userId: null, name: 'TEST · Conseiller 001', email: 'conseiller001@example.invalid', teamId: teams[0].id, campaignId: campaigns[0].id },
    { id: 'test-agent-002', userId: null, name: 'TEST · Conseiller 002', email: 'conseiller002@example.invalid', teamId: teams[1].id, campaignId: campaigns[1].id },
    { id: 'test-agent-003', userId: null, name: 'TEST · Conseiller 003', email: 'conseiller003@example.invalid', teamId: teams[1].id, campaignId: campaigns[1].id },
    { id: 'test-agent-004', userId: null, name: 'TEST · Conseiller 004', email: 'conseiller004@example.invalid', teamId: teams[2].id, campaignId: campaigns[2].id },
  ];
  const insertAgent = sqlite.prepare(`INSERT OR IGNORE INTO agents
    (id, user_id, name, email, avatar_url, team_id, team_name, campaign_id, campaign_name, hire_date, seniority, status,
     calls_analyzed_count, average_quality_score, monthly_scores_json, strengths_json, improvement_axes_json,
     assigned_coaching_plan_id, completed_trainings_count, compliance_rate)
    VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, 'Donnée de test', 'ACTIF', 0, 0, '[]', '[]', '[]', NULL, 0, 0)`);
  for (const agent of agents) {
    const team = teams.find(item => item.id === agent.teamId)!;
    const campaign = campaigns.find(item => item.id === agent.campaignId)!;
    await insertAgent.run(agent.id, agent.userId, agent.name, agent.email, team.id, team.name, campaign.id, campaign.name, today);
  }

  const moduleRows = [
    ['test-module-discovery', 'TEST-FOR-01', 'Découverte et qualification', 'Relation client', 45, 'Questionnement et reformulation.', '["Écoute active","Qualification du besoin"]', 2, 'DÉBUTANT'],
    ['test-module-objections', 'TEST-FOR-02', 'Traitement des objections', 'Fidélisation', 60, 'Répondre aux objections avec des arguments adaptés.', '["Reformulation","Argumentation"]', 3, 'INTERMÉDIAIRE'],
    ['test-module-compliance', 'TEST-FOR-03', 'Conformité et clôture d’appel', 'Conformité', 30, 'Vérifications avant la clôture d’un échange.', '["Vérification","Synthèse"]', 1, 'DÉBUTANT'],
  ];
  const insertModule = sqlite.prepare(`INSERT OR IGNORE INTO training_modules
    (id, code, title, category, duration_minutes, description, target_competencies_json, interactive_simulations_count, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const row of moduleRows) await insertModule.run(...row);

  await sqlite.prepare('UPDATE teams SET member_count = (SELECT COUNT(*) FROM agents WHERE agents.team_id = teams.id) WHERE id LIKE ?').run('test-team-%');
  console.log(`Données de référence prêtes : ${teams.length} équipes, ${campaigns.length} campagnes, ${agents.length} conseillers et ${moduleRows.length} modules.`);
  console.log('Aucun appel, audio, transcription ni résultat QA n’a été créé. Importez vos audios manuellement pour tester ces parcours.');
}

seedTestData().catch(error => {
  console.error('Impossible de créer les données locales de test :', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => {
  sqlite.close?.();
});
