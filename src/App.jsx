import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import PortalInicio from './screens/Portal/PortalInicio';
import ConfiguracionSds from './screens/Portal/ConfiguracionSds';
import Simulator from './Simulator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalInicio />} />
        <Route path="/sds" element={<ConfiguracionSds />} />
        <Route path="/simulador" element={<Simulator />} />
      </Routes>
    </Router>
  );
}

export default App;
