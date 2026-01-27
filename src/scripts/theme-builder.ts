/**
 * Theme Builder
 * Visual theme customization with live preview
 */

interface ThemeState {
  primary: string;
  secondary: string;
  accent: string;
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  borderRadius: number;
  spacingScale: string;
  mode: 'light' | 'dark';
}

const state: ThemeState = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  baseSize: 16,
  borderRadius: 8,
  spacingScale: 'default',
  mode: 'light'
};

// Color presets
const COLOR_PRESETS: Record<string, { primary: string; secondary: string; accent: string }> = {
  'blue-violet': { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f59e0b' },
  'green-teal': { primary: '#10b981', secondary: '#14b8a6', accent: '#f97316' },
  'orange-red': { primary: '#f97316', secondary: '#ef4444', accent: '#3b82f6' },
  'pink-purple': { primary: '#ec4899', secondary: '#a855f7', accent: '#06b6d4' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initColorPickers();
  initTypographyControls();
  initLayoutControls();
  initPresetButtons();
  initModeToggle();
  initExportButtons();
  loadGoogleFonts();
  updatePreview();
  generatePalette('primary', state.primary);
  generatePalette('secondary', state.secondary);
  
  // Initialize value displays
  const baseSizeValue = document.getElementById('base-size-value');
  const borderRadiusValue = document.getElementById('border-radius-value');
  if (baseSizeValue) baseSizeValue.textContent = `${state.baseSize}px`;
  if (borderRadiusValue) borderRadiusValue.textContent = `${state.borderRadius}px`;
  
  // Initialize CSS output
  updateCSSOutput();
});

/**
 * Initialize color pickers
 */
function initColorPickers() {
  const colors = ['primary', 'secondary', 'accent'];
  
  colors.forEach(colorKey => {
    const picker = document.getElementById(`${colorKey}-color`) as HTMLInputElement;
    const hexInput = document.getElementById(`${colorKey}-color-hex`) as HTMLInputElement;
    
    picker?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      (state as any)[colorKey] = value;
      if (hexInput) hexInput.value = value;
      if (colorKey !== 'accent') {
        generatePalette(colorKey, value);
      }
      updatePreview();
      updateCSSOutput();
    });
    
    hexInput?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        (state as any)[colorKey] = value;
        if (picker) picker.value = value;
        if (colorKey !== 'accent') {
          generatePalette(colorKey, value);
        }
        updatePreview();
        updateCSSOutput();
      }
    });
  });
}

/**
 * Generate color palette from base color
 */
function generatePalette(colorKey: string, baseColor: string) {
  const paletteContainer = document.getElementById(`${colorKey}-palette`);
  if (!paletteContainer) return;
  
  const shades = generateColorShades(baseColor);
  
  paletteContainer.innerHTML = shades.map((shade, i) => {
    const level = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900][i];
    return `
      <div class="theme-swatch" style="background: ${shade};" title="${colorKey}-${level}: ${shade}">
        <span class="theme-swatch-label">${level}</span>
      </div>
    `;
  }).join('');
}

/**
 * Generate color shades from a base color
 */
function generateColorShades(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return Array(10).fill(hex);
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generate 10 shades from light to dark
  const lightnesses = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
  
  return lightnesses.map(l => {
    // Adjust saturation based on lightness for better visual results
    const s = l > 70 ? hsl.s * 0.8 : l < 30 ? hsl.s * 0.9 : hsl.s;
    return hslToHex(hsl.h, s, l);
  });
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Initialize typography controls
 */
function initTypographyControls() {
  const headingFont = document.getElementById('heading-font') as HTMLSelectElement;
  const bodyFont = document.getElementById('body-font') as HTMLSelectElement;
  const baseSize = document.getElementById('base-size') as HTMLInputElement;
  const baseSizeValue = document.getElementById('base-size-value');
  
  headingFont?.addEventListener('change', (e) => {
    state.headingFont = (e.target as HTMLSelectElement).value;
    updatePreview();
    updateCSSOutput();
  });
  
  bodyFont?.addEventListener('change', (e) => {
    state.bodyFont = (e.target as HTMLSelectElement).value;
    updatePreview();
    updateCSSOutput();
  });
  
  baseSize?.addEventListener('input', (e) => {
    state.baseSize = parseInt((e.target as HTMLInputElement).value);
    if (baseSizeValue) baseSizeValue.textContent = `${state.baseSize}px`;
    updatePreview();
    updateCSSOutput();
  });
}

/**
 * Initialize layout controls
 */
function initLayoutControls() {
  const borderRadius = document.getElementById('border-radius') as HTMLInputElement;
  const borderRadiusValue = document.getElementById('border-radius-value');
  const spacingScale = document.getElementById('spacing-scale') as HTMLSelectElement;
  
  borderRadius?.addEventListener('input', (e) => {
    state.borderRadius = parseInt((e.target as HTMLInputElement).value);
    if (borderRadiusValue) borderRadiusValue.textContent = `${state.borderRadius}px`;
    updatePreview();
    updateCSSOutput();
  });
  
  spacingScale?.addEventListener('change', (e) => {
    state.spacingScale = (e.target as HTMLSelectElement).value;
    updatePreview();
    updateCSSOutput();
  });
}

/**
 * Initialize preset buttons
 */
function initPresetButtons() {
  const presetBtns = document.querySelectorAll('.theme-preset-btn');
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = (btn as HTMLElement).dataset.preset;
      if (preset && COLOR_PRESETS[preset]) {
        const colors = COLOR_PRESETS[preset];
        
        state.primary = colors.primary;
        state.secondary = colors.secondary;
        state.accent = colors.accent;
        
        // Update inputs
        updateColorInputs('primary', colors.primary);
        updateColorInputs('secondary', colors.secondary);
        updateColorInputs('accent', colors.accent);
        
        // Generate palettes
        generatePalette('primary', colors.primary);
        generatePalette('secondary', colors.secondary);
        
        updatePreview();
        updateCSSOutput();
        showToast('Preset applied!');
      }
    });
  });
}

/**
 * Update color inputs
 */
function updateColorInputs(colorKey: string, value: string) {
  const picker = document.getElementById(`${colorKey}-color`) as HTMLInputElement;
  const hexInput = document.getElementById(`${colorKey}-color-hex`) as HTMLInputElement;
  
  if (picker) picker.value = value;
  if (hexInput) hexInput.value = value;
}

/**
 * Initialize mode toggle
 */
function initModeToggle() {
  const modeBtns = document.querySelectorAll('.theme-preview-mode');
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = (btn as HTMLElement).dataset.mode as 'light' | 'dark';
      updatePreview();
    });
  });
}

/**
 * Initialize export buttons
 */
function initExportButtons() {
  const exportBtn = document.getElementById('export-theme');
  const copyBtn = document.getElementById('copy-css');
  
  exportBtn?.addEventListener('click', exportTheme);
  copyBtn?.addEventListener('click', copyCSSToClipboard);
}

/**
 * Load Google Fonts
 */
function loadGoogleFonts() {
  const fonts = [
    'Inter',
    'Plus+Jakarta+Sans',
    'DM+Sans',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Playfair+Display',
    'Merriweather',
    'Open+Sans',
    'Lato',
    'Source+Sans+Pro',
    'Nunito',
    'Roboto'
  ];
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Update live preview
 */
function updatePreview() {
  const preview = document.getElementById('theme-preview');
  if (!preview) return;
  
  const shades = {
    primary: generateColorShades(state.primary),
    secondary: generateColorShades(state.secondary),
    accent: generateColorShades(state.accent)
  };
  
  // Set CSS variables on preview
  preview.style.setProperty('--preview-primary-50', shades.primary[0]);
  preview.style.setProperty('--preview-primary-100', shades.primary[1]);
  preview.style.setProperty('--preview-primary-500', shades.primary[5]);
  preview.style.setProperty('--preview-primary-600', shades.primary[6]);
  preview.style.setProperty('--preview-primary-700', shades.primary[7]);
  
  preview.style.setProperty('--preview-secondary-50', shades.secondary[0]);
  preview.style.setProperty('--preview-secondary-100', shades.secondary[1]);
  preview.style.setProperty('--preview-secondary-500', shades.secondary[5]);
  preview.style.setProperty('--preview-secondary-600', shades.secondary[6]);
  
  preview.style.setProperty('--preview-accent-50', shades.accent[0]);
  preview.style.setProperty('--preview-accent-100', shades.accent[1]);
  preview.style.setProperty('--preview-accent-500', shades.accent[5]);
  preview.style.setProperty('--preview-accent-600', shades.accent[6]);
  
  preview.style.setProperty('--preview-font-heading', `'${state.headingFont}', sans-serif`);
  preview.style.setProperty('--preview-font-body', `'${state.bodyFont}', sans-serif`);
  preview.style.setProperty('--preview-text-base', `${state.baseSize}px`);
  preview.style.setProperty('--preview-radius', `${state.borderRadius}px`);
  
  // Dark mode
  if (state.mode === 'dark') {
    preview.classList.add('dark-mode');
  } else {
    preview.classList.remove('dark-mode');
  }
}

/**
 * Update CSS output
 */
function updateCSSOutput() {
  const output = document.getElementById('css-output');
  if (!output) return;
  
  const shades = {
    primary: generateColorShades(state.primary),
    secondary: generateColorShades(state.secondary),
    accent: generateColorShades(state.accent)
  };
  
  const css = `/* Generated Theme Variables */
:root {
  /* Primary */
  --color-primary-50: ${shades.primary[0]};
  --color-primary-100: ${shades.primary[1]};
  --color-primary-200: ${shades.primary[2]};
  --color-primary-300: ${shades.primary[3]};
  --color-primary-400: ${shades.primary[4]};
  --color-primary-500: ${shades.primary[5]};
  --color-primary-600: ${shades.primary[6]};
  --color-primary-700: ${shades.primary[7]};
  --color-primary-800: ${shades.primary[8]};
  --color-primary-900: ${shades.primary[9]};
  
  /* Secondary */
  --color-secondary-50: ${shades.secondary[0]};
  --color-secondary-100: ${shades.secondary[1]};
  --color-secondary-200: ${shades.secondary[2]};
  --color-secondary-300: ${shades.secondary[3]};
  --color-secondary-400: ${shades.secondary[4]};
  --color-secondary-500: ${shades.secondary[5]};
  --color-secondary-600: ${shades.secondary[6]};
  --color-secondary-700: ${shades.secondary[7]};
  --color-secondary-800: ${shades.secondary[8]};
  --color-secondary-900: ${shades.secondary[9]};
  
  /* Accent */
  --color-accent-500: ${shades.accent[5]};
  --color-accent-600: ${shades.accent[6]};
  
  /* Typography */
  --font-heading: '${state.headingFont}', sans-serif;
  --font-body: '${state.bodyFont}', sans-serif;
  --text-base: ${state.baseSize}px;
  
  /* Layout */
  --radius-default: ${state.borderRadius}px;
  --spacing-scale: ${state.spacingScale};
}`;
  
  output.querySelector('code')!.textContent = css;
}

/**
 * Export theme to file
 */
async function exportTheme() {
  const cssContent = document.getElementById('css-output')?.querySelector('code')?.textContent || '';
  
  try {
    // Try to save via API
    const response = await fetch('http://localhost:3001/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        css: cssContent,
        state
      })
    });
    
    if (response.ok) {
      showToast('Theme saved to project!');
    } else {
      throw new Error('Save failed');
    }
  } catch {
    // Fallback: download as file
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-variables.css';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Theme downloaded!');
  }
}

/**
 * Copy CSS to clipboard
 */
async function copyCSSToClipboard() {
  const cssContent = document.getElementById('css-output')?.querySelector('code')?.textContent || '';
  
  try {
    await navigator.clipboard.writeText(cssContent);
    showToast('CSS copied to clipboard!');
  } catch {
    showToast('Failed to copy');
  }
}

/**
 * Show toast notification
 */
function showToast(message: string) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
