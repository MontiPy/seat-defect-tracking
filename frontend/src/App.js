import ProjectSelectPage from './pages/ProjectSelectPage';
import ProjectManager from './pages/ProjectManager';
import DefectTypesManager from './pages/DefectTypesManager';
import IssueTrackingScreen from './pages/IssueTrackingScreen';
// Import your existing screens:
import EntryDefectScreen from './pages/EntryDefectScreen';
import DefectsReviewScreen from './pages/DefectsReviewScreen';
import ParetoChartScreen from './pages/ParetoChartScreen';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ZoneCreatorScreen from './pages/ZoneCreatorScreen';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <ProjectSelectPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:projectId/entry-defect"
            element={
              <ErrorBoundary>
                <EntryDefectScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:projectId/defects-review"
            element={
              <ErrorBoundary>
                <DefectsReviewScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:projectId/zone-editor"
            element={
              <ErrorBoundary>
                <ZoneCreatorScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:projectId/pareto"
            element={
              <ErrorBoundary>
                <ParetoChartScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:projectId/issue-tracking"
            element={
              <ErrorBoundary>
                <IssueTrackingScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/manage-projects"
            element={
              <ErrorBoundary>
                <ProjectManager />
              </ErrorBoundary>
            }
          />
          <Route
            path="/manage-defect-types"
            element={
              <ErrorBoundary>
                <DefectTypesManager />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
