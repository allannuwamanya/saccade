import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  Search,
  ExternalLink,
  Mail,
  Linkedin,
  Calendar,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SupabaseService, CompanyItem } from '../services/supabase';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Form states
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');

  useEffect(() => {
    setCompanies(SupabaseService.getCompanies());
  }, []);

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const newCompany: CompanyItem = {
      id: 'comp-' + Date.now(),
      name: newCompanyName.trim(),
      industry: newIndustry.trim() || 'Technology',
      size: newSize.trim() || '100-500 employees',
      website: newWebsite.trim() || 'https://',
      notes: newNotes.trim(),
      status: 'target',
      contacts: [],
    };

    SupabaseService.saveCompany(newCompany);
    setCompanies([newCompany, ...companies]);
    setShowAddCompanyModal(false);
    setNewCompanyName('');
    setNewIndustry('');
    setNewSize('');
    setNewWebsite('');
    setNewNotes('');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !selectedCompanyId) return;

    const updated = companies.map((c) => {
      if (c.id === selectedCompanyId) {
        return {
          ...c,
          contacts: [
            ...c.contacts,
            {
              id: 'con-' + Date.now(),
              name: contactName.trim(),
              role: contactRole.trim(),
              email: contactEmail.trim(),
              linkedinUrl: contactLinkedin.trim(),
              lastContactedAt: 'Just now',
            },
          ],
        };
      }
      return c;
    });

    setCompanies(updated);
    const targetComp = updated.find((c) => c.id === selectedCompanyId);
    if (targetComp) SupabaseService.saveCompany(targetComp);

    setShowAddContactModal(false);
    setContactName('');
    setContactRole('');
    setContactEmail('');
    setContactLinkedin('');
  };

  const filteredCompanies = companies.filter((c) => {
    return (
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contacts.some((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-text-primary)]">
              Target Companies & CRM
            </h1>
            <Badge variant="accent" size="sm">{companies.length} Companies Tracked</Badge>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Manage target employers, organization intelligence notes, and recruiter network relationships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddCompanyModal(true)}>
            <Plus size={16} className="mr-1.5" /> Add Target Company
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search company, recruiter, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {comp.name}
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-text-muted)] hover:text-white"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </h3>
                  <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2 mt-0.5">
                    <span>{comp.industry}</span>
                    <span>•</span>
                    <span>{comp.size}</span>
                  </div>
                </div>

                <Badge
                  variant={comp.status === 'interviewing' ? 'success' : 'default'}
                  size="sm"
                >
                  {comp.status.toUpperCase()}
                </Badge>
              </div>

              {/* Research Notes */}
              {comp.notes && (
                <div className="p-3 rounded-xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] leading-relaxed mt-3">
                  {comp.notes}
                </div>
              )}

              {/* Contacts Sub-section */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} /> Contacts ({comp.contacts.length})
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setShowAddContactModal(true);
                    }}
                    className="text-[var(--color-accent)] hover:underline lowercase font-normal flex items-center gap-0.5"
                  >
                    + add contact
                  </button>
                </div>

                {comp.contacts.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">No contacts added yet.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {comp.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{contact.name}</div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">{contact.role}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="p-1.5 rounded bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)]"
                              title={contact.email}
                            >
                              <Mail size={12} />
                            </a>
                          )}
                          {contact.linkedinUrl && (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)]"
                              title="LinkedIn profile"
                            >
                              <Linkedin size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h2 className="text-lg font-bold text-white">Add Target Company</h2>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-[var(--color-text-muted)] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. OpenAI, Stripe, Figma"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Developer Tools"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Company Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 500-1000 employees"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Research & Strategic Notes</label>
                <textarea
                  rows={3}
                  placeholder="Engineering stack, culture, priorities..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
                <Button type="button" variant="ghost" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h2 className="text-lg font-bold text-white">Add Recruiter / Contact</h2>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-[var(--color-text-muted)] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Chen"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Technical Recruiter or Eng Lead"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  placeholder="sarah@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={contactLinkedin}
                  onChange={(e) => setContactLinkedin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
                <Button type="button" variant="ghost" onClick={() => setShowAddContactModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
