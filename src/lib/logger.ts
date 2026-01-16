import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Define log levels with colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'gray',
}

winston.addColors(logColors)

// Custom format for console output
const consoleFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    const emoji =
      {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        http: '🌐',
        debug: '🔍',
      }[level] || '📝'

    let msg = `${timestamp} ${emoji} [${level.toUpperCase()}]: ${message}`

    // Add stack trace for errors
    if (stack) {
      msg += `\n${stack}`
    }

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`
    }

    return msg
  }
)

// Custom format for file output (JSON)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  winston.format.json()
)

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  transports: [
    // Console transport (always enabled, works in serverless)
    new winston.transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),
    // File transports only for local production testing (disabled on Vercel)
    ...(process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL &&
    !process.env.AWS_LAMBDA_FUNCTION_NAME
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
          }),
        ]
      : []),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
})

// Create a stream object for Morgan or other middleware
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Helper functions for common logging patterns
export const loggers = {
  // GraphQL operations
  graphql: {
    query: (operationName: string, variables?: unknown) => {
      logger.debug('GraphQL Query', { operationName, variables })
    },
    mutation: (operationName: string, variables?: unknown) => {
      logger.debug('GraphQL Mutation', { operationName, variables })
    },
    error: (operationName: string, error: Error) => {
      logger.error('GraphQL Error', {
        operationName,
        error: error.message,
        stack: error.stack,
      })
    },
  },

  // Database operations
  database: {
    connect: (uri: string) => {
      logger.info('🔌 Database connecting', {
        uri: uri.replace(/\/\/.*@/, '//**:**@'),
      }) // Hide credentials
    },
    connected: () => {
      logger.info('✅ Database connected successfully')
    },
    disconnect: () => {
      logger.info('🔌 Database disconnected')
    },
    query: (query: string, params?: unknown) => {
      logger.debug('Database Query', { query: query.substring(0, 100), params })
    },
    error: (operation: string, error: Error) => {
      logger.error('Database Error', { operation, error: error.message })
    },
  },

  // API operations
  api: {
    request: (method: string, path: string, ip?: string) => {
      logger.http('API Request', { method, path, ip })
    },
    response: (
      method: string,
      path: string,
      statusCode: number,
      duration?: number
    ) => {
      logger.http('API Response', {
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
      })
    },
    error: (
      method: string,
      path: string,
      error: Error,
      statusCode?: number
    ) => {
      logger.error('API Error', {
        method,
        path,
        statusCode,
        error: error.message,
      })
    },
  },

  // Authentication
  auth: {
    login: (userId: string, success: boolean) => {
      if (success) {
        logger.info('🔐 User logged in', { userId })
      } else {
        logger.warn('🔐 Login failed', { userId })
      }
    },
    logout: (userId: string) => {
      logger.info('🔓 User logged out', { userId })
    },
    tokenError: (error: string) => {
      logger.error('🔑 Token validation error', { error })
    },
  },

  // Application lifecycle
  app: {
    starting: () => {
      logger.info('🚀 Application starting...')
    },
    started: (port?: number) => {
      logger.info(
        `✅ Application started successfully${port ? ` on port ${port}` : ''}`
      )
    },
    shutdown: () => {
      logger.info('🛑 Application shutting down...')
    },
    error: (error: Error) => {
      logger.error('💥 Application error', {
        error: error.message,
        stack: error.stack,
      })
    },
  },
}

export default logger
