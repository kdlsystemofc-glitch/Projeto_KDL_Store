'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '../context';

type Appointment = {
  id: string; title: string; scheduled_at: string; duration_min: number;
  status: string; price: number; notes: string | null;
  customer_id: string | null; pet_id: string | null; technician_id: string | null;
  customers: { name: string; phone: string } | null;
  pets: { name: string; species: string } | null;
  users: { name: string } | null;
};
type Pet = { id: string; customer_id: string; name: string; species: string; breed: string | null; birth_date: string | null; notes: string | null };
type Customer = { id: string; name: string; phone: string };
type User = { id: string; name: string };

const STATUS = {
  scheduled:   { label: 'Agendado',    badge: 'badge-info',    color: '#6C47FF' },
  confirmed:   { label: 'Confirmado',  badge: 'badge-success', color: '#10B981' },
  in_progress: { label: 'Em Serviço',  badge: 'badge-warning', color: '#F59E0B' },
  completed:   { label: 'Concluído',   badge: 'badge-success', color: '#00D4AA' },
  cancelled:   { label: 'Cancelado',   badge: 'badge-danger',  color: '#EF4444' },
};

const SPECIES: Record<string, string> = { dog: '🐶 Cão', cat: '🐱 Gato', bird: '🦜 Pássaro', rabbit: '🐰 Coelho', other: '🐾 Outro' };
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AgendaPage() {
  const supabase = createClient();
  const { tenantId, userId } = useTenant();

  const [tab, setTab] = useState<'agenda' | 'pets'>('agenda');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Agenda states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [showApptModal, setShowApptModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [savingAppt, setSavingAppt] = useState(false);
  const [apptForm, setApptForm] = useState({
    customer_id: '', pet_id: '', title: '', scheduled_at: '', duration_min: 60,
    price: 0, notes: '', status: 'scheduled', technician_id: '',
  });

  // Pet states
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [petSearch, setPetSearch] = useState('');
  const [petForm, setPetForm] = useState({ customer_id: '', name: '', species: 'dog', breed: '', birth_date: '', notes: '' });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [a, p, c, u] = await Promise.all([
        supabase.from('appointments')
          .select('*, customers(name,phone), pets(name,species), users(name)')
          .eq('tenant_id', tenantId)
          .order('scheduled_at', { ascending: true }),
        supabase.from('pets').select('*').eq('tenant_id', tenantId).order('name'),
        supabase.from('customers').select('id,name,phone').eq('tenant_id', tenantId).order('name'),
        supabase.from('users').select('id,name').eq('tenant_id', tenantId),
      ]);
      setAppointments(a.data || []);
      setPets(p.data || []);
      setCustomers(c.data || []);
      setUsers(u.data || []);
      setLoading(false);
    }
    load();
  }, [tenantId]);

  // Filter appointments by date
  const filteredAppts = appointments.filter(a => {
    const dateMatch = !filterDate || a.scheduled_at.startsWith(filterDate);
    const statusMatch = !filterStatus || a.status === filterStatus;
    return dateMatch && statusMatch;
  });

  // Customer's pets for the form dropdown
  const formPets = pets.filter(p => p.customer_id === apptForm.customer_id);

  function openNewAppt() {
    setEditingAppt(null);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    setApptForm({
      customer_id: '', pet_id: '', title: '', scheduled_at: now.toISOString().slice(0, 16),
      duration_min: 60, price: 0, notes: '', status: 'scheduled', technician_id: '',
    });
    setShowApptModal(true);
  }

  function openEditAppt(a: Appointment) {
    setEditingAppt(a);
    setApptForm({
      customer_id: a.customer_id || '', pet_id: a.pet_id || '',
      title: a.title, scheduled_at: a.scheduled_at.slice(0, 16),
      duration_min: a.duration_min, price: a.price, notes: a.notes || '',
      status: a.status, technician_id: a.technician_id || '',
    });
    setShowApptModal(true);
  }

  async function saveAppt(e: React.FormEvent) {
    e.preventDefault();
    setSavingAppt(true);
    const payload: any = {
      ...apptForm,
      price: Number(apptForm.price),
      duration_min: Number(apptForm.duration_min),
      customer_id: apptForm.customer_id || null,
      pet_id: apptForm.pet_id || null,
      technician_id: apptForm.technician_id || null,
      notes: apptForm.notes || null,
      tenant_id: tenantId,
    };

    let resultData: any = null;
    let attempts = 0;
    while (!resultData && attempts < 10) {
      attempts++;
      const res = editingAppt
        ? await supabase.from('appointments').update(payload).eq('id', editingAppt.id).select('*, customers(name,phone), pets(name,species), users(name)').single()
        : await supabase.from('appointments').insert(payload).select('*, customers(name,phone), pets(name,species), users(name)').single();
      if (res.error) {
        const col = res.error.message.match(/'([^']+)' column/)?.[1];
        if (col) { delete payload[col]; continue; }
        alert('Erro: ' + res.error.message);
        setSavingAppt(false);
        return;
      }
      resultData = res.data;
    }

    if (resultData) {
      if (editingAppt) setAppointments(prev => prev.map(a => a.id === resultData.id ? resultData as Appointment : a));
      else setAppointments(prev => [...prev, resultData as Appointment].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
    }
    setSavingAppt(false);
    setShowApptModal(false);
  }

  async function quickStatus(a: Appointment, newStatus: string) {
    await supabase.from('appointments').update({ status: newStatus }).eq('id', a.id);
    setAppointments(prev => prev.map(x => x.id === a.id ? { ...x, status: newStatus } : x));
    if (newStatus === 'completed' && a.price > 0) {
      await supabase.from('cash_transactions').insert({
        tenant_id: tenantId, type: 'in', amount: a.price,
        description: `Agendamento — ${a.title} (${a.customers?.name || 'Cliente'})`,
        reference_id: a.id, reference_type: 'manual', user_id: userId || null,
      });
    }
  }

  function openNewPet(customerId = '') {
    setEditingPet(null);
    setPetForm({ customer_id: customerId, name: '', species: 'dog', breed: '', birth_date: '', notes: '' });
    setShowPetModal(true);
  }
  function openEditPet(p: Pet) {
    setEditingPet(p);
    setPetForm({ customer_id: p.customer_id, name: p.name, species: p.species, breed: p.breed || '', birth_date: p.birth_date || '', notes: p.notes || '' });
    setShowPetModal(true);
  }

  async function savePet(e: React.FormEvent) {
    e.preventDefault();
    setSavingPet(true);
    const payload: any = { ...petForm, breed: petForm.breed || null, birth_date: petForm.birth_date || null, notes: petForm.notes || null, tenant_id: tenantId };
    let resultData: any = null;
    let attempts = 0;
    while (!resultData && attempts < 10) {
      attempts++;
      const res = editingPet
        ? await supabase.from('pets').update(payload).eq('id', editingPet.id).select().single()
        : await supabase.from('pets').insert(payload).select().single();
      if (res.error) {
        const col = res.error.message.match(/'([^']+)' column/)?.[1];
        if (col) { delete payload[col]; continue; }
        alert('Erro: ' + res.error.message);
        setSavingPet(false);
        return;
      }
      resultData = res.data;
    }
    if (resultData) {
      if (editingPet) setPets(prev => prev.map(p => p.id === resultData.id ? resultData : p));
      else setPets(prev => [...prev, resultData].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSavingPet(false);
    setShowPetModal(false);
  }

  async function deletePet(p: Pet) {
    if (!confirm(`Remover ${p.name}? Os agendamentos vinculados perderão a referência ao pet.`)) return;
    await supabase.from('pets').delete().eq('id', p.id);
    setPets(prev => prev.filter(x => x.id !== p.id));
  }

  const filteredPets = pets.filter(p => {
    const q = petSearch.toLowerCase();
    if (!q) return true;
    const cust = customers.find(c => c.id === p.customer_id);
    return p.name.toLowerCase().includes(q) || cust?.name.toLowerCase().includes(q) || (p.breed || '').toLowerCase().includes(q);
  });

  // Group appointments by date for display
  const byDate = filteredAppts.reduce<Record<string, Appointment[]>>((acc, a) => {
    const d = a.scheduled_at.split('T')[0];
    (acc[d] ||= []).push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>📅 Agenda</h1>
          <p style={{ color: 'var(--kdl-text-muted)', fontSize: '0.875rem' }}>{appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length} agendamentos pendentes</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${tab === 'agenda' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('agenda')}>📅 Agenda</button>
          <button className={`btn btn-sm ${tab === 'pets' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('pets')}>🐾 Pets ({pets.length})</button>
          {tab === 'agenda' && <button className="btn btn-primary" onClick={openNewAppt}>+ Novo Agendamento</button>}
          {tab === 'pets'  && <button className="btn btn-primary" onClick={() => openNewPet()}>+ Novo Pet</button>}
        </div>
      </div>

      {/* ===================== AGENDA TAB ===================== */}
      {tab === 'agenda' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ maxWidth: 180 }} />
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
              <option value="">Todos os status</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>Ver todos</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {Object.entries(STATUS).map(([k, v]) => {
                const n = appointments.filter(a => a.status === k && (filterDate ? a.scheduled_at.startsWith(filterDate) : true)).length;
                return n > 0 ? <span key={k} className={`badge ${v.badge}`}>{n} {v.label}</span> : null;
              })}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--kdl-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando...</p>
          ) : !sortedDates.length ? (
            <div className="empty-state">
              <span style={{ fontSize: '2.5rem' }}>📅</span>
              <p>{filterDate ? 'Nenhum agendamento neste dia.' : 'Nenhum agendamento encontrado.'}</p>
              <button className="btn btn-primary" onClick={openNewAppt}>Criar primeiro agendamento</button>
            </div>
          ) : sortedDates.map(date => (
            <div key={date} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--kdl-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--kdl-border)' }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {byDate[date].map(a => {
                  const st = STATUS[a.status as keyof typeof STATUS] || STATUS.scheduled;
                  const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const nextStatuses: Record<string, string> = { scheduled: 'confirmed', confirmed: 'in_progress', in_progress: 'completed' };
                  const nextStatus = nextStatuses[a.status];
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: '1rem', background: 'var(--kdl-surface)', border: '1px solid var(--kdl-border)', borderLeft: `4px solid ${st.color}`, borderRadius: 10, padding: '0.875rem 1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = st.color)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--kdl-border)')}
                      onClick={() => openEditAppt(a)}
                    >
                      <div style={{ minWidth: 52, textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: st.color }}>{time}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--kdl-text-dim)' }}>{a.duration_min}min</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</p>
                          <span className={`badge ${st.badge}`} style={{ flexShrink: 0 }}>{st.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {a.customers && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)' }}>👤 {a.customers.name}</p>}
                          {a.pets && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)' }}>🐾 {a.pets.name}</p>}
                          {a.users && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)' }}>🔧 {a.users.name}</p>}
                          {a.price > 0 && <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00D4AA' }}>{fmt(a.price)}</p>}
                        </div>
                        {a.notes && <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)', marginTop: 4 }}>📝 {a.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        {nextStatus && (
                          <button className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                            onClick={() => quickStatus(a, nextStatus)}>
                            → {STATUS[nextStatus as keyof typeof STATUS]?.label}
                          </button>
                        )}
                        {a.status !== 'cancelled' && a.status !== 'completed' && (
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem', color: '#EF4444' }}
                            onClick={() => quickStatus(a, 'cancelled')}>✕</button>
                        )}
                        {a.customers?.phone && (
                          <a href={`https://wa.me/55${a.customers.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${a.customers.name}! Lembrando do agendamento: *${a.title}* às ${time}.`)}`}
                            target="_blank" rel="noreferrer"
                            className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }}>📲</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ===================== PETS TAB ===================== */}
      {tab === 'pets' && (
        <>
          <input type="text" className="form-input" placeholder="🔍 Buscar por pet, cliente ou raça..." value={petSearch} onChange={e => setPetSearch(e.target.value)} style={{ maxWidth: 380, marginBottom: '1.25rem' }} />
          {!filteredPets.length ? (
            <div className="empty-state">
              <span style={{ fontSize: '2.5rem' }}>🐾</span>
              <p>{petSearch ? 'Nenhum pet encontrado.' : 'Nenhum pet cadastrado ainda.'}</p>
              <button className="btn btn-primary" onClick={() => openNewPet()}>Cadastrar primeiro pet</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredPets.map(p => {
                const cust = customers.find(c => c.id === p.customer_id);
                const petAppts = appointments.filter(a => a.pet_id === p.id).length;
                return (
                  <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openEditPet(p)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{SPECIES[p.species] || '🐾'} {p.name}</p>
                        {p.breed && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)' }}>{p.breed}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setApptForm(f => ({ ...f, customer_id: p.customer_id, pet_id: p.id })); openNewAppt(); }}>📅 Agendar</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deletePet(p)}>🗑️</button>
                      </div>
                    </div>
                    {cust && <p style={{ fontSize: '0.78rem', color: 'var(--kdl-text-muted)', marginBottom: 4 }}>👤 {cust.name} · {cust.phone}</p>}
                    {p.birth_date && <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)' }}>🎂 {new Date(p.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>}
                    {petAppts > 0 && <span className="badge badge-info" style={{ marginTop: 8 }}>{petAppts} agendamento{petAppts > 1 ? 's' : ''}</span>}
                    {p.notes && <p style={{ fontSize: '0.72rem', color: 'var(--kdl-text-dim)', marginTop: 6 }}>📝 {p.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===================== MODAL AGENDAMENTO ===================== */}
      {showApptModal && (
        <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editingAppt ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
            <form onSubmit={saveAppt} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Serviço / Título *</label>
                <input type="text" className="form-input" value={apptForm.title} onChange={e => setApptForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex: Banho e tosa, Instalação de alarme, Consulta..." />
              </div>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-select" value={apptForm.customer_id} onChange={e => setApptForm(f => ({ ...f, customer_id: e.target.value, pet_id: '' }))}>
                  <option value="">Sem cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {formPets.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Pet</label>
                  <select className="form-select" value={apptForm.pet_id} onChange={e => setApptForm(f => ({ ...f, pet_id: e.target.value }))}>
                    <option value="">Sem pet</option>
                    {formPets.map(p => <option key={p.id} value={p.id}>{SPECIES[p.species] || '🐾'} {p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Data e Hora *</label>
                <input type="datetime-local" className="form-input" value={apptForm.scheduled_at} onChange={e => setApptForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duração (min)</label>
                <input type="number" min={15} step={15} className="form-input" value={apptForm.duration_min} onChange={e => setApptForm(f => ({ ...f, duration_min: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input type="number" min={0} step={0.01} className="form-input" value={apptForm.price} onChange={e => setApptForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Técnico / Responsável</label>
                <select className="form-select" value={apptForm.technician_id} onChange={e => setApptForm(f => ({ ...f, technician_id: e.target.value }))}>
                  <option value="">Não atribuído</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS).map(([k, v]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.75rem', border: '1px solid', borderColor: apptForm.status === k ? v.color : 'var(--kdl-border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: apptForm.status === k ? `${v.color}15` : 'transparent', color: apptForm.status === k ? v.color : 'var(--kdl-text-muted)', transition: 'all 0.15s' }}>
                      <input type="radio" name="appt-status" value={k} checked={apptForm.status === k} onChange={() => setApptForm(f => ({ ...f, status: k }))} style={{ display: 'none' }} />{v.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" value={apptForm.notes} onChange={e => setApptForm(f => ({ ...f, notes: e.target.value }))} placeholder="Informações adicionais..." />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApptModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingAppt}>{savingAppt ? 'Salvando...' : editingAppt ? 'Salvar' : 'Agendar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL PET ===================== */}
      {showPetModal && (
        <div className="modal-overlay" onClick={() => setShowPetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem' }}>{editingPet ? 'Editar Pet' : 'Cadastrar Pet'}</h2>
            <form onSubmit={savePet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Cliente *</label>
                <select className="form-select" value={petForm.customer_id} onChange={e => setPetForm(f => ({ ...f, customer_id: e.target.value }))} required>
                  <option value="">Selecionar...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Pet *</label>
                  <input type="text" className="form-input" value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Rex, Bolinha..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Espécie</label>
                  <select className="form-select" value={petForm.species} onChange={e => setPetForm(f => ({ ...f, species: e.target.value }))}>
                    {Object.entries(SPECIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Raça</label>
                  <input type="text" className="form-input" value={petForm.breed} onChange={e => setPetForm(f => ({ ...f, breed: e.target.value }))} placeholder="Ex: Labrador, SRD..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <input type="date" className="form-input" value={petForm.birth_date} onChange={e => setPetForm(f => ({ ...f, birth_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" value={petForm.notes} onChange={e => setPetForm(f => ({ ...f, notes: e.target.value }))} placeholder="Alergia, temperamento, vacinas..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPetModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingPet}>{savingPet ? 'Salvando...' : editingPet ? 'Salvar' : 'Cadastrar Pet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
