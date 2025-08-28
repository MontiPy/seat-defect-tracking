const isDevelopment = process.env.NODE_ENV === 'development';

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.enabled =
      isDevelopment || process.env.REACT_APP_ENABLE_LOGGING === 'true';
  }

  _log(level, message, data = null) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();

    switch (level) {
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ERROR:`, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] WARN:`, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] INFO:`, message, data || '');
        break;
      case LogLevel.DEBUG:
        console.log(`[${timestamp}] DEBUG:`, message, data || '');
        break;
      default:
        console.log(`[${timestamp}] ${level}:`, message, data || '');
    }

    // In production, you might want to send logs to an external service
    if (!isDevelopment && level === LogLevel.ERROR) {
      // TODO: Send error logs to monitoring service
    }
  }

  error(message, data) {
    this._log(LogLevel.ERROR, message, data);
  }

  warn(message, data) {
    this._log(LogLevel.WARN, message, data);
  }

  info(message, data) {
    this._log(LogLevel.INFO, message, data);
  }

  debug(message, data) {
    this._log(LogLevel.DEBUG, message, data);
  }
}

const logger = new Logger();

export default logger;
