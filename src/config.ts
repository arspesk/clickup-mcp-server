/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Configuration handling for ClickUp API credentials and application settings
 *
 * The required environment variables (CLICKUP_API_KEY and CLICKUP_TEAM_ID) are passed
 * securely to this file when running the hosted server at smithery.ai. Optionally,
 * they can be parsed via command line arguments when running the server locally.
 *
 * Document support can be toggled via the `DOCUMENT_SUPPORT` environment
 * variable or command line argument. By default the feature is enabled.
 * Set the value to 'false' (string) to disable document tools when launching
 * the server.
*/

// Parse any command line environment arguments
const args = process.argv.slice(2);
const envArgs: { [key: string]: string } = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && i + 1 < args.length) {
    const [key, value] = args[i + 1].split('=');
    if (key === 'CLICKUP_API_KEY') envArgs.clickupApiKey = value;
    if (key === 'CLICKUP_TEAM_ID') envArgs.clickupTeamId = value;
    if (key === 'DOCUMENT_SUPPORT') envArgs.documentSupport = value;
    if (key === 'DOCUMENT_MODEL') envArgs.documentSupport = value; // Backward compatibility
    if (key === 'DOCUMENT_MODULE') envArgs.documentSupport = value; // Backward compatibility
    if (key === 'LOG_LEVEL') envArgs.logLevel = value;
    if (key === 'DISABLED_TOOLS') envArgs.disabledTools = value;
    if (key === 'DISABLED_COMMANDS') envArgs.disabledTools = value; // Backward compatibility
    if (key === 'ENABLE_SSE') envArgs.enableSSE = value;
    if (key === 'PORT') envArgs.port = value;
    i++;
  }
}

// Log levels enum
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

// Parse LOG_LEVEL string to LogLevel enum
export const parseLogLevel = (levelStr: string | undefined): LogLevel => {
  if (!levelStr) return LogLevel.ERROR; // Default to ERROR if not specified

  switch (levelStr.toUpperCase()) {
    case 'TRACE':
      return LogLevel.TRACE;
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      // Don't use console.error as it interferes with JSON-RPC communication
      return LogLevel.ERROR;
  }
};

// Define required configuration interface
interface Config {
  clickupApiKey: string;
  clickupTeamId: string;
  enableSponsorMessage: boolean;
  documentSupport: string;
  logLevel: LogLevel;
  disabledTools: string[];
  enableSSE: boolean;
  port?: string;
}

// Load configuration from command line args or environment variables
const configuration: Config = {
  clickupApiKey: envArgs.clickupApiKey || process.env.CLICKUP_API_KEY || '',
  clickupTeamId: envArgs.clickupTeamId || process.env.CLICKUP_TEAM_ID || '',
  enableSponsorMessage: process.env.ENABLE_SPONSOR_MESSAGE !== 'false',
  documentSupport:
    envArgs.documentSupport ||
    process.env.DOCUMENT_SUPPORT ||
    process.env.DOCUMENT_MODULE ||
    process.env.DOCUMENT_MODEL ||
    'true',
  logLevel: parseLogLevel(envArgs.logLevel || process.env.LOG_LEVEL),
  disabledTools:
    (envArgs.disabledTools || process.env.DISABLED_TOOLS || process.env.DISABLED_COMMANDS)
      ?.split(',')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd !== '') || [],
  enableSSE: envArgs.enableSSE === 'true' || process.env.ENABLE_SSE === 'true' || false,
  port: envArgs.port || process.env.PORT || '3231',
};

// Don't log to console as it interferes with JSON-RPC communication

// Validate only the required variables are present
const requiredVars = ['clickupApiKey', 'clickupTeamId'];
const missingEnvVars = requiredVars
  .filter(key => !configuration[key as keyof Config])
  .map(key => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default configuration;
