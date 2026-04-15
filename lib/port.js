import net from 'net';

export function findAvailablePort(startPort = 8090, maxAttempts = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function tryPort(port) {
      const srv = net.createServer();
      srv.once('error', () => {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Could not find an available port'));
          return;
        }
        // Try next port (or random if we've tried a few sequential)
        const nextPort = attempts < 10 ? port + 1 : 1024 + Math.floor(Math.random() * 64000);
        tryPort(nextPort);
      });
      srv.once('listening', () => {
        srv.close(() => resolve(port));
      });
      srv.listen(port, '127.0.0.1');
    }
    
    tryPort(startPort);
  });
}

export function checkPortFree(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', () => reject(new Error(`Port ${port} is in use`)));
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}
