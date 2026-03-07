import './load-env';
import { startManualJob } from './execute-job';
import { healthServer } from './health-server';
import { registerCronJobs } from './jobs/cron';
import { worker } from './worker';

const jobType = process.argv[2];

async function main() {
  await healthServer.start();

  if (jobType) {
    // start a single manual job
    try {
      await startManualJob(jobType);
    } finally {
      healthServer.close();
    }

    return;
  }

  // register cron jobs and start the worker loop
  await registerCronJobs();
  worker.start();
}

void main().catch((error) => {
  console.error('Failed to start worker');
  console.error(error);
  process.exit(1);
});

// shutdown handling

let isShuttingDown = false;

function handleShutdown() {
  if (isShuttingDown) {
    console.log('Forcing shutdown');
    process.exit(1);
  }

  isShuttingDown = true;

  console.log('Gracefully shutting down...');
  worker.shutdown();
  healthServer.close();
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (error, promise) => {
  console.error('Unhandled rejection');
  console.error(promise);
  console.error(error);
  process.exit(1);
});
