#!/usr/bin/env node

/**
 * Development Watch Mode
 * Auto-validate and hot-reload on file changes
 * 
 * Usage:
 *   node scripts/dev-watch.mjs              # Watch all files
 *   node scripts/dev-watch.mjs --content    # Watch content files only
 *   node scripts/dev-watch.mjs --no-notify  # Disable toast notifications
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import http from 'http';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    content: false,
    schemas: false,
    html: false,
    notify: true,
    port: 3002,
    help: false
  };

  for (const arg of args) {
    if (arg === '--content') options.content = true;
    if (arg === '--schemas') options.schemas = true;
    if (arg === '--html') options.html = true;
    if (arg === '--no-notify') options.notify = false;
    if (arg.startsWith('--port=')) options.port = parseInt(arg.split('=')[1], 10);
    if (arg === '--help' || arg === '-h') options.help = true;
  }

  // If no specific type, watch all
  if (!options.content && !options.schemas && !options.html) {
    options.content = true;
    options.schemas = true;
    options.html = true;
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Development Watch Mode', colors.bold, colors.cyan)}

Auto-validate and hot-reload on file changes.

${color('Usage:', colors.bold)}
  node scripts/dev-watch.mjs [options]

${color('Options:', colors.bold)}
  --content     Watch content JSON files
  --schemas     Watch schema files
  --html        Watch HTML files
  --no-notify   Disable browser notifications
  --port=PORT   WebSocket port (default: 3002)
  --help, -h    Show this help message

${color('Examples:', colors.bold)}
  npm run dev:watch                    # Watch all files
  npm run dev:watch -- --content       # Content only
  npm run dev:watch -- --no-notify     # No notifications
`);
}

// Watch configuration
const WATCH_CONFIG = {
  content: {
    paths: ['src/content', 'src/data'],
    extensions: ['.json'],
    validator: 'validate-all.mjs',
    validatorArgs: ['--content']
  },
  schemas: {
    paths: ['src/data/schemas', 'src/content/schema'],
    extensions: ['.json'],
    validator: 'validate-all.mjs',
    validatorArgs: ['--schemas']
  },
  html: {
    paths: ['src/pages'],
    extensions: ['.html'],
    validator: 'validate-all.mjs',
    validatorArgs: ['--html']
  }
};

// WebSocket clients for hot reload
const wsClients = new Set();
let wsServer = null;

// Debounce map
const debounceTimers = new Map();

// Stats
const stats = {
  filesWatched: 0,
  validationsRun: 0,
  errorsFound: 0,
  startTime: Date.now()
};

/**
 * Simple file watcher using fs.watch with polling fallback
 */
class FileWatcher {
  constructor(dir, options = {}) {
    this.dir = dir;
    this.extensions = options.extensions || [];
    this.onChange = options.onChange || (() => {});
    this.watchers = new Map();
    this.watching = false;
  }

  async start() {
    this.watching = true;
    await this.watchDirectory(this.dir);
  }

  async watchDirectory(dir) {
    if (!this.watching) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await this.watchDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.extensions.length === 0 || this.extensions.includes(ext)) {
            this.watchFile(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or not accessible
    }
  }

  watchFile(filePath) {
    if (this.watchers.has(filePath)) return;

    try {
      const watcher = fs.watch(filePath, { persistent: false }, (eventType) => {
        if (eventType === 'change') {
          this.onChange(filePath);
        }
      });

      watcher.on('error', () => {
        this.watchers.delete(filePath);
      });

      this.watchers.set(filePath, watcher);
      stats.filesWatched++;
    } catch {
      // File watch failed
    }
  }

  stop() {
    this.watching = false;
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }
}

/**
 * Run validation on changed file
 */
async function runValidation(type, filePath) {
  const config = WATCH_CONFIG[type];
  if (!config) return;

  console.log(color(`   🔍 Validating ${path.relative(rootDir, filePath)}...`, colors.dim));
  stats.validationsRun++;

  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, config.validator);
    const args = [...config.validatorArgs, `--file=${filePath}`];

    const proc = spawn('node', [scriptPath, ...args], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    let hasError = false;

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
      hasError = true;
    });

    proc.on('close', (code) => {
      const success = code === 0;
      
      if (success) {
        console.log(color(`   ✅ Valid`, colors.green));
      } else {
        console.log(color(`   ❌ Validation errors:`, colors.red));
        // Print first few lines of error
        const lines = output.split('\n').filter(l => l.includes('Error') || l.includes('✗'));
        lines.slice(0, 5).forEach(line => {
          console.log(color(`      ${line.trim()}`, colors.red));
        });
        stats.errorsFound++;
      }

      // Send to browser
      broadcastToClients({
        type: success ? 'validation-pass' : 'validation-fail',
        file: path.relative(rootDir, filePath),
        errors: success ? [] : output.split('\n').slice(0, 5)
      });

      resolve({ success, output });
    });

    // Timeout after 30s
    setTimeout(() => {
      proc.kill();
      resolve({ success: false, output: 'Validation timed out' });
    }, 30000);
  });
}

/**
 * Handle file change with debouncing
 */
function handleFileChange(type, filePath) {
  const key = `${type}:${filePath}`;
  
  // Clear existing timer
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key));
  }

  // Set new timer
  debounceTimers.set(key, setTimeout(async () => {
    debounceTimers.delete(key);
    
    const relativePath = path.relative(rootDir, filePath);
    console.log(`\n${color('📁 File changed:', colors.cyan)} ${relativePath}`);
    console.log(color(`   Type: ${type}`, colors.dim));
    
    await runValidation(type, filePath);
  }, 300)); // 300ms debounce
}

/**
 * Start WebSocket server for hot reload
 */
function startWebSocketServer(port) {
  wsServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Dev Watch WebSocket Server');
  });

  wsServer.on('upgrade', (req, socket) => {
    // Simple WebSocket handshake
    const key = req.headers['sec-websocket-key'];
    const hash = crypto
      .createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${hash}\r\n\r\n`
    );

    wsClients.add(socket);
    
    socket.on('close', () => {
      wsClients.delete(socket);
    });

    socket.on('error', () => {
      wsClients.delete(socket);
    });
  });

  wsServer.listen(port, () => {
    console.log(color(`   WebSocket: ws://localhost:${port}`, colors.dim));
  });
}

/**
 * Encode a WebSocket frame with proper length handling
 */
function encodeWebSocketFrame(message) {
  const payload = Buffer.from(message);
  const length = payload.length;
  
  let header;
  if (length <= 125) {
    // Short messages: 2-byte header
    header = Buffer.alloc(2);
    header[0] = 0x81; // text frame, FIN bit set
    header[1] = length;
  } else if (length <= 65535) {
    // Medium messages: 4-byte header (126 + 2 bytes for length)
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    // Large messages: 10-byte header (127 + 8 bytes for length)
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  
  return Buffer.concat([header, payload]);
}

/**
 * Broadcast message to all WebSocket clients
 */
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  const frame = encodeWebSocketFrame(message);

  for (const client of wsClients) {
    try {
      client.write(frame);
    } catch {
      wsClients.delete(client);
    }
  }
}

/**
 * Format uptime
 */
function formatUptime() {
  const seconds = Math.floor((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log(`\n${color('═'.repeat(50), colors.cyan)}`);
  console.log(color('  Development Watch Mode', colors.bold, colors.cyan));
  console.log(`${color('═'.repeat(50), colors.cyan)}\n`);

  // Start WebSocket server
  if (options.notify) {
    startWebSocketServer(options.port);
  }

  // Create watchers
  const watchers = [];

  for (const [type, config] of Object.entries(WATCH_CONFIG)) {
    if (!options[type]) continue;

    console.log(color(`📂 Watching ${type}:`, colors.yellow));
    
    for (const watchPath of config.paths) {
      const fullPath = path.join(rootDir, watchPath);
      console.log(color(`   ${watchPath}`, colors.dim));

      const watcher = new FileWatcher(fullPath, {
        extensions: config.extensions,
        onChange: (filePath) => handleFileChange(type, filePath)
      });

      await watcher.start();
      watchers.push(watcher);
    }
  }

  console.log(`\n${color('✅ Ready', colors.green)} - Watching ${stats.filesWatched} files`);
  console.log(color('   Press Ctrl+C to stop\n', colors.dim));

  // Status update every 60 seconds
  const statusInterval = setInterval(() => {
    console.log(color(`\n📊 Status: ${formatUptime()} uptime | ${stats.validationsRun} validations | ${stats.errorsFound} errors`, colors.dim));
  }, 60000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(color('\n\n👋 Stopping watch mode...', colors.yellow));
    
    clearInterval(statusInterval);
    watchers.forEach(w => w.stop());
    
    if (wsServer) {
      wsServer.close();
    }

    console.log(`\n${color('📊 Session Summary:', colors.cyan)}`);
    console.log(`   Duration: ${formatUptime()}`);
    console.log(`   Files watched: ${stats.filesWatched}`);
    console.log(`   Validations: ${stats.validationsRun}`);
    console.log(`   Errors found: ${stats.errorsFound}\n`);

    process.exit(0);
  });
}

main().catch(error => {
  console.error(color(`Fatal error: ${error.message}`, colors.red));
  process.exit(1);
});
