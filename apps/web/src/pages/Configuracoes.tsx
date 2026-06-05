import { Building2, User, Bell, Database, Shield, Palette } from 'lucide-react'

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Configurações</h2>
        <p className="page-subtitle">Gerencie as configurações da aplicação e da empresa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar de configurações */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <nav className="space-y-1">
            {[
              { icon: Building2, label: 'Empresa' },
              { icon: User, label: 'Perfil' },
              { icon: Bell, label: 'Notificações' },
              { icon: Database, label: 'Integrações' },
              { icon: Shield, label: 'Segurança' },
              { icon: Palette, label: 'Aparência' },
            ].map(({ icon: Icon, label }, i) => (
              <button key={i} className={`sidebar-link w-full ${i === 0 ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Dados da Empresa
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nome da empresa', value: 'CHUA', placeholder: 'Nome da empresa' },
                { label: 'CNPJ', value: '00.000.000/0001-00', placeholder: 'CNPJ' },
                { label: 'Segmento', value: 'Tecnologia', placeholder: 'Segmento' },
                { label: 'Cidade/Estado', value: 'São Paulo, SP', placeholder: 'Cidade/Estado' },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                  <input
                    defaultValue={f.value}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Moeda padrão</label>
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option>BRL - Real Brasileiro</option>
                <option>USD - Dólar Americano</option>
                <option>EUR - Euro</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              Integração Supabase
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">URL do projeto</label>
                <input
                  placeholder="https://xxxxx.supabase.co"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xs text-amber-700">Configure as variáveis de ambiente no arquivo <code className="font-mono">.env</code> para conectar ao Supabase.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="btn-secondary">Cancelar</button>
            <button className="btn-primary">Salvar alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}
