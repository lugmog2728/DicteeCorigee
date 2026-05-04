import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Planning from './pages/Planning'
import Classes from './pages/Classes'
import Statistics from './pages/Statistics'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bibliotheque" element={<Library />} />
          <Route path="/planification" element={<Planning />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/statistiques" element={<Statistics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
