import React, { useState } from 'react';
import { Upload, FileJson, Briefcase, GraduationCap, Award, Save, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'experience' | 'skills'>('basics');
  const [isRawJson, setIsRawJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">Master Profile</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your canonical career data to ground the AI engine.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsRawJson(!isRawJson)}>
            <FileJson size={16} className="mr-2" />
            {isRawJson ? 'Visual Editor' : 'Raw JSON'}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={16} className="mr-2" /> Save Profile
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column (380px) */}
        <div className="w-[380px] shrink-0 space-y-6">
          <Card className="border-dashed border-2 bg-transparent hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                <Upload size={20} />
              </div>
              <h3 className="font-medium text-[var(--color-text-primary)] mb-1">Upload Resume</h3>
              <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                PDF or DOCX. We will parse it and merge into your master profile.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] flex items-center justify-center text-xl font-bold text-[var(--color-text-primary)]">
                  {user?.email?.substring(0, 2).toUpperCase() || 'AM'}
                </div>
                <div>
                  <CardTitle>{user?.name || 'Alex Mercer'}</CardTitle>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">{user?.email || 'alex@example.com'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-[var(--text-sm)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2"><Briefcase size={14}/> Experience</span>
                <span className="font-medium">4 Roles</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-sm)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2"><Award size={14}/> Skills</span>
                <span className="font-medium">28 Tags</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-sm)]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2"><GraduationCap size={14}/> Education</span>
                <span className="font-medium">2 Degrees</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (flex-1) */}
        <div className="flex-1 min-w-0">
          <Card className="h-full min-h-[600px] flex flex-col">
            <div className="flex border-b border-[var(--color-border)] px-4">
              {[
                { id: 'basics', label: 'Basics' },
                { id: 'experience', label: 'Experience' },
                { id: 'skills', label: 'Skills & Education' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-[var(--text-sm)] font-medium border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-[var(--color-accent)] text-[var(--color-text-primary)]' 
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6">
              {isRawJson ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="text-[var(--text-xs)] font-mono text-[var(--color-text-muted)]">master_profile.json</span>
                    <Badge variant="accent" size="sm">Valid JSON</Badge>
                  </div>
                  <textarea 
                    className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 rounded-md border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    defaultValue={JSON.stringify({
                      basics: { name: "Alex Mercer", label: "Senior Software Engineer" },
                      work: [{ company: "TechCorp", position: "Lead Developer" }]
                    }, null, 2)}
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="max-w-2xl">
                  {activeTab === 'basics' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Full Name" defaultValue="Alex Mercer" />
                        <Input label="Headline" defaultValue="Senior Full-Stack Engineer" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" defaultValue="alex.mercer@example.com" />
                        <Input label="Phone" defaultValue="+1 (555) 123-4567" />
                      </div>
                      <Input label="Location" defaultValue="San Francisco, CA" />
                      <div>
                        <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-1.5">Summary</label>
                        <textarea 
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md py-2 px-3 text-[var(--text-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] h-32 resize-none"
                          defaultValue="Experienced software engineer specializing in React, TypeScript, and Node.js..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-[var(--color-text-primary)]">Senior Software Engineer</h4>
                              <div className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1">TechCorp Inc. • San Francisco, CA</div>
                            </div>
                            <div className="text-[var(--text-sm)] font-mono text-[var(--color-text-muted)]">
                              2020 - Present
                            </div>
                          </div>
                          <ul className="list-disc pl-5 space-y-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                            <li>Led frontend development of core dashboard using React and TypeScript.</li>
                            <li>Architected microservices reducing API latency by 40%.</li>
                          </ul>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full border border-dashed border-[var(--color-border)]">
                        + Add Experience
                      </Button>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-3">Languages & Frameworks</h4>
                        <div className="flex flex-wrap gap-2">
                          {['TypeScript', 'React', 'Node.js', 'Python', 'Go', 'GraphQL'].map(skill => (
                            <Badge key={skill} variant="default">{skill}</Badge>
                          ))}
                          <Badge variant="default" className="border-dashed hover:bg-[var(--color-border)] cursor-pointer text-[var(--color-text-muted)]">+ Add</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
