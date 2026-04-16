import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.join(__dirname, '.test-setup');

describe('setup.js', () => {
  let httpRequests = [];
  let originalRequest = http.request;

  beforeEach(() => {
    httpRequests = [];
    http.request = originalRequest;
    
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  describe('getPbUrl', () => {
    it('should return correct URL with default port', async () => {
      const { getPbUrl, DEFAULT_PB_PORT } = await import('../lib/setup.js');
      const url = getPbUrl();
      assert.strictEqual(url, `http://127.0.0.1:${DEFAULT_PB_PORT}`);
    });

    it('should return correct URL with custom port', async () => {
      const { getPbUrl } = await import('../lib/setup.js');
      const url = getPbUrl(9999);
      assert.strictEqual(url, 'http://127.0.0.1:9999');
    });
  });

  describe('httpPost', () => {
    it('should send POST request with correct headers', async () => {
      const { httpPost } = await import('../lib/setup.js');
      
      let capturedOptions;
      let capturedData = '';
      
      http.request = (options, callback) => {
        capturedOptions = options;
        
        const mockResponse = {
          statusCode: 200,
          on: (event, handler) => {
            if (event === 'data') {
              setTimeout(() => handler(JSON.stringify({ token: 'test-token' })), 0);
            } else if (event === 'end') {
              setTimeout(() => handler(), 10);
            }
          }
        };
        
        setTimeout(() => callback(mockResponse), 0);
        
        return {
          on: () => {},
          write: (data) => { capturedData = data; },
          end: () => {}
        };
      };

      const result = await httpPost('http://127.0.0.1:8090/api/test', { foo: 'bar' }, 'test-token');
      
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.body.token, 'test-token');
      assert.strictEqual(capturedOptions?.method, 'POST');
      assert.strictEqual(capturedOptions?.headers?.Authorization, 'Bearer test-token');
      assert.strictEqual(JSON.parse(capturedData).foo, 'bar');
    });
  });

});
