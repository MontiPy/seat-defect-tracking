/**
 * API Service Configuration
 *
 * Centralized Axios instance for all HTTP requests to the backend API.
 * Configured for the seat defect tracking system backend.
 *
 * Base Configuration:
 * - Base URL: http://localhost:4000/api (development default)
 * - Content-Type: application/json (axios default)
 * - Timeout: Default axios timeout
 *
 * Usage Patterns:
 * - GET requests: api.get('/endpoint')
 * - POST requests: api.post('/endpoint', data)
 * - PUT requests: api.put('/endpoint/:id', data)
 * - DELETE requests: api.delete('/endpoint/:id')
 *
 * Common API Endpoints:
 * - /projects - Project CRUD operations
 * - /images - Reference image management
 * - /zones - Interactive zone definitions
 * - /defects - Defect logging and retrieval
 * - /issues - Issue tracking
 * - /defect-types - Defect type management
 * - /parts - Seat part definitions
 * - /build-events - Manufacturing event tracking
 *
 * Error Handling:
 * Components using this API should implement .catch() blocks to handle:
 * - Network errors (offline, timeout)
 * - HTTP errors (4xx, 5xx status codes)
 * - JSON parsing errors
 *
 * @example
 * // Get all projects
 * api.get('/projects')
 *   .then(response => response.data)
 *   .catch(error => logger.error('API request failed', error));
 *
 * @example
 * // Create a new defect
 * api.post('/defects', {
 *   image_id: 1,
 *   x: 150,
 *   y: 200,
 *   defect_type_id: 3
 * });
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  // TODO: Consider adding request/response interceptors for:
  // - Authentication tokens (when implemented)
  // - Global error handling
  // - Request/response logging
  // - Loading state management
});

export default api;
