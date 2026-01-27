#!/usr/bin/env node

/**
 * Wizard API Server
 * Express server for project setup wizard with file upload, parsing, and generation
 * 
 * Usage:
 *   node scripts/wizard-server.mjs              # Start server on port 3001
 *   node scripts/wizard-server.mjs --port=3002  # Custom port
 *   node scripts/wizard-server.mjs --open       # Open browser automatically
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { validatePath, sanitizeFilename, RateLimiter } from './lib/security-utils.mjs';

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
  blue: '\x1b[34m'
};

function color(text, ...styles) {
  return styles.join('') + text + colors.reset;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: 3001,
    open: false,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--port=')) {
      options.port = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--open' || arg === '-o') {
      options.open = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${color('Wizard API Server', colors.bold, colors.cyan)}

Express server for project setup wizard.

${color('Usage:', colors.bold)}
  node scripts/wizard-server.mjs [options]

${color('Options:', colors.bold)}
  --port=PORT    Server port (default: 3001)
  --open, -o     Open browser automatically
  --help, -h     Show this help message
`);
}

// Configure multer for file uploads
const uploadsDir = path.join(rootDir, 'business-context/uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt|md|png|jpg|jpeg|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// Active SSE connections for progress updates
const sseClients = new Set();

// Rate limiter for AI API calls (10 requests per minute)
const aiRateLimiter = new RateLimiter(10, 60000);

// Progress tracking state
const progressState = {
  totalTokens: 0,
  totalCost: 0,
  startTime: null,
  steps: {}
};

// Reset progress state
function resetProgressState() {
  progressState.totalTokens = 0;
  progressState.totalCost = 0;
  progressState.startTime = Date.now();
  progressState.steps = {};
}

// Send progress update to all connected clients
function sendProgress(data) {
  // Track elapsed time
  if (progressState.startTime) {
    data.details = data.details || {};
    data.details.elapsed = Date.now() - progressState.startTime;
    data.details.tokens = progressState.totalTokens;
    data.details.cost = progressState.totalCost;
  }
  
  // Store step state
  if (data.step) {
    progressState.steps[data.step] = data;
  }
  
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
}

// Update token/cost tracking
function updateProgressStats(tokens, cost) {
  progressState.totalTokens += tokens || 0;
  progressState.totalCost += cost || 0;
}

// Run a script and stream progress
async function runScriptWithProgress(scriptPath, args = [], progressCallback) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath, ...args], {
      cwd: rootDir,
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      
      // Parse progress from output
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.includes('✓') || line.includes('✗') || line.includes('Progress:')) {
          progressCallback({ type: 'log', message: line.trim() });
        }
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Script exited with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', reject);
  });
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SSE endpoint for progress updates
app.get('/api/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Upload files
app.post('/api/upload', upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files.map(f => ({
      name: f.originalname,
      path: f.path,
      size: f.size,
      type: f.mimetype
    }));
    
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List uploaded files
app.get('/api/files', async (req, res) => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const files = await fs.readdir(uploadsDir);
    
    const fileList = await Promise.all(
      files.filter(f => !f.startsWith('.')).map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stat = await fs.stat(filePath);
        return {
          name: filename,
          path: filePath,
          size: stat.size,
          modified: stat.mtime
        };
      })
    );
    
    res.json({ files: fileList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
app.delete('/api/files/:filename', async (req, res) => {
  try {
    // Sanitize filename and validate path
    const safeFilename = sanitizeFilename(req.params.filename);
    if (!safeFilename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(uploadsDir, safeFilename);
    
    // Validate path is within uploads directory (prevent path traversal)
    const validation = validatePath(filePath, uploadsDir);
    if (!validation.valid) {
      console.log(`Security: Blocked path traversal attempt: ${req.params.filename}`);
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    await fs.unlink(validation.sanitized);
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Parse uploaded files
app.post('/api/parse', async (req, res) => {
  try {
    sendProgress({ step: 'parse', status: 'running', message: 'Parsing uploaded files...' });
    
    await runScriptWithProgress(
      path.join(__dirname, 'parse-uploads.mjs'),
      [],
      (progress) => sendProgress({ step: 'parse', ...progress })
    );
    
    // Read extracted context
    const extractedPath = path.join(rootDir, 'business-context/extracted-context.json');
    let extracted = {};
    try {
      const content = await fs.readFile(extractedPath, 'utf-8');
      extracted = JSON.parse(content);
    } catch {
      // No extracted content yet
    }
    
    sendProgress({ step: 'parse', status: 'completed', message: 'Files parsed successfully' });
    res.json({ success: true, extracted });
  } catch (error) {
    sendProgress({ step: 'parse', status: 'error', message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Save project settings
app.post('/api/settings', async (req, res) => {
  try {
    const { project, ai } = req.body;
    
    // Read existing settings
    const settingsPath = path.join(rootDir, 'project-settings.json');
    const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
    
    let settings = {};
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch {
      // Default settings
    }
    
    // Update project settings
    if (project) {
      settings.project = { ...settings.project, ...project };
    }
    
    // Write main settings (without API keys)
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    
    // Write local settings with API keys (gitignored)
    if (ai?.apiKeys) {
      let localSettings = {};
      try {
        const content = await fs.readFile(localSettingsPath, 'utf-8');
        localSettings = JSON.parse(content);
      } catch {
        // No local settings yet
      }
      
      localSettings.ai = {
        ...localSettings.ai,
        apiKeys: ai.apiKeys,
        preferences: ai.preferences || {}
      };
      
      await fs.writeFile(localSettingsPath, JSON.stringify(localSettings, null, 2), 'utf-8');
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project settings
app.get('/api/settings', async (req, res) => {
  try {
    const settingsPath = path.join(rootDir, 'project-settings.json');
    const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
    
    let settings = {};
    let localSettings = {};
    
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch {
      // No settings yet
    }
    
    try {
      const content = await fs.readFile(localSettingsPath, 'utf-8');
      localSettings = JSON.parse(content);
    } catch {
      // No local settings
    }
    
    // Merge settings (local takes precedence)
    const merged = { ...settings };
    if (localSettings.ai) {
      merged.ai = { ...settings.ai, ...localSettings.ai };
      // Mask API keys
      if (merged.ai.apiKeys) {
        merged.ai.apiKeysMasked = {};
        for (const [key, value] of Object.entries(merged.ai.apiKeys)) {
          merged.ai.apiKeysMasked[key] = value ? '••••••••' : '';
        }
      }
    }
    
    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test API connection
app.post('/api/test-connection', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    
    // Quick validation - just check if key has correct format
    let valid = false;
    let message = '';
    
    switch (provider) {
      case 'openai':
        valid = apiKey.startsWith('sk-') && apiKey.length > 20;
        message = valid ? 'OpenAI key format valid' : 'Invalid OpenAI key format';
        break;
      case 'anthropic':
        valid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
        message = valid ? 'Anthropic key format valid' : 'Invalid Anthropic key format';
        break;
      case 'google':
        valid = apiKey.length > 20;
        message = valid ? 'Google AI key format valid' : 'API key too short';
        break;
      default:
        valid = apiKey.length > 10;
        message = valid ? 'Key format appears valid' : 'API key too short';
    }
    
    res.json({ valid, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate all content
app.post('/api/generate', async (req, res) => {
  try {
    // Rate limiting for AI calls
    if (!aiRateLimiter.tryRequest()) {
      const waitTime = Math.ceil(aiRateLimiter.getWaitTime() / 1000);
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: `Please wait ${waitTime} seconds before trying again` 
      });
    }
    
    const { pages, options } = req.body;
    
    // Validate pages input
    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ error: 'Pages must be a non-empty array' });
    }
    
    // Sanitize page names
    const allowedPages = ['home', 'about', 'services', 'contact', 'pricing', 'portfolio', 'blog'];
    const validPages = pages.filter(p => typeof p === 'string' && allowedPages.includes(p.toLowerCase()));
    
    if (validPages.length === 0) {
      return res.status(400).json({ error: 'No valid pages specified' });
    }
    
    sendProgress({ step: 'generate', status: 'starting', message: 'Starting generation pipeline...' });
    
    // Run the generation pipeline
    await runScriptWithProgress(
      path.join(__dirname, 'generate-all.mjs'),
      ['--pages=' + validPages.join(','), '--json'],
      (progress) => sendProgress({ step: 'generate', ...progress })
    );
    
    sendProgress({ step: 'generate', status: 'completed', message: 'Generation complete!' });
    res.json({ success: true });
  } catch (error) {
    sendProgress({ step: 'generate', status: 'error', message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Run specific generation step
app.post('/api/generate/:step', async (req, res) => {
  try {
    const { step } = req.params;
    const { options } = req.body;
    
    let scriptPath;
    let args = [];
    
    switch (step) {
      case 'analyze':
        scriptPath = path.join(__dirname, 'analyze-business-context.mjs');
        break;
      case 'personas':
        scriptPath = path.join(__dirname, 'generate-personas.mjs');
        args = ['--apply'];
        break;
      case 'content':
        scriptPath = path.join(__dirname, 'generate-section-content.mjs');
        args = ['--apply'];
        if (options?.page) args.push(`--page=${options.page}`);
        break;
      case 'images':
        scriptPath = path.join(__dirname, 'generate-images.mjs');
        if (options?.force) args.push('--force');
        break;
      case 'pages':
        scriptPath = path.join(__dirname, 'generate-page.mjs');
        if (options?.pages) args.push(...options.pages);
        break;
      default:
        return res.status(400).json({ error: `Unknown step: ${step}` });
    }
    
    sendProgress({ step, status: 'running', message: `Running ${step}...` });
    
    await runScriptWithProgress(scriptPath, args, (progress) => {
      sendProgress({ step, ...progress });
    });
    
    sendProgress({ step, status: 'completed', message: `${step} complete` });
    res.json({ success: true });
  } catch (error) {
    sendProgress({ step: req.params.step, status: 'error', message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Check gaps
app.get('/api/gaps', async (req, res) => {
  try {
    const { stdout } = await runScriptWithProgress(
      path.join(__dirname, 'check-gaps.mjs'),
      ['--json'],
      () => {}
    );
    
    // Parse JSON from output
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const gaps = JSON.parse(jsonMatch[0]);
      res.json(gaps);
    } else {
      res.json({ content: [], images: [], placeholders: [], errors: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run validation
app.post('/api/validate', async (req, res) => {
  try {
    sendProgress({ step: 'validate', status: 'running', message: 'Running validation...' });
    
    const { stdout } = await runScriptWithProgress(
      path.join(__dirname, 'validate-all.mjs'),
      ['--verbose'],
      (progress) => sendProgress({ step: 'validate', ...progress })
    );
    
    // Parse results from output
    const results = {
      passed: 0,
      warnings: 0,
      errors: 0,
      details: []
    };
    
    const passedMatch = stdout.match(/Passed:\s*(\d+)/);
    const warningsMatch = stdout.match(/Warnings:\s*(\d+)/);
    const errorsMatch = stdout.match(/Failed:\s*(\d+)/);
    
    if (passedMatch) results.passed = parseInt(passedMatch[1], 10);
    if (warningsMatch) results.warnings = parseInt(warningsMatch[1], 10);
    if (errorsMatch) results.errors = parseInt(errorsMatch[1], 10);
    
    sendProgress({ step: 'validate', status: 'completed', message: 'Validation complete' });
    res.json(results);
  } catch (error) {
    sendProgress({ step: 'validate', status: 'error', message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get page status
app.get('/api/pages', async (req, res) => {
  try {
    const pagesDir = path.join(rootDir, 'src/pages');
    const contentDir = path.join(rootDir, 'src/content/en');
    const generatedDir = path.join(rootDir, 'src/assets/generated');
    
    // Get main pages (not subdirectories)
    const pageFiles = ['index.html', 'about.html', 'services.html', 'contact.html', 'pricing.html', 'portfolio.html', 'blog.html'];
    
    const pages = await Promise.all(
      pageFiles.map(async (filename) => {
        const pageName = filename.replace('.html', '');
        const pagePath = path.join(pagesDir, filename);
        const contentPath = path.join(contentDir, `${pageName === 'index' ? 'home' : pageName}.json`);
        
        let exists = false;
        let hasContent = false;
        let hasImages = false;
        
        try {
          await fs.access(pagePath);
          exists = true;
        } catch {
          // Page doesn't exist
        }
        
        try {
          await fs.access(contentPath);
          hasContent = true;
        } catch {
          // Content doesn't exist
        }
        
        // Check for images (simplified check)
        try {
          const files = await fs.readdir(generatedDir);
          hasImages = files.some(f => f.toLowerCase().includes(pageName));
        } catch {
          // No generated dir
        }
        
        return {
          name: pageName === 'index' ? 'homepage' : pageName,
          path: `/pages/${filename}`,
          exists,
          hasContent,
          hasImages,
          status: exists && hasContent ? (hasImages ? 'complete' : 'in-progress') : 'not-started'
        };
      })
    );
    
    res.json({ pages: pages.filter(p => p.exists || p.hasContent) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content for a page
app.get('/api/content/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    // Validate page name (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(page)) {
      return res.status(400).json({ error: 'Invalid page name' });
    }
    
    const contentDir = path.join(rootDir, 'src/content/en');
    const contentPath = path.join(contentDir, `${page}.json`);
    
    // Validate path is within content directory
    const validation = validatePath(contentPath, contentDir);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid page path' });
    }
    
    const content = await fs.readFile(validation.sanitized, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Content not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Save content for a page
app.put('/api/content/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    // Validate page name (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(page)) {
      return res.status(400).json({ error: 'Invalid page name' });
    }
    
    // Validate request body is an object
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Content must be a JSON object' });
    }
    
    const contentDir = path.join(rootDir, 'src/content/en');
    const contentPath = path.join(contentDir, `${page}.json`);
    
    // Validate path is within content directory
    const validation = validatePath(contentPath, contentDir);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid page path' });
    }
    
    await fs.writeFile(validation.sanitized, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get extracted context
app.get('/api/extracted', async (req, res) => {
  try {
    const extractedPath = path.join(rootDir, 'business-context/extracted-context.json');
    const content = await fs.readFile(extractedPath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({});
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get project status
app.get('/api/status', async (req, res) => {
  try {
    const statusPath = path.join(rootDir, 'src/data/project-status.json');
    const content = await fs.readFile(statusPath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ overallProgress: 0, phases: [] });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Deploy to Vercel
app.post('/api/deploy', async (req, res) => {
  try {
    // Check prerequisites
    const { execSync } = await import('child_process');
    
    // Check for gh CLI
    try {
      execSync('gh --version', { stdio: 'pipe' });
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'GitHub CLI (gh) not installed',
        message: 'Install with: brew install gh && gh auth login'
      });
    }
    
    // Check for vercel CLI
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'Vercel CLI not installed',
        message: 'Install with: npm i -g vercel && vercel login'
      });
    }
    
    // Run deployment script
    console.log(color('\n  Starting deployment...', colors.cyan));
    
    return new Promise((resolve) => {
      const deployProcess = spawn('node', ['scripts/deploy-vercel.mjs', '--force'], {
        cwd: rootDir,
        stdio: 'pipe',
        shell: true
      });
      
      let output = '';
      let deployUrl = null;
      
      deployProcess.stdout?.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
        
        // Try to extract URL from output
        const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
          deployUrl = urlMatch[0];
        }
      });
      
      deployProcess.stderr?.on('data', (data) => {
        console.error(data.toString());
      });
      
      deployProcess.on('close', async (code) => {
        if (code === 0) {
          // Try to get URL from settings
          if (!deployUrl) {
            try {
              const localSettingsPath = path.join(rootDir, 'project-settings.local.json');
              const settings = JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
              deployUrl = settings.deployment?.vercel?.url;
            } catch {}
          }
          
          res.json({ 
            success: true, 
            url: deployUrl,
            message: 'Deployment completed successfully'
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: 'Deployment failed',
            message: 'Check terminal output for details'
          });
        }
        resolve();
      });
    });
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Main server startup
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });
  
  app.listen(options.port, () => {
    console.log(`
${color('═'.repeat(50), colors.cyan)}
${color('  Wizard API Server', colors.bold, colors.cyan)}
${color('═'.repeat(50), colors.cyan)}

  Server running at: ${color(`http://localhost:${options.port}`, colors.green)}
  
  API Endpoints:
    POST /api/upload        Upload files
    GET  /api/files         List uploaded files
    POST /api/parse         Parse uploaded files
    POST /api/settings      Save project settings
    GET  /api/settings      Get project settings
    POST /api/generate      Run full generation pipeline
    POST /api/deploy        Deploy to Vercel
    GET  /api/gaps          Check for content gaps
    POST /api/validate      Run validation
    GET  /api/pages         Get page status
    GET  /api/progress      SSE progress stream

  Press Ctrl+C to stop
`);
    
    if (options.open) {
      import('open').then(({ default: open }) => {
        open(`http://localhost:5173/pages/wizard/`);
      }).catch(() => {
        console.log(color('  Could not open browser automatically', colors.yellow));
      });
    }
  });
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
