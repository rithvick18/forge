import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/ui/Sidebar'
import Header  from './components/ui/Header'
import Dashboard from './pages/Dashboard'
import Trends    from './pages/Trends'
import Insights  from './pages/Insights'
import Products  from './pages/Products'
import Copilot   from './components/ui/Copilot'
import Settings  from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      {/* Background nebula blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-tertiary-container/10 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <main className="ml-64 h-screen overflow-y-auto relative z-10">
        <Header />
        <div className="p-8 space-y-8">
          <Routes>
            <Route path="/"          element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trends"    element={<Trends />} />
            <Route path="/insights"  element={<Insights />} />
            <Route path="/products"  element={<Products />} />
            <Route path="/settings"  element={<Settings />} />
          </Routes>
        </div>
      </main>

      <Copilot />
    </BrowserRouter>
  )
}
