import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Objetivos from './pages/Objetivos'
import Indicadores from './pages/Indicadores'
import Vendas from './pages/Vendas'
import Despesas from './pages/Despesas'
import Devolucoes from './pages/Devolucoes'
import DRE from './pages/DRE'
import Alertas from './pages/Alertas'
import Decisoes from './pages/Decisoes'
import Agentes from './pages/Agentes'
import Automacoes from './pages/Automacoes'
import Configuracoes from './pages/Configuracoes'
import CanvasListPage from './features/canvas/pages/CanvasListPage'
import CanvasPage from './features/canvas/pages/CanvasPage'
import CanvasOperacional from './pages/CanvasOperacional'
import KanbanPage from './pages/Kanban'
import Formulario from './pages/Formulario'
import { Loader2 } from 'lucide-react'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/objetivos" element={<Objetivos />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/devolucoes" element={<Devolucoes />} />
          <Route path="/dre" element={<DRE />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/decisoes" element={<Decisoes />} />
          <Route path="/agentes" element={<Agentes />} />
          <Route path="/automacoes" element={<Automacoes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/canvases" element={<CanvasOperacional />} />
          <Route path="/kanban"      element={<KanbanPage />} />
          <Route path="/formulario"  element={<Formulario />} />
          <Route path="/canvas/:canvasId" element={<CanvasPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default function App() {
  return <AppRoutes />
}
