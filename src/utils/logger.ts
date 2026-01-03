/**
 * Log levels for the logger.
 * Follows Pino's numeric values.
 */
export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}

const LogLevelLabel: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

const LogLevelColor: Record<LogLevel, string> = {
  [LogLevel.TRACE]: '\x1b[90m', // Gray
  [LogLevel.DEBUG]: '\x1b[34m', // Blue
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[41m\x1b[37m', // Red BG, White FG
};

const RESET_COLOR = '\x1b[0m';

/**
 * A lightweight, pino-like logger for structured logging.
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isProduction: boolean;

  constructor() {
    // We check env directly to avoid circular dependency with env.ts
    const env =
      process.env.CHRONOS_ENV || process.env.NODE_ENV || 'development';
    this.isProduction = env === 'production' || env === 'test';

    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel];
    }
  }

  /**
   * Sets the log level.
   * @param level - The log level to set.
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  private formatObject(obj: any): string {
    if (this.isProduction) {
      return JSON.stringify(obj);
    }
    return JSON.stringify(obj, null, 2);
  }

  /**
   * Extracts useful information from an Error object.
   * @param err - The error object.
   */
  private extractError(err: Error): any {
    return {
      ...err,
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
  }

  /**
   * Core logging function.
   * @param level - The log level.
   * @param args - Log arguments (can be an object followed by a message).
   */
  private log(level: LogLevel, ...args: any[]): void {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const label = LogLevelLabel[level];

    let obj: any = null;
    let msg = '';

    if (args.length > 0) {
      if (args[0] instanceof Error) {
        obj = { err: this.extractError(args[0]) };
        msg = args.slice(1).join(' ') || args[0].message;
      } else if (typeof args[0] === 'object' && args[0] !== null) {
        obj = args[0];
        msg = args.slice(1).join(' ');
      } else {
        msg = args.join(' ');
      }
    }

    if (this.isProduction) {
      const output = {
        time: Date.now(),
        level,
        msg,
        ...(obj || {}),
      };
      process.stdout.write(JSON.stringify(output) + '\n');
    } else {
      const color = LogLevelColor[level];
      const colorLabel = `${color}${label}${RESET_COLOR}`;
      process.stdout.write(`[${timestamp}] ${colorLabel}: ${msg}\n`);
      if (obj) {
        process.stdout.write(`${this.formatObject(obj)}\n`);
      }
    }
  }

  /**
   * Log at TRACE level.
   */
  public trace(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.TRACE, objOrMsg, ...args);
  }

  /**
   * Log at DEBUG level.
   */
  public debug(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.DEBUG, objOrMsg, ...args);
  }

  /**
   * Log at INFO level.
   */
  public info(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.INFO, objOrMsg, ...args);
  }

  /**
   * Log at WARN level.
   */
  public warn(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.WARN, objOrMsg, ...args);
  }

  /**
   * Log at ERROR level.
   */
  public error(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.ERROR, objOrMsg, ...args);
  }

  /**
   * Log at FATAL level.
   */
  public fatal(objOrMsg: any, ...args: any[]): void {
    this.log(LogLevel.FATAL, objOrMsg, ...args);
  }
}

export const logger = new Logger();
