import * as Sentry from '@sentry/nestjs';
import { capitalize } from 'lodash';

const profilingIntegration = () => {
  if (process.env.SENTRY_ENABLE_PROFILING !== '1') {
    return [];
  }

  try {
    // Keep this lazy: @sentry/profiling-node loads a platform native binary.
    // Missing optional binaries should not prevent the API from booting.
    const { nodeProfilingIntegration } = require('@sentry/profiling-node');
    return [nodeProfilingIntegration()];
  } catch (err: any) {
    console.warn(
      `Sentry profiling disabled: ${err?.message || 'native profiler unavailable'}`
    );
    return [];
  }
};

export const initializeSentry = (appName: string, allowLogs = false) => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return null;
  }

  try {
    const profiling = profilingIntegration();
    Sentry.init({
      initialScope: {
        tags: {
          service: appName,
          component: 'nestjs',
        },
        contexts: {
          app: {
            name: `Postiz ${capitalize(appName)}`,
          },
        },
      },
      environment: process.env.NODE_ENV || 'development',
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      spotlight: process.env.SENTRY_SPOTLIGHT === '1',
      integrations: [
        ...profiling,
        Sentry.consoleLoggingIntegration({ levels: ['log', 'info', 'warn', 'error', 'debug', 'assert', 'trace'] }),
        Sentry.openAIIntegration({
          recordInputs: true,
          recordOutputs: true,
        }),
      ],
      tracesSampleRate: 1.0,
      enableLogs: true,

      // Profiling
      profileSessionSampleRate:
        profiling.length > 0
          ? process.env.NODE_ENV === 'development'
            ? 1.0
            : 0.45
          : 0,
      profileLifecycle: 'trace',
    });
  } catch (err) {
    console.log(err);
  }
  return true;
};
