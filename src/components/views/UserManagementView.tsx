import React, { useState } from 'react';
import {
  Users, Plus, Pencil, Trash2, UserCheck, UserX, ShieldCheck,
  X, Save, Mail, Phone, Building2, AlertTriangle, Search, Filter
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { usersApi } from '../../services/apiClient';
import { User, UserRole } from '../../types';

// ─── Constantes ──────────────────────────────────────────────────────────────

const ROLES: { value: UserRole; label: string; badge: string; color: string }[] = [
  { value: 'ADMIN',      label: 'Administrateur',       badge: 'badge-red',    color: '#d98383' },
  { value: 'MANAGER',    label: 'Manager',              badge: 'badge-orange', color: '#fb923c' },
  { value: 'SUPERVISOR', label: 'Superviseur',          badge: 'badge-blue',   color: '#9fb7d6' },
  { value: 'QA_MANAGER', label: 'Responsable QA',       badge: 'badge-purple', color: '#b3aed1' },
  { value: 'TRAINER',    label: 'Formateur',            badge: 'badge-green',  color: '#6db89a' },
  { value: 'AGENT',      label: 'Conseiller',           badge: 'badge-gray',   color: '#94a3b8' },
];

const ROLE_ICONS: Record<UserRole, string> = {
  ADMIN: '🔴', MANAGER: '🟠', SUPERVISOR: '🔵',
  QA_MANAGER: '🟣', TRAINER: '🟢', AGENT: '⚪',
};

const getRoleMeta = (role: UserRole) => ROLES.find(r => r.value === role) ?? ROLES[5];

// ─── Type du formulaire ────────────────────────────────────────────────────
type FormMode = 'create' | 'edit';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  isActive: boolean;
}

const EMPTY_FORM: UserFormData = {
  name: '', email: '', role: 'AGENT',
  department: '', phone: '', isActive: true,
};

// ─── Modal Formulaire ──────────────────────────────────────────────────────
interface UserModalProps {
  mode: FormMode;
  initial: UserFormData;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
  currentUserId: string;
  targetUser?: User;
}

const UserModal: React.FC<UserModalProps> = ({ mode, initial, onSave, onClose }) => {
  const [form, setForm] = useState<UserFormData>(initial);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const validate = (): boolean => {
    const errs: Partial<UserFormData> = {};
    if (!form.name.trim()) errs.name = 'Le nom est obligatoire';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.department.trim()) errs.department = 'Le département est obligatoire';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const field = (
    label: string,
    key: keyof UserFormData,
    icon: React.ReactNode,
    type = 'text',
    placeholder = ''
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          {icon}
        </span>
        <input
          type={type}
          value={form[key] as string}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px 10px 38px', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors[key] ? '#d98383' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px',
            outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = errors[key] ? '#d98383' : 'rgba(255,255,255,0.1)')}
        />
      </div>
      {errors[key] && <span style={{ fontSize: '11px', color: '#d98383' }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '560px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: mode === 'create' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {mode === 'create' ? <Plus size={20} color="#9fb7d6" /> : <Pencil size={20} color="#b3aed1" />}
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                {mode === 'create' ? 'Créer un nouveau compte' : 'Modifier le compte'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {mode === 'create' ? 'Renseignez les informations du nouvel utilisateur.' : 'Modifiez les champs souhaités.'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {field('Nom complet', 'name', <Users size={14} />, 'text', 'Prénom Nom')}
            {field('Adresse e-mail', 'email', <Mail size={14} />, 'email', 'prenom.nom@domaine.ai')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {field('Département / Service', 'department', <Building2 size={14} />, 'text', 'Ex: Assurance Qualité')}
            {field('Téléphone (optionnel)', 'phone', <Phone size={14} />, 'tel', '+33 1 XX XX XX XX')}
          </div>

          {/* Rôle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rôle & Permissions
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                  style={{
                    padding: '10px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `2px solid ${form.role === r.value ? r.color : 'rgba(255,255,255,0.1)'}`,
                    background: form.role === r.value ? `${r.color}22` : 'rgba(0,0,0,0.2)',
                    color: form.role === r.value ? r.color : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: 700, transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{ROLE_ICONS[r.value]}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Statut actif */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>Compte actif</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Un compte inactif ne peut pas se connecter à la plateforme.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
              style={{
                width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                background: form.isActive ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0
              }}
            >
              <span style={{
                position: 'absolute', top: '3px',
                left: form.isActive ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.3s', display: 'block'
              }} />
            </button>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} />
              <span>{mode === 'create' ? 'Créer le compte' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal Confirmation Suppression ──────────────────────────────────────────
interface DeleteModalProps {
  user: User;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ user, onConfirm, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
  }} onClick={onClose}>
    <div style={{
      background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)',
      border: '1px solid rgba(248,113,113,0.3)', maxWidth: '440px', width: '100%',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
    }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(248,113,113,0.15)', border: '2px solid rgba(248,113,113,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <AlertTriangle size={28} color="#d98383" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
          Supprimer ce compte ?
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Vous êtes sur le point de supprimer définitivement le compte de
        </p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#d98383', marginBottom: '16px' }}>
          {user.name} ({user.email})
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          ⚠️ Cette action est irréversible et sera enregistrée dans le journal d'audit.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(248,113,113,0.2)', color: '#d98383', border: '1px solid rgba(248,113,113,0.4)', padding: '8px 20px' }}
            onClick={onConfirm}
          >
            <Trash2 size={14} />
            <span>Supprimer définitivement</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Composant Principal ──────────────────────────────────────────────────────
interface UserManagementViewProps {
  currentUserId: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [modal, setModal] = useState<{ mode: FormMode; user?: User } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refresh = () => setUsers(storageService.getUsers());

  // Synchronisation avec l'API backend si disponible
  React.useEffect(() => {
    usersApi.list().then(res => {
      if (res.ok && res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Met à jour l'affichage avec les données backend
        setUsers(res.data);
      }
    }).catch(() => {
      // Mode hors-ligne / fallback automatique
    });
  }, []);

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSave = async (data: UserFormData) => {
    if (modal?.mode === 'create') {
      const created = storageService.createUser(data);
      notify(`✅ Compte de ${data.name} créé avec succès.`);
      refresh();
      setModal(null);
      // Appel API en arrière-plan
      await usersApi.create({ ...data, password: 'kala2024!' });
    } else if (modal?.mode === 'edit' && modal.user) {
      storageService.updateUser({ ...modal.user, ...data });
      notify(`✅ Compte de ${data.name} mis à jour.`);
      refresh();
      setModal(null);
      // Appel API en arrière-plan
      await usersApi.update(modal.user.id, data);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    storageService.deleteUser(target.id);
    notify(`🗑️ Compte de ${target.name} supprimé.`);
    setDeleteTarget(null);
    refresh();
    // Appel API en arrière-plan
    await usersApi.delete(target.id);
  };

  const handleToggle = async (user: User) => {
    storageService.toggleUserActive(user.id);
    notify(`${user.isActive ? '🔒 Compte désactivé' : '✅ Compte activé'} : ${user.name}`);
    refresh();
    // Appel API en arrière-plan
    await usersApi.toggleActive(user.id);
  };

  const filtered = users.filter(u => {
    const matchSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Modales */}
      {modal && (
        <UserModal
          mode={modal.mode}
          initial={modal.mode === 'edit' && modal.user
            ? { name: modal.user.name, email: modal.user.email, role: modal.user.role, department: modal.user.department ?? '', phone: modal.user.phone ?? '', isActive: modal.user.isActive }
            : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => setModal(null)}
          currentUserId={currentUserId}
          targetUser={modal.user}
        />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}

      {/* Notification */}
      {successMsg && (
        <div style={{
          background: 'rgba(16,185,129,0.15)', border: '1px solid #3f9a7a',
          padding: '12px 18px', borderRadius: 'var(--radius-md)',
          color: '#b9d6c8', fontSize: '13px', fontWeight: 600,
          animation: 'slideIn 0.3s ease'
        }}>
          {successMsg}
        </div>
      )}

      {/* Header + stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Users size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Gestion des Comptes Utilisateurs</h3>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Total : <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong></span>
            <span style={{ color: '#6db89a' }}>● Actifs : <strong>{stats.active}</strong></span>
            <span style={{ color: '#d98383' }}>● Inactifs : <strong>{stats.inactive}</strong></span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setModal({ mode: 'create' })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Nouveau compte</span>
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={13} color="var(--text-muted)" />
          {(['ALL', ...ROLES.map(r => r.value)] as const).map(role => {
            const meta = role === 'ALL' ? null : getRoleMeta(role as UserRole);
            const isActive = roleFilter === role;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role as UserRole | 'ALL')}
                style={{
                  padding: '5px 12px', borderRadius: '20px', border: `1px solid ${isActive ? (meta?.color ?? 'var(--primary)') : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? `${meta?.color ?? 'var(--primary)'}22` : 'transparent',
                  color: isActive ? (meta?.color ?? 'var(--primary-light)') : 'var(--text-muted)',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {role === 'ALL' ? 'Tous' : meta?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tableau */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Département</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontStyle: 'italic' }}>
                    Aucun utilisateur trouvé pour cette recherche.
                  </td>
                </tr>
              ) : filtered.map(user => {
                const roleMeta = getRoleMeta(user.role);
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.55 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          background: `${roleMeta.color}33`,
                          border: `2px solid ${roleMeta.color}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px', overflow: 'hidden'
                        }}>
                          {user.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : <span>{ROLE_ICONS[user.role]}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px' }}>
                            {user.name}
                            {isSelf && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--primary-light)', fontWeight: 600 }}>(vous)</span>}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${roleMeta.badge}`} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        {ROLE_ICONS[user.role]} {roleMeta.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {user.department ?? '—'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {user.phone ?? '—'}
                    </td>
                    <td>
                      {user.isActive
                        ? <span className="badge badge-green" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            <UserCheck size={11} /> Actif
                          </span>
                        : <span className="badge badge-red" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            <UserX size={11} /> Inactif
                          </span>
                      }
                    </td>
                    <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {user.lastLoginAt ?? '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {/* Éditer */}
                        <button
                          title="Modifier"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px', color: '#b3aed1' }}
                          onClick={() => setModal({ mode: 'edit', user })}
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Activer / Désactiver */}
                        {!isSelf && (
                          <button
                            title={user.isActive ? 'Désactiver' : 'Activer'}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '6px', color: user.isActive ? '#fb923c' : '#6db89a' }}
                            onClick={() => handleToggle(user)}
                          >
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        )}

                        {/* Supprimer */}
                        {!isSelf && (
                          <button
                            title="Supprimer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '6px', color: '#d98383' }}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {/* Indicateur compte courant */}
                        {isSelf && (
                          <span title="Compte courant — protégé" style={{ color: 'var(--primary-light)', padding: '6px' }}>
                            <ShieldCheck size={14} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
        💡 Toutes les actions sur les comptes sont tracées dans le journal d'audit — conformité RGPD.
        Vous ne pouvez pas supprimer ni désactiver votre propre compte.
      </p>
    </div>
  );
};
