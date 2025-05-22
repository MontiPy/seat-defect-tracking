import ProjectSelectPage from './pages/ProjectSelectPage';
// Import your existing screens:
import EntryDefectScreen from './pages/EntryDefectScreen';
import DefectsReviewScreen from './pages/DefectsReviewScreen';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectSelectPage />} />
        <Route path="/entry-defect" element={<EntryDefectScreen />} />
        <Route path="/defects-review" element={<DefectsReviewScreen />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
