import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login/index'
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
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
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
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
