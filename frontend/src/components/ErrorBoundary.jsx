import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error using our logger
    logger.error('Error boundary caught an error', { error, errorInfo });

    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
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
