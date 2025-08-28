import logger from './logger';

class Config {
  constructor() {
    this.apiUrl = this._validateAndSetApiUrl();
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.nodeEnv === 'development';
    this.isProduction = this.nodeEnv === 'production';
  }

  _validateAndSetApiUrl() {
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!apiUrl) {
      const defaultUrl = 'http://localhost:3001';
      logger.warn('REACT_APP_API_URL not set, using default', { defaultUrl });
      return defaultUrl;
    }

    // Validate URL format
    try {
      new URL(apiUrl);
      return apiUrl;
    } catch (error) {
      logger.error(
        'Invalid REACT_APP_API_URL format, falling back to default',
        {
          providedUrl: apiUrl,
          error: error.message,
        }
      );
      return 'http://localhost:3001';
    }
  }

  getImageUrl(imageUrl) {
    if (!imageUrl) return '';

    // If it's already a full URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Construct full URL from relative path
    return `${this.apiUrl}${imageUrl}`;
  }
}

const config = new Config();

export default config;
