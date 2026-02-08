// src/services/logger.ts
// Serviço de logging estruturado

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  data?: Record<string, unknown>;
}

const formatLog = (entry: LogEntry): string => {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.action}`;
  if (entry.data) {
    return `${prefix} ${JSON.stringify(entry.data)}`;
  }
  return prefix;
};

const createLogEntry = (level: LogLevel, action: string, data?: Record<string, unknown>): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  action,
  data,
});

// Logging principal
export const Logger = {
  info: (action: string, data?: Record<string, unknown>) => {
    const entry = createLogEntry('info', action, data);
    console.log(formatLog(entry));
  },

  warn: (action: string, data?: Record<string, unknown>) => {
    const entry = createLogEntry('warn', action, data);
    console.warn(formatLog(entry));
  },

  error: (action: string, data?: Record<string, unknown>) => {
    const entry = createLogEntry('error', action, data);
    console.error(formatLog(entry));
  },

  debug: (action: string, data?: Record<string, unknown>) => {
    if (__DEV__) {
      const entry = createLogEntry('debug', action, data);
      console.log(formatLog(entry));
    }
  },

  // Ações específicas do app
  drink: (amount: number, total: number, goal: number) => {
    Logger.info('DRINK_ADDED', { amount, total, goal, percentage: Math.round((total / goal) * 100) });
  },

  undo: (amount: number, newTotal: number) => {
    Logger.info('DRINK_UNDONE', { amount, newTotal });
  },

  reset: (previousTotal: number) => {
    Logger.info('DAY_RESET', { previousTotal });
  },

  configSaved: (weight: number, goal: number) => {
    Logger.info('CONFIG_SAVED', { weight, goal });
  },

  streakUpdated: (oldStreak: number, newStreak: number, reason: string) => {
    Logger.info('STREAK_UPDATED', { oldStreak, newStreak, reason });
  },

  goalReached: (total: number, goal: number) => {
    Logger.info('GOAL_REACHED', { total, goal });
  },
};
