import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="text-center p-8">Loading...</div>} />
      </Routes>
    </Router>
  )
}

export default App
