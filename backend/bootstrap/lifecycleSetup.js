const http = require('http');

function createServer(app) {
  return http.createServer(app);
}

function waitForActiveRequests(server, timeoutMs = 30_000) {
  const started = Date.now();

  return new Promise((resolve) => {
    function poll() {
      server.getConnections((err, count) => {
        if (err) {
          resolve();
          return;
        }

        if (count === 0 || Date.now() - started >= timeoutMs) {
          resolve();
          return;
        }

        setTimeout(poll, 200);
      });
    }

    poll();
  });
}

function registerShutdownHandlers(server, { logger = console, timeoutMs = 30_000 } = {}) {
  let shuttingDown = false;

  const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info?.(`Received ${signal}, starting graceful shutdown...`);

    server.close();

    await Promise.race([
      waitForActiveRequests(server, timeoutMs),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);

    logger.info?.('Shutdown sequence completed.');
    process.exit(exitCode);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
  process.on('SIGINT', () => shutdown('SIGINT', 0));
  process.on('uncaughtException', (error) => {
    logger.error?.('uncaughtException caught', { error: error.message, stack: error.stack });
    shutdown('uncaughtException', 1);
  });
}

module.exports = {
  createServer,
  registerShutdownHandlers,
  waitForActiveRequests,
};
