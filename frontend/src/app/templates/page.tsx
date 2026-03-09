'use client';
import { useEffect, useState } from 'react';
import { api, Template } from '../../lib/api';
import { PageHeader, Button, Spinner, EmptyState } from '../../components/ui';

const defaultForm = {
  name: '', description: '',
  software_list: [] as string[],
  security_config: { firewall: 'standard', bitlocker: true, uac: 'medium', defender: true },
  scripts: [] as string[],
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [softwareInput, setSoftwareInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const load = async () => {
    const data = await api.getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) return alert('Template name required');
    await api.createTemplate(form);
    setShowCreate(false);
    setForm(defaultForm);
    setSoftwareInput('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await api.deleteTemplate(id);
    load();
  };

  const addSoftware = () => {
    if (!softwareInput.trim()) return;
    setForm(f => ({ ...f, software_list: [...f.software_list, softwareInput.trim()] }));
    setSoftwareInput('');
  };

  const availableScripts = ['install_packages.ps1', 'configure_security.ps1', 'system_health_check.ps1', 'generate_report.ps1'];

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Deployment Templates"
        subtitle="Reusable configuration blueprints"
        action={<Button onClick={() => setShowCreate(true)}>+ New Template</Button>}
      />

      {/* Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="terminal-card w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs font-mono text-terminal-accent mb-1">// TEMPLATE DETAILS</div>
                <h2 className="text-lg font-display font-bold text-white">{selectedTemplate.name}</h2>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-terminal-muted hover:text-white">✕</button>
            </div>
            <p className="text-terminal-muted text-sm mb-4">{selectedTemplate.description}</p>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-terminal-muted uppercase mb-2">Software List</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.software_list.map(s => (
                    <span key={s} className="bg-terminal-border text-terminal-text text-xs font-mono px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-terminal-muted uppercase mb-2">Scripts</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.scripts.map(s => (
                    <span key={s} className="bg-terminal-accent/10 border border-terminal-accent/20 text-terminal-accent text-xs font-mono px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-terminal-muted uppercase mb-2">Security Config</div>
                <div className="bg-black/40 rounded p-3 font-mono text-xs text-terminal-text">
                  {Object.entries(selectedTemplate.security_config || {}).map(([k, v]) => (
                    <div key={k}><span className="text-terminal-accent">{k}:</span> {String(v)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="terminal-card w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="text-xs font-mono text-terminal-accent mb-5">// CREATE TEMPLATE</div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Template Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm focus:outline-none focus:border-terminal-accent"
                  placeholder="e.g. Developer Machine" />
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm focus:outline-none focus:border-terminal-accent h-20 resize-none"
                  placeholder="Describe this template..." />
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Software Packages</label>
                <div className="flex gap-2 mb-2">
                  <input value={softwareInput} onChange={e => setSoftwareInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSoftware()}
                    className="flex-1 bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm focus:outline-none focus:border-terminal-accent"
                    placeholder="Package name (Enter to add)" />
                  <Button size="sm" onClick={addSoftware}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.software_list.map(s => (
                    <span key={s} className="bg-terminal-border text-terminal-text text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      {s}
                      <button onClick={() => setForm(f => ({...f, software_list: f.software_list.filter(x => x !== s)}))} className="text-terminal-red ml-1">✕</button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-2">Automation Scripts</label>
                <div className="space-y-1">
                  {availableScripts.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.scripts.includes(s)}
                        onChange={e => setForm(f => ({...f, scripts: e.target.checked ? [...f.scripts, s] : f.scripts.filter(x => x !== s)}))}
                        className="accent-terminal-accent" />
                      <span className="font-mono text-xs text-terminal-text">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate}>Create Template</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <EmptyState message="No templates yet. Create one to standardize deployments." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="terminal-card p-5 hover:border-terminal-accent/40 transition-colors cursor-pointer" onClick={() => setSelectedTemplate(t)}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-lg">⊞</div>
                <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="text-terminal-muted hover:text-terminal-red text-xs font-mono">DELETE</button>
              </div>
              <h3 className="font-display font-bold text-white mb-1">{t.name}</h3>
              <p className="text-terminal-muted text-xs mb-4 line-clamp-2">{t.description}</p>
              <div className="space-y-2">
                <div className="text-xs font-mono text-terminal-muted">
                  {t.software_list.length} packages · {t.scripts.length} scripts
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.software_list.slice(0, 3).map(s => (
                    <span key={s} className="bg-terminal-border text-terminal-muted text-xs font-mono px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {t.software_list.length > 3 && (
                    <span className="text-terminal-muted text-xs font-mono">+{t.software_list.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
