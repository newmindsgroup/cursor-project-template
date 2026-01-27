#!/usr/bin/env node
/**
 * Progress Scanner Script
 * Scans markdown files for completion markers and updates project-status.json
 * 
 * Completion markers:
 * - Checkbox syntax: `- [x]` (complete) vs `- [ ]` (incomplete)
 * - Status comments: `<!-- status: completed -->` or `<!-- status: in-progress -->`
 * - Front matter status: `status: completed`
 * 
 * Usage: node scripts/scan-progress.mjs [--verbose]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const STATUS_FILE = path.join(ROOT_DIR, 'src/data/project-status.json');

const VERBOSE = process.argv.includes('--verbose');

function log(...args) {
  if (VERBOSE) {
    console.log('[scan-progress]', ...args);
  }
}

/**
 * Parse a markdown file and extract completion metrics
 */
async function parseMarkdownFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Count checkboxes
    const checkedBoxes = (content.match(/- \[x\]/gi) || []).length;
    const uncheckedBoxes = (content.match(/- \[ \]/g) || []).length;
    const totalBoxes = checkedBoxes + uncheckedBoxes;
    
    // Look for status comments
    const statusCommentMatch = content.match(/<!--\s*status:\s*(completed|in-progress|pending|blocked)\s*-->/i);
    const statusFromComment = statusCommentMatch ? statusCommentMatch[1].toLowerCase() : null;
    
    // Look for front matter status
    const frontMatterMatch = content.match(/^---[\s\S]*?status:\s*(completed|in-progress|pending|blocked)[\s\S]*?---/im);
    const statusFromFrontMatter = frontMatterMatch ? frontMatterMatch[1].toLowerCase() : null;
    
    // Calculate progress
    let progress = 0;
    if (totalBoxes > 0) {
      progress = Math.round((checkedBoxes / totalBoxes) * 100);
    }
    
    // Determine status
    let status = 'pending';
    if (statusFromComment) {
      status = statusFromComment;
    } else if (statusFromFrontMatter) {
      status = statusFromFrontMatter;
    } else if (totalBoxes > 0) {
      if (checkedBoxes === totalBoxes) {
        status = 'completed';
      } else if (checkedBoxes > 0) {
        status = 'in-progress';
      }
    }
    
    // Check if file has meaningful content (more than just template)
    const hasContent = content.length > 500 && !content.includes('[TODO]') && !content.includes('<!-- TODO');
    
    return {
      exists: true,
      checkedBoxes,
      uncheckedBoxes,
      totalBoxes,
      progress,
      status,
      hasContent,
      statusSource: statusFromComment ? 'comment' : statusFromFrontMatter ? 'frontmatter' : 'calculated'
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { exists: false, progress: 0, status: 'pending' };
    }
    throw error;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Scan all deliverables and update their status
 */
async function scanDeliverables(statusData) {
  const updatedPhases = [];
  
  for (const phase of statusData.phases) {
    const updatedDeliverables = [];
    let phaseProgress = 0;
    let completedDeliverables = 0;
    
    for (const deliverable of phase.deliverables) {
      const filePath = path.join(ROOT_DIR, deliverable.file);
      
      // Check for manual override
      const overrideKey = `${phase.id}.${deliverable.id}`;
      const override = statusData.overrides?.[overrideKey];
      
      let updatedDeliverable = { ...deliverable };
      
      if (override) {
        // Use override values
        updatedDeliverable.status = override.status || deliverable.status;
        updatedDeliverable.progress = override.progress ?? deliverable.progress;
        updatedDeliverable.statusSource = 'override';
        log(`Using override for ${overrideKey}:`, override);
      } else {
        // Scan the file
        const ext = path.extname(deliverable.file).toLowerCase();
        
        if (ext === '.md') {
          const scanResult = await parseMarkdownFile(filePath);
          updatedDeliverable = {
            ...updatedDeliverable,
            ...scanResult,
            statusSource: scanResult.statusSource
          };
          log(`Scanned ${deliverable.file}:`, scanResult);
        } else if (ext === '.json') {
          // For JSON files, check if they have meaningful content
          const exists = await fileExists(filePath);
          if (exists) {
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              const json = JSON.parse(content);
              
              // Check if it has actual data (not just template)
              let hasData = false;
              if (deliverable.file.includes('personas.json')) {
                hasData = json.personas?.length > 0 && json.personas[0].name !== '[Role/Title]';
              } else if (deliverable.file.includes('user-flows.json')) {
                hasData = json.flows?.length > 0 && json.flows[0].name !== '[Flow Name]';
              } else if (deliverable.file.includes('project-status.json')) {
                hasData = true; // This file always exists
              }
              
              updatedDeliverable.exists = true;
              updatedDeliverable.progress = hasData ? 100 : 0;
              updatedDeliverable.status = hasData ? 'completed' : 'pending';
              updatedDeliverable.statusSource = 'calculated';
            } catch {
              updatedDeliverable.status = 'pending';
              updatedDeliverable.progress = 0;
            }
          } else {
            updatedDeliverable.exists = false;
            updatedDeliverable.status = 'pending';
            updatedDeliverable.progress = 0;
          }
        } else if (ext === '.html') {
          // For HTML files, just check if they exist and have content
          const exists = await fileExists(filePath);
          if (exists) {
            const content = await fs.readFile(filePath, 'utf-8');
            const hasContent = content.length > 200;
            updatedDeliverable.exists = true;
            updatedDeliverable.progress = hasContent ? 100 : 0;
            updatedDeliverable.status = hasContent ? 'completed' : 'pending';
          } else {
            updatedDeliverable.exists = false;
            updatedDeliverable.status = 'pending';
            updatedDeliverable.progress = 0;
          }
          updatedDeliverable.statusSource = 'calculated';
        }
      }
      
      // Update phase progress calculation
      phaseProgress += updatedDeliverable.progress || 0;
      if (updatedDeliverable.status === 'completed') {
        completedDeliverables++;
      }
      
      updatedDeliverables.push(updatedDeliverable);
    }
    
    // Calculate phase status and progress
    const avgProgress = phase.deliverables.length > 0 
      ? Math.round(phaseProgress / phase.deliverables.length)
      : 0;
    
    let phaseStatus = 'pending';
    if (completedDeliverables === phase.deliverables.length && phase.deliverables.length > 0) {
      phaseStatus = 'completed';
    } else if (completedDeliverables > 0 || avgProgress > 0) {
      phaseStatus = 'in-progress';
    }
    
    updatedPhases.push({
      ...phase,
      deliverables: updatedDeliverables,
      progress: avgProgress,
      status: phaseStatus
    });
  }
  
  return updatedPhases;
}

/**
 * Determine the current phase based on status
 */
function determineCurrentPhase(phases) {
  // Find the first non-completed phase
  for (const phase of phases) {
    if (phase.status !== 'completed') {
      return phase.id;
    }
  }
  // All phases completed
  return phases[phases.length - 1]?.id || 'brief';
}

/**
 * Calculate overall progress
 */
function calculateOverallProgress(phases) {
  if (phases.length === 0) return 0;
  
  const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
  return Math.round(totalProgress / phases.length);
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning project progress...\n');
  
  // Read current status file
  let statusData;
  try {
    const content = await fs.readFile(STATUS_FILE, 'utf-8');
    statusData = JSON.parse(content);
  } catch (error) {
    console.error('Error reading project-status.json:', error.message);
    process.exit(1);
  }
  
  // Scan all deliverables
  const updatedPhases = await scanDeliverables(statusData);
  
  // Calculate overall metrics
  const overallProgress = calculateOverallProgress(updatedPhases);
  const currentPhase = determineCurrentPhase(updatedPhases);
  
  // Update status data
  const updatedStatus = {
    ...statusData,
    phases: updatedPhases,
    overallProgress,
    currentPhase,
    lastScanned: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  // Write updated status
  await fs.writeFile(STATUS_FILE, JSON.stringify(updatedStatus, null, 2));
  
  // Print summary
  console.log('📊 Progress Summary\n');
  console.log(`Overall Progress: ${overallProgress}%`);
  console.log(`Current Phase: ${currentPhase}\n`);
  
  console.log('Phases:');
  for (const phase of updatedPhases) {
    const statusIcon = phase.status === 'completed' ? '✅' : phase.status === 'in-progress' ? '🔄' : '⏳';
    console.log(`  ${statusIcon} ${phase.name}: ${phase.progress}% (${phase.status})`);
    
    if (VERBOSE) {
      for (const d of phase.deliverables) {
        const dIcon = d.status === 'completed' ? '✓' : d.status === 'in-progress' ? '○' : '·';
        console.log(`      ${dIcon} ${d.name}: ${d.progress}% [${d.statusSource || 'unknown'}]`);
      }
    }
  }
  
  console.log('\n✨ Progress scan complete!');
  console.log(`   Updated: ${STATUS_FILE}`);
}

main().catch(console.error);
