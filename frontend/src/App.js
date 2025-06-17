import ProjectSelectPage from './pages/ProjectSelectPage';
import ProjectManager from './pages/ProjectManager';
// Import your existing screens:
import EntryDefectScreen from './pages/EntryDefectScreen';
import DefectsReviewScreen from './pages/DefectsReviewScreen';
import ParetoChartScreen from './pages/ParetoChartScreen';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ZoneCreatorScreen from './pages/ZoneCreatorScreen';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<ProjectSelectPage />} />
        <Route path="/projects/:projectId/entry-defect" element={<EntryDefectScreen />} />
        <Route path="/projects/:projectId/defects-review" element={<DefectsReviewScreen />} />
        <Route path="/projects/:projectId/zone-editor" element={<ZoneCreatorScreen />} />
        <Route path="/projects/:projectId/pareto" element={<ParetoChartScreen />} />
        <Route path="/manage-projects" element={<ProjectManager />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
