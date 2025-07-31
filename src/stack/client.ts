import { StackClientApp } from "@stackframe/js";
import { getConfig } from '../config/environment';

// Validate Stack Auth configuration
const config = getConfig();
const stackPublishableKey = config.stack.publishableKey;

if (!stackPublishableKey) {
  console.error('Stack Auth publishable key not configured. Please add VITE_STACK_PUBLISHABLE_KEY to your environment variables.');
  // Throw an error in production to prevent app from running with missing credentials
  if (config.isProduction) {
    throw new Error('Stack Auth configuration missing. Please configure VITE_STACK_PUBLISHABLE_KEY.');
  }
}

export const stackClientApp = new StackClientApp({
  tokenStore: "cookie",
  publishableClientKey: stackPublishableKey || 'development-placeholder',
});
