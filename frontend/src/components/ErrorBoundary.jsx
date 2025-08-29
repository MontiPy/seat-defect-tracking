/**
 * ErrorBoundary - React Error Boundary for Graceful Error Handling
 *
 * This component implements React's Error Boundary pattern to catch JavaScript
 * errors anywhere in the child component tree and display a fallback UI instead
 * of crashing the entire application.
 *
 * Features:
 * - Catches errors in component render methods, lifecycle methods, and constructors
 * - Provides user-friendly error messages with helpful recovery options
 * - Logs detailed error information for debugging
 * - Generates unique error IDs for tracking
 * - Shows different UI based on development vs production environment
 * - Provides "Try Again" functionality to recover from transient errors
 *
 * Error Handling Strategy:
 * - Development: Shows detailed error stack traces for debugging
 * - Production: Shows user-friendly messages without technical details
 * - All errors are logged to the centralized logging system
 * - Future: Integration with error monitoring services (Sentry, etc.)
 *
 * Usage:
 * Wrap any component or section that might throw errors:
 * <ErrorBoundary>
 *   <ComponentThatMightFail />
 * </ErrorBoundary>
 *
 * The app.js uses this component to wrap all major route components,
 * providing error isolation between different sections of the application.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to protect
 * @returns {JSX.Element} Either children or error fallback UI
 */

import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import logger from '../utils/logger';

/**
 * ErrorBoundary Class Component
 *
 * Must be a class component to implement error boundary lifecycle methods.
 * Maintains error state and provides recovery mechanisms.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false, // Whether an error has been caught
      error: null, // The actual error object
      errorInfo: null, // React component stack trace
      errorId: null, // Unique identifier for tracking
    };
  }

  /**
   * Static method called when an error is thrown
   * Updates state to trigger error UI rendering
   *
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9), // Generate unique error ID
    };
  }

  /**
   * Lifecycle method called after an error is caught
   * Handles error logging and additional state updates
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack trace information
   */
  componentDidCatch(error, errorInfo) {
    // Update state with detailed error information
    this.setState({
      error,
      errorInfo,
    });

    // Log error using our centralized logger
    logger.error('Error boundary caught an error', { error, errorInfo });

    // TODO: In production, send errors to monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  /**
   * Handle retry/recovery from error state
   * Resets all error state to allow the component tree to re-render
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  /**
   * Render method - shows either children or error fallback UI
   * @returns {JSX.Element} Component content or error interface
   */
  render() {
    // If error caught, show fallback UI instead of children
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
        >
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              An unexpected error occurred while rendering this component.
            </Typography>
            {this.state.errorId && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Error ID: {this.state.errorId}
              </Typography>
            )}
          </Alert>

          <Box display="flex" gap={2}>
            <Button variant="contained" onClick={this.handleRetry}>
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error Details (Development Only):
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontSize: '0.75rem' }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
