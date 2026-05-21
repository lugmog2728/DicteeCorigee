import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard/index'
import Library from './pages/Library/index'
import Planning from './pages/Planning/index'
import Classes from './pages/Classes/index'
import Statistics from './pages/Statistics/index'
import Correction from './pages/Correction/Upload'
import Detection from './pages/Correction/Detection'
import Validation from './pages/Correction/Validation'
import Results from './pages/Correction/Results'

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
          <Route path="/correction" element={<Correction />} />
          <Route path="/correction/detection" element={<Detection />} />
          <Route path="/correction/validation" element={<Validation />} />
          <Route path="/correction/results" element={<Results />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
