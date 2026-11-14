import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QullqaProvider } from '@/context/QullqaContext'
import { ErrorBoundary } from '@/components/common'
import { Header, SafeArea, BottomNav } from '@/components/layout'

function AppContent() {
  return (
    <div className="min-h-screen bg-tierra-50 flex flex-col">
      <Header />
      <SafeArea className="flex-1">
        <Routes>
          <Route path="/" element={<div className="flex items-center justify-center">
            <p className="text-center text-tierra-700">Pantalla de inicio...</p>
          </div>} />
          <Route path="/my-farm" element={<div className="flex items-center justify-center">
            <p className="text-center text-tierra-700">Pantalla Mi chacra...</p>
          </div>} />
          <Route path="/calendar" element={<div className="flex items-center justify-center">
            <p className="text-center text-tierra-700">Calendario inca...</p>
          </div>} />
          <Route path="/my-crop" element={<div className="flex items-center justify-center">
            <p className="text-center text-tierra-700">Mi cultivo...</p>
          </div>} />
          <Route path="/mars" element={<div className="flex items-center justify-center">
            <p className="text-center text-tierra-700">Qullqa en Marte...</p>
          </div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SafeArea>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QullqaProvider>
        <Router>
          <AppContent />
        </Router>
      </QullqaProvider>
    </ErrorBoundary>
  )
}

export default App
