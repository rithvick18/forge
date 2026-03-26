import { useState, useEffect } from 'react'
import { settingsApi } from '../lib/api'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  const [settings, setSettings] = useState({
    MISTRAL_API_KEY: '',
    APP_NAME: 'Forge',
    FMCG_CATEGORIES: [] as string[],
    INDIAN_STATES: [] as string[]
  })

  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsApi.get()
      setSettings(data)
    } catch (err: any) {
      console.error('Failed to fetch settings:', err)
      setStatus({ type: 'error', message: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string, updates: any) => {
    try {
      setSaving(section)
      setStatus(null)
      await settingsApi.update(updates)
      setStatus({ type: 'success', message: `${section} updated successfully` })
      setTimeout(() => setStatus(null), 3000)
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Update failed' })
    } finally {
      setSaving(null)
    }
  }

  const addCategory = () => {
    if (!newCategory.trim()) return
    const updated = [...settings.FMCG_CATEGORIES, newCategory.trim()]
    setSettings({ ...settings, FMCG_CATEGORIES: updated })
    setNewCategory('')
    handleSave('Categories', { FMCG_CATEGORIES: updated })
  }

  const removeCategory = (cat: string) => {
    const updated = settings.FMCG_CATEGORIES.filter(c => c !== cat)
    setSettings({ ...settings, FMCG_CATEGORIES: updated })
    handleSave('Categories', { FMCG_CATEGORIES: updated })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>
          <p className="text-gray-500 mt-1">Configure your workspace and system preferences.</p>
        </div>
        {status && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-4 ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {status.message}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        
        {/* API Configuration */}
        <section className="glass rounded-3xl overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">key</span>
              <h3 className="text-xl font-bold">API Configuration</h3>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Mistral API Key</label>
              <div className="flex gap-4">
                <input 
                  type="password"
                  value={settings.MISTRAL_API_KEY}
                  onChange={(e) => setSettings({...settings, MISTRAL_API_KEY: e.target.value})}
                  placeholder="Enter your Mistral API key"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button 
                  onClick={() => handleSave('API Key', { MISTRAL_API_KEY: settings.MISTRAL_API_KEY })}
                  disabled={saving === 'API Key'}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving === 'API Key' ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-[10px] text-gray-500">This key is used for the AI Copilot and narrative insights.</p>
            </div>
          </div>
        </section>

        {/* Workspace Settings */}
        <section className="glass rounded-3xl overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">domain</span>
              <h3 className="text-xl font-bold">Workspace</h3>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Platform Name</label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={settings.APP_NAME}
                  onChange={(e) => setSettings({...settings, APP_NAME: e.target.value})}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button 
                  onClick={() => handleSave('App Name', { APP_NAME: settings.APP_NAME })}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">FMCG Categories</label>
              <div className="flex flex-wrap gap-2">
                {settings.FMCG_CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full group">
                    <span className="text-xs font-bold">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="material-symbols-outlined text-xs text-gray-500 hover:text-red-400"
                    >
                      close
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="Add new category..."
                  className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary/30"
                />
                <button 
                  onClick={addCategory}
                  className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security Placeholder */}
        <section className="glass rounded-3xl p-8 border border-white/5 opacity-60">
          <div className="flex justify-between items-center text-gray-400">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">security</span>
              <div>
                <h3 className="font-bold">Security & Auth</h3>
                <p className="text-xs">Single-user mode active. No auth required.</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Read-Only</span>
          </div>
        </section>

      </div>
    </div>
  )
}
