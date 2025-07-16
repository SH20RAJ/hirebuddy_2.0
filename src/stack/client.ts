import { StackClientApp } from "@stackframe/js";

// Validate Stack Auth configuration
const stackPublishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_KEY;

if (!stackPublishableKey) {
  console.error('Stack Auth publishable key not configured. Please add VITE_STACK_PUBLISHABLE_KEY to your environment variables.');
  // Throw an error in production to prevent app from running with missing credentials
  if (import.meta.env.PROD) {
    throw new Error('Stack Auth configuration missing. Please configure VITE_STACK_PUBLISHABLE_KEY.');
  }
}

export const stackClientApp = new StackClientApp({
  tokenStore: "cookie",
  publishableClientKey: stackPublishableKey || 'development-placeholder',
});
