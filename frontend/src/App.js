import ProjectSelectPage from './pages/ProjectSelectPage';
// Import your existing screens:
import EntryDefectScreen from './pages/EntryDefectScreen';
import DefectsReviewScreen from './pages/DefectsReviewScreen';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ZoneCreatorScreen from './pages/ZoneCreatorScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectSelectPage />} />
        <Route path="/projects/:projectId/entry-defect" element={<EntryDefectScreen />} />
        <Route path="/projects/:projectId/defects-review" element={<DefectsReviewScreen />} />
        <Route path="/projects/:projectId/zone-editor" element={<ZoneCreatorScreen />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
