import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ element, requiredRole }: { element: React.ReactNode; requiredRole?: string }) {
  const { user } = useAuth()
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/canvases" replace />
  }
  return element
}

// Páginas carregadas sob demanda (code-splitting) — reduz o bundle inicial
const Dashboard         = lazy(() => import('./pages/Dashboard'))
const Objetivos         = lazy(() => import('./pages/Objetivos'))
const Indicadores       = lazy(() => import('./pages/Indicadores'))
const Vendas            = lazy(() => import('./pages/Vendas'))
const Despesas          = lazy(() => import('./pages/Despesas'))
const Devolucoes        = lazy(() => import('./pages/Devolucoes'))
const DRE               = lazy(() => import('./pages/DRE'))
const Alertas           = lazy(() => import('./pages/Alertas'))
const Decisoes          = lazy(() => import('./pages/Decisoes'))
const Agentes           = lazy(() => import('./pages/Agentes'))
const Automacoes        = lazy(() => import('./pages/Automacoes'))
const Configuracoes     = lazy(() => import('./pages/Configuracoes'))
const CanvasPage        = lazy(() => import('./features/canvas/pages/CanvasPage'))
const CanvasOperacional = lazy(() => import('./pages/CanvasOperacional'))
const KanbanPage        = lazy(() => import('./pages/Kanban'))
const Formulario        = lazy(() => import('./pages/Formulario'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />

  if (!user) {
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/canvases" replace />} />
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
            <Route path="/configuracoes" element={<ProtectedRoute element={<Configuracoes />} requiredRole="admin" />} />
            <Route path="/canvases" element={<CanvasOperacional />} />
            <Route path="/kanban"      element={<KanbanPage />} />
            <Route path="/formulario"  element={<Formulario />} />
            <Route path="/canvas/:canvasId" element={<CanvasPage />} />
            <Route path="*" element={<Navigate to="/canvases" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default function App() {
  return <AppRoutes />
}
