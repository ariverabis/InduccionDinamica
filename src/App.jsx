import React, { Component } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import PortalInicio from './screens/Portal/PortalInicio';
import ConfiguracionSds from './screens/Portal/ConfiguracionSds';
import Simulator from './Simulator';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#fff', height: '100vh', overflow: 'auto' }}>
          <h2 style={{ color: '#d32f2f' }}>⚠ Algo salió mal en el Simulador:</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <p style={{ color: '#666' }}>Por favor, copia este error para que pueda arreglarlo.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardSeguimiento from './pages/DashboardSeguimiento';
import EvaluacionMensual from './pages/EvaluacionMensual';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PortalInicio />} />
          <Route path="/sds" element={<ConfiguracionSds />} />
          <Route path="/login" element={<Login />} />
          <Route path="/simulador" element={
            <ErrorBoundary>
              <Simulator />
            </ErrorBoundary>
          } />
          
          {/* Rutas protegidas para evaluación */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard-seguimiento" element={<DashboardSeguimiento />} />
            <Route path="/evaluacion/:advisorId/mes/:month" element={<EvaluacionMensual />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
