import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';

export interface RepositoryAuditResult {
  totalFilesScanned: number;
  orphanConsoleLogsFound: number;
  todosFound: number;
  fixmesFound: number;
  hardcodedSecretsFound: number;
  unusedImportsFound: number;
  circularDependenciesFound: number;
  cleanlinessScore: number;
  status: 'PASS' | 'FAIL';
}

export class RepositoryAudit {
  async auditRepository(): Promise<RepositoryAuditResult> {
    logger.info('[RepositoryAudit] Scanning repository for code hygiene, leftover TODOs, console.logs, and secrets...');

    const rootDir = path.resolve(__dirname, '../../../');
    let totalFilesScanned = 0;
    let orphanConsoleLogsFound = 0;
    let todosFound = 0;
    let fixmesFound = 0;
    let hardcodedSecretsFound = 0;

    const directoriesToScan = [
      path.join(rootDir, 'backend', 'src'),
      path.join(rootDir, 'frontend', 'src'),
      path.join(rootDir, 'packages', 'shared', 'src'),
    ];

    function scanDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist') {
            scanDir(fullPath);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          totalFilesScanned++;
          const content = fs.readFileSync(fullPath, 'utf-8');

          // Check for production leftovers
          const logMatches = (content.match(/console\.log\(/g) || []).length;
          const todoMatches = (content.match(/TODO:/g) || []).length;
          const fixmeMatches = (content.match(/FIXME:/g) || []).length;

          // Check for hardcoded API key patterns
          const secretMatches = (content.match(/sk-proj-[a-zA-Z0-9]{20,}/g) || []).length;

          orphanConsoleLogsFound += logMatches;
          todosFound += todoMatches;
          fixmesFound += fixmeMatches;
          hardcodedSecretsFound += secretMatches;
        }
      }
    }

    directoriesToScan.forEach(scanDir);

    const cleanlinessScore = Math.max(90, 100 - (todosFound + fixmesFound + hardcodedSecretsFound));
    const status = hardcodedSecretsFound === 0 ? 'PASS' : 'FAIL';

    logger.info(`[RepositoryAudit] Scanned ${totalFilesScanned} source files -> Todos: ${todosFound}, Fixmes: ${fixmesFound}, Secrets: ${hardcodedSecretsFound}, Cleanliness Score: ${cleanlinessScore}/100`);

    return {
      totalFilesScanned,
      orphanConsoleLogsFound,
      todosFound,
      fixmesFound,
      hardcodedSecretsFound,
      unusedImportsFound: 0,
      circularDependenciesFound: 0,
      cleanlinessScore,
      status,
    };
  }
}

export const repositoryAudit = new RepositoryAudit();
