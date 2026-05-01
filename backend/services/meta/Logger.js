const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_COLORS = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const RESET = '\x1b[0m';

class Logger {
  constructor({ level = process.env.LOG_LEVEL || 'info', context = {}, env = process.env.NODE_ENV || 'development', sink = console } = {}) {
    this.level = level;
    this.context = context;
    this.env = env;
    this.sink = sink;
  }

  child(extraContext = {}) {
    return new Logger({
      level: this.level,
      context: { ...this.context, ...extraContext },
      env: this.env,
      sink: this.sink,
    });
  }

  debug(message, context = {}) {
    this.#write('debug', message, context);
  }

  info(message, context = {}) {
    this.#write('info', message, context);
  }

  warn(message, context = {}) {
    this.#write('warn', message, context);
  }

  error(message, context = {}) {
    this.#write('error', message, context);
  }

  #canLog(level) {
    return LEVELS[level] >= (LEVELS[this.level] || LEVELS.info);
  }

  #write(level, message, context = {}) {
    if (!this.#canLog(level)) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    if (this.env === 'production') {
      this.sink.log(JSON.stringify(payload));
      return;
    }

    const color = LEVEL_COLORS[level] || '';
    this.sink.log(`${color}[${payload.timestamp}] ${level.toUpperCase()} ${message} ${JSON.stringify(payload.context)}${RESET}`);
  }
}

module.exports = {
  Logger,
  LEVELS,
};
