/**
 * Process Utilities
 * Provides process management, cleanup, and timeout handling for scripts
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Track active child processes for cleanup
const activeProcesses = new Set();

// Cleanup handlers
const cleanupHandlers = [];

/**
 * Register a cleanup handler to run on process exit
 * @param {Function} handler - Async function to run on cleanup
 */
export function registerCleanup(handler) {
  cleanupHandlers.push(handler);
}

/**
 * Run all cleanup handlers
 */
async function runCleanup() {
  console.log('\n  Cleaning up...');
  
  // Kill all active child processes
  for (const proc of activeProcesses) {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
        // Give it a moment, then force kill
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
        }, 1000);
      }
    } catch {
      // Process already dead
    }
  }
  activeProcesses.clear();
  
  // Run custom cleanup handlers
  for (const handler of cleanupHandlers) {
    try {
      await handler();
    } catch (error) {
      console.error(`  Cleanup error: ${error.message}`);
    }
  }
}

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown() {
  let isShuttingDown = false;
  
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`\n  Received ${signal}, shutting down gracefully...`);
    await runCleanup();
    process.exit(0);
  };
  
  // Handle different signals
  process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
  process.on('SIGTERM', () => shutdown('SIGTERM')); // Kill command
  process.on('SIGHUP', () => shutdown('SIGHUP'));   // Terminal closed
  
  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    console.error('\n  Uncaught exception:', error.message);
    await runCleanup();
    process.exit(1);
  });
  
  process.on('unhandledRejection', async (reason) => {
    console.error('\n  Unhandled rejection:', reason);
    await runCleanup();
    process.exit(1);
  });
}

/**
 * Run a command with timeout
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {Object} options - Options
 * @param {number} options.timeout - Timeout in milliseconds (default 60000)
 * @param {string} options.cwd - Working directory
 * @param {boolean} options.captureOutput - Whether to capture stdout/stderr
 * @param {Function} options.onData - Callback for output data
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
export function runWithTimeout(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const {
      timeout = 60000,
      cwd = rootDir,
      captureOutput = true,
      onData = null,
      env = process.env
    } = options;
    
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    
    const proc = spawn(command, args, {
      cwd,
      env: { ...env, FORCE_COLOR: '0' },
      shell: true
    });
    
    // Track the process for cleanup
    activeProcesses.add(proc);
    
    // Setup timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      }, 5000);
    }, timeout);
    
    if (captureOutput) {
      proc.stdout?.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (onData) onData('stdout', text);
      });
      
      proc.stderr?.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (onData) onData('stderr', text);
      });
    } else {
      proc.stdout?.pipe(process.stdout);
      proc.stderr?.pipe(process.stderr);
    }
    
    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      activeProcesses.delete(proc);
      
      if (timedOut) {
        reject(new Error(`Command timed out after ${timeout}ms: ${command} ${args.join(' ')}`));
      } else {
        resolve({ stdout, stderr, exitCode: code });
      }
    });
    
    proc.on('error', (error) => {
      clearTimeout(timeoutId);
      activeProcesses.delete(proc);
      reject(error);
    });
  });
}

/**
 * Run a command and stream output
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {Object} options - Options
 * @returns {Promise<number>} Exit code
 */
export function runStreaming(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const { cwd = rootDir, timeout = 0 } = options;
    
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    activeProcesses.add(proc);
    
    let timeoutId;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
    }
    
    proc.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      activeProcesses.delete(proc);
      resolve(code);
    });
    
    proc.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      activeProcesses.delete(proc);
      reject(error);
    });
  });
}

/**
 * Run multiple commands in sequence with error handling
 * @param {Array<{ command: string, args?: string[], options?: Object }>} commands
 * @param {Object} options - Global options
 * @param {boolean} options.stopOnError - Stop on first error (default true)
 * @param {Function} options.onProgress - Progress callback (index, total, command)
 * @returns {Promise<Array<{ success: boolean, result?: any, error?: Error }>>}
 */
export async function runSequence(commands, options = {}) {
  const { stopOnError = true, onProgress = null } = options;
  const results = [];
  
  for (let i = 0; i < commands.length; i++) {
    const { command, args = [], options: cmdOptions = {} } = commands[i];
    
    if (onProgress) {
      onProgress(i, commands.length, command);
    }
    
    try {
      const result = await runWithTimeout(command, args, cmdOptions);
      results.push({ success: result.exitCode === 0, result });
      
      if (result.exitCode !== 0 && stopOnError) {
        break;
      }
    } catch (error) {
      results.push({ success: false, error });
      
      if (stopOnError) {
        break;
      }
    }
  }
  
  return results;
}

/**
 * Run multiple commands in parallel with concurrency limit
 * @param {Array<{ command: string, args?: string[], options?: Object }>} commands
 * @param {Object} options - Options
 * @param {number} options.concurrency - Max concurrent commands (default 3)
 * @param {Function} options.onComplete - Callback when each command completes
 * @returns {Promise<Array<{ success: boolean, result?: any, error?: Error }>>}
 */
export async function runParallel(commands, options = {}) {
  const { concurrency = 3, onComplete = null } = options;
  const results = new Array(commands.length);
  let completed = 0;
  
  async function worker(index) {
    const { command, args = [], options: cmdOptions = {} } = commands[index];
    
    try {
      const result = await runWithTimeout(command, args, cmdOptions);
      results[index] = { success: result.exitCode === 0, result };
    } catch (error) {
      results[index] = { success: false, error };
    }
    
    completed++;
    if (onComplete) {
      onComplete(index, completed, commands.length);
    }
  }
  
  // Process commands in batches
  const indices = [...Array(commands.length).keys()];
  
  while (indices.length > 0) {
    const batch = indices.splice(0, concurrency);
    await Promise.all(batch.map(worker));
  }
  
  return results;
}

/**
 * Check if a command exists
 * @param {string} command - Command to check
 * @returns {boolean}
 */
export function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for a condition with timeout
 * @param {Function} condition - Async function returning boolean
 * @param {Object} options - Options
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.interval - Check interval in milliseconds
 * @param {string} options.message - Error message on timeout
 * @returns {Promise<boolean>}
 */
export async function waitFor(condition, options = {}) {
  const {
    timeout = 30000,
    interval = 1000,
    message = 'Condition not met within timeout'
  } = options;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      if (await condition()) {
        return true;
      }
    } catch {
      // Condition threw, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(message);
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Options
 * @param {number} options.maxRetries - Maximum retries (default 3)
 * @param {number} options.baseDelay - Base delay in ms (default 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default 30000)
 * @param {Function} options.shouldRetry - Function to determine if error is retryable
 * @returns {Promise<any>}
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a progress reporter
 * @param {Object} options - Options
 * @param {number} options.total - Total steps
 * @param {string} options.label - Progress label
 * @param {boolean} options.json - Output as JSON
 * @returns {Object} Progress reporter
 */
export function createProgress(options = {}) {
  const { total = 100, label = 'Progress', json = false } = options;
  let current = 0;
  const startTime = Date.now();
  
  return {
    update(step, message = '') {
      current = step;
      const percent = Math.round((current / total) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (json) {
        console.log(JSON.stringify({ type: 'progress', step: current, total, percent, elapsed, message }));
      } else {
        console.log(`  [${current}/${total}] ${percent}% (${elapsed}s) ${message}`);
      }
    },
    
    increment(message = '') {
      this.update(current + 1, message);
    },
    
    complete(message = '') {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (json) {
        console.log(JSON.stringify({ type: 'complete', total, elapsed, message }));
      } else {
        console.log(`\n  ✓ ${label} complete (${elapsed}s)${message ? `: ${message}` : ''}\n`);
      }
    },
    
    error(message) {
      if (json) {
        console.log(JSON.stringify({ type: 'error', step: current, total, message }));
      } else {
        console.error(`\n  ✗ Error at step ${current}/${total}: ${message}\n`);
      }
    }
  };
}

export { rootDir };
