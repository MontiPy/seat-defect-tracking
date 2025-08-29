/**
 * Seat Defect Tracking System - Main Application Component
 *
 * This is the root component for a comprehensive seat defect tracking system
 * designed for automotive manufacturing. The application provides tools for:
 * - Project management and selection
 * - Interactive defect logging with canvas-based mapping
 * - Zone creation for defining clickable areas on reference images
 * - Defect review with heatmap visualization
 * - Issue tracking and management
 * - Pareto chart analytics for defect analysis
 *
 * Architecture:
 * - Project-based routing with projectId parameter in most routes
 * - Error boundaries wrapping all major components for error isolation
 * - Material-UI theme integration for consistent design
 * - Canvas-based defect mapping using Konva.js
 */

// Page Components - Main application screens
import ProjectSelectPage from './pages/ProjectSelectPage';
import ProjectManager from './pages/ProjectManager';
import DefectTypesManager from './pages/DefectTypesManager';
import IssueTrackingScreen from './pages/IssueTrackingScreen';
import EntryDefectScreen from './pages/EntryDefectScreen';
import DefectsReviewScreen from './pages/DefectsReviewScreen';
import ParetoChartScreen from './pages/ParetoChartScreen';
import ZoneCreatorScreen from './pages/ZoneCreatorScreen';

// Core React and UI dependencies
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

// Shared components
import NavBar from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

/**
 * Main Application Component
 *
 * Sets up the routing structure for the seat defect tracking system.
 * All routes (except management pages) include a projectId parameter to
 * enable multi-project support.
 *
 * Route Structure:
 * - / : Project selection landing page
 * - /projects/:projectId/entry-defect : Main defect logging interface
 * - /projects/:projectId/defects-review : Defect analysis and heatmaps
 * - /projects/:projectId/zone-editor : Interactive zone creation tool
 * - /projects/:projectId/pareto : Analytics dashboard
 * - /projects/:projectId/issue-tracking : Issue management system
 * - /manage-projects : Global project CRUD operations
 * - /manage-defect-types : Global defect type management
 *
 * @returns {JSX.Element} The main application with routing and theme
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Router>
          {/* Global navigation bar with project context and breadcrumbs */}
          <NavBar />

          <Routes>
            {/* Landing page - Project selection */}
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <ProjectSelectPage />
                </ErrorBoundary>
              }
            />

            {/* Main defect logging interface - Core functionality */}
            <Route
              path="/projects/:projectId/entry-defect"
              element={
                <ErrorBoundary>
                  <EntryDefectScreen />
                </ErrorBoundary>
              }
            />

            {/* Defect analysis with heatmaps and visualizations */}
            <Route
              path="/projects/:projectId/defects-review"
              element={
                <ErrorBoundary>
                  <DefectsReviewScreen />
                </ErrorBoundary>
              }
            />

            {/* Interactive zone creation for reference images */}
            <Route
              path="/projects/:projectId/zone-editor"
              element={
                <ErrorBoundary>
                  <ZoneCreatorScreen />
                </ErrorBoundary>
              }
            />

            {/* Analytics dashboard with Pareto charts */}
            <Route
              path="/projects/:projectId/pareto"
              element={
                <ErrorBoundary>
                  <ParetoChartScreen />
                </ErrorBoundary>
              }
            />

            {/* Issue tracking and management system */}
            <Route
              path="/projects/:projectId/issue-tracking"
              element={
                <ErrorBoundary>
                  <IssueTrackingScreen />
                </ErrorBoundary>
              }
            />

            {/* Global project management (not project-specific) */}
            <Route
              path="/manage-projects"
              element={
                <ErrorBoundary>
                  <ProjectManager />
                </ErrorBoundary>
              }
            />

            {/* Global defect type management (not project-specific) */}
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
    </ThemeProvider>
  );
}

export default App;
