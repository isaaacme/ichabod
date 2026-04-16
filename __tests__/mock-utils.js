import { mock, fn } from 'node:test';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Track all HTTP requests made during tests
export const httpRequests = [];

// Mock responses storage
const mockResponses = new Map();

export function setMockResponse(urlPattern, response) {
  mockResponses.set(urlPattern, response);
}

export function clearMocks() {
  mockResponses.clear();
  httpRequests.length = 0;
}

// Create a mock fs structure for testing
export function createMockFs(structure, baseDir = '/tmp/test-project') {
  const files = new Map();
  
  function traverse(obj, currentPath) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path.join(currentPath, key);
      if (typeof value === 'string') {
        files.set(fullPath, value);
      } else {
        files.set(fullPath, null); // directory
        traverse(value, fullPath);
      }
    }
  }
  
  traverse(structure, baseDir);
  return { baseDir, files };
}

// Mock child_process.spawn for testing
export function createMockSpawn(exitCode = 0, delay = 10) {
  return fn((cmd, args, opts) => {
    const mockProcess = {
      pid: 12345,
      stdout: { on: fn(), pipe: fn() },
      stderr: { 
        on: fn((event, handler) => {
          if (event === 'data') {
            // Simulate no stderr output by default
          }
        })
      },
      on: fn((event, handler) => {
        if (event === 'error' || event === 'exit') {
          setTimeout(() => {
            if (event === 'exit') handler(exitCode);
          }, delay);
        }
      }),
      kill: fn((signal = 'SIGTERM') => {
        mockProcess.killed = true;
        return true;
      }),
      killed: false,
      cmd,
      args,
      opts
    };
    return mockProcess;
  });
}

// Mock HTTP server responses
export function createMockHttpServer(port, routes) {
  const server = {
    port,
    routes,
    requestCount: 0,
    lastRequest: null,
    
    handleRequest(reqUrl, method = 'GET', body = null) {
      this.requestCount++;
      this.lastRequest = { url: reqUrl, method, body };
      
      for (const [pattern, handler] of Object.entries(routes)) {
        if (reqUrl.includes(pattern)) {
          return handler(reqUrl, method, body);
        }
      }
      
      return { status: 404, body: { message: 'Not found' } };
    }
  };
  
  return server;
}

// Test assertion helpers
export function expectRequestMade(urlPattern, method = null) {
  const found = httpRequests.some(r => {
    const urlMatch = r.url.includes(urlPattern);
    const methodMatch = method ? r.method === method : true;
    return urlMatch && methodMatch;
  });
  
  if (!found) {
    throw new Error(`Expected request to ${urlPattern}${method ? ` (${method})` : ''} not found. Requests made: ${JSON.stringify(httpRequests)}`);
  }
  return true;
}

export function expectRequestCount(count) {
  if (httpRequests.length !== count) {
    throw new Error(`Expected ${count} requests, but ${httpRequests.length} were made`);
  }
  return true;
}
