import { createServer } from "node:http";
import { styleText } from "node:util";

import { worker } from './worker';

const HEALTH_TIMEOUT_MINUTES = 15;

const server = createServer((_req, res) => {
  // calculate the time since last worker poll
  const minutesSinceLastPoll = (Date.now() - worker.lastPollAt.valueOf()) / 1000 / 60;

  // if the worker hasn't polled for a job in too long, report unhealthy
  if (minutesSinceLastPoll > HEALTH_TIMEOUT_MINUTES) {
    res.writeHead(503);
    res.end('DOWN');
  } else {
    res.writeHead(200);
    res.end('UP');
  }
});

export const healthServer = {
  close() {
    server.close();
  },

  start() {
    return new Promise<void>((resolve) => {
      server.listen(process.env.HEALTH_PORT, undefined, () => {
        const address = server.address();
        const url =
          typeof address === 'string'
            ? address
            : address
              ? `http://localhost:${address.port}`
              : 'unknown';

              console.log(`Health Server running on ${styleText("blue", url)}`);

        resolve();
      });
    });
  },
};
