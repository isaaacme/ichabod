import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import net from 'net';
import { findAvailablePort, checkPortFree } from '../lib/port.js';

describe('port.js', () => {
  describe('checkPortFree', () => {
    it('should resolve when port is available', async () => {
      // Use a high random port unlikely to be in use
      const testPort = 54321;
      await assert.doesNotReject(checkPortFree(testPort));
    });

    it('should reject when port is in use', async () => {
      const testPort = 54322;
      
      // Create a server to occupy the port
      const server = net.createServer();
      await new Promise(resolve => server.listen(testPort, '127.0.0.1', resolve));
      
      try {
        await assert.rejects(
          checkPortFree(testPort),
          /Port \d+ is in use/
        );
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    });
  });

  describe('findAvailablePort', () => {
    it('should return the start port when available', async () => {
      const testPort = 54323;
      const port = await findAvailablePort(testPort, 1);
      assert.strictEqual(port, testPort);
    });

    it('should find next available port when start port is in use', async () => {
      const testPort = 54324;
      
      // Occupy the first port
      const server = net.createServer();
      await new Promise(resolve => server.listen(testPort, '127.0.0.1', resolve));
      
      try {
        const port = await findAvailablePort(testPort, 5);
        assert.strictEqual(port, testPort + 1);
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    });

    it('should reject after max attempts', async () => {
      // Start with a port that's likely in use (22 for SSH, or 80/443)
      // but we'll mock by occupying consecutive ports
      const basePort = 54330;
      const servers = [];
      
      // Occupy 3 consecutive ports
      for (let i = 0; i < 3; i++) {
        const server = net.createServer();
        await new Promise(resolve => server.listen(basePort + i, '127.0.0.1', resolve));
        servers.push(server);
      }
      
      try {
        await assert.rejects(
          findAvailablePort(basePort, 3),
          /Could not find an available port/
        );
      } finally {
        for (const server of servers) {
          await new Promise(resolve => server.close(resolve));
        }
      }
    });
  });
});
