import { defineConfig, Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES module compatibility - __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin to serve data files from src/data during development and copy to build
function dataFilesPlugin(): Plugin {
  return {
    name: 'data-files',
    configureServer(server) {
      // Serve data files from src/data during development
      server.middlewares.use('/data', (req, res, next) => {
        const filePath = resolve(__dirname, 'src/data', req.url?.slice(1) || '');
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(filePath, 'utf-8'));
        } else {
          next();
        }
      });
    },
    writeBundle() {
      // Copy data files to dist during build (including subdirectories)
      const srcDir = resolve(__dirname, 'src/data');
      const destDir = resolve(__dirname, 'dist/data');
      
      function copyDir(src: string, dest: string) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = resolve(src, entry.name);
          const destPath = resolve(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else if (entry.name.endsWith('.json')) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDir(srcDir, destDir);
    }
  };
}

// Helper to load section HTML files
function loadSection(sectionName: string): string {
  const sectionPath = resolve(__dirname, `src/sections/${sectionName}.html`);
  if (fs.existsSync(sectionPath)) {
    return fs.readFileSync(sectionPath, 'utf-8');
  }
  return `<!-- Section ${sectionName} not found -->`;
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        services: resolve(__dirname, 'src/pages/services.html'),
        contact: resolve(__dirname, 'src/pages/contact.html'),
        handoff: resolve(__dirname, 'src/pages/handoff/index.html'),
        styleguide: resolve(__dirname, 'src/pages/styleguide/index.html'),
        content: resolve(__dirname, 'src/pages/content/index.html'),
        project: resolve(__dirname, 'src/pages/project/index.html'),
        projectInternal: resolve(__dirname, 'src/pages/project/internal/index.html'),
        projectUx: resolve(__dirname, 'src/pages/project/ux/index.html'),
        projectWireframes: resolve(__dirname, 'src/pages/project/wireframes/index.html'),
        clientPortal: resolve(__dirname, 'src/pages/client/index.html'),
        sitemap: resolve(__dirname, 'src/pages/sitemap/index.html'),
        // Wizard pages
        wizard: resolve(__dirname, 'src/pages/wizard/index.html'),
        wizardContext: resolve(__dirname, 'src/pages/wizard/context/index.html'),
        wizardPages: resolve(__dirname, 'src/pages/wizard/pages/index.html'),
        wizardStatus: resolve(__dirname, 'src/pages/wizard/status/index.html'),
        // Demo wizard
        wizardDemo: resolve(__dirname, 'src/pages/wizard/demo/index.html'),
      },
    },
    copyPublicDir: true,
  },
  plugins: [
    dataFilesPlugin(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          loadSection,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@sections': resolve(__dirname, 'src/sections'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@scripts': resolve(__dirname, 'src/scripts'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
