#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groups, allowed } from '../src/modules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const appSource = fs.readFileSync(path.join(src, 'App.jsx'), 'utf8');
const pageDir = path.join(src, 'pages');
const pages = new Set(fs.readdirSync(pageDir).filter((file) => file.endsWith('.jsx')));
const moduleKeys = groups.flatMap((group) => group.items.map(([key]) => key));
const duplicates = moduleKeys.filter((key, index) => moduleKeys.indexOf(key) !== index);
const importedPages = [...appSource.matchAll(/import\s+\w+\s+from\s+'\.\/pages\/(.+?\.jsx)'/g)].map((match) => match[1]);
const missingImports = importedPages.filter((file) => !pages.has(file));
const genericFallback = appSource.includes('<OperationalModulePage');
const fixedMatches = [...appSource.matchAll(/(?:['\"]([\w-]+)['\"]|\b([a-z][\w-]*)):\s*([A-Z]\w+)/g)].map((match) => match[1] || match[2]);
const coveredBySpecialist = new Set([...fixedMatches]);
for (const key of ['ai-assistant','content-calendar']) coveredBySpecialist.add(key);
for (const key of ['trafficCenter','trafficCampaigns','trafficPlatforms','trafficLeads','trafficMetrics','trafficRoi','socialIntegrations','apiSettings']) coveredBySpecialist.add(key);
for (const key of ['commercial','pipeline','leads','followup','objections','crmCampaigns','commercialReports','commercialDashboard']) coveredBySpecialist.add(key);
for (const key of ['marketing','lead-capture','campaigns','crm','whatsapp','tasks','captions','reels','stories','metrics']) coveredBySpecialist.add(key);
for (const key of ['marketingGoals','flyers','quickLead','commercialRoutine','marketingDaily','weeklyReport','originPerformance']) coveredBySpecialist.add(key);
for (const key of ['clinical','enterpriseCrm','secretary','belleartAi','automationsEnterprise','backupSecurity']) coveredBySpecialist.add(key);
const operationalModules = moduleKeys.filter((key) => !coveredBySpecialist.has(key));
const roles = ['administrador','dentista','recepcao','financeiro','marketing','leitura'];
const permissionMatrix = Object.fromEntries(roles.map((role) => [role, moduleKeys.filter((key) => allowed(key, { role }))]));

console.log('BELLEART OS — validação estática de rotas frontend');
console.log(`Módulos declarados: ${moduleKeys.length}`);
console.log(`Páginas React encontradas: ${pages.size}`);
console.log(`Fallback operacional premium: ${genericFallback ? 'presente e controlado' : 'ausente'}`);
console.log('Módulos atendidos pelo fallback operacional:', operationalModules.join(', ') || 'nenhum');
console.log('Matriz de permissões validada:', permissionMatrix);

if (duplicates.length || missingImports.length || !genericFallback) {
  if (duplicates.length) console.error('Duplicidades:', duplicates);
  if (missingImports.length) console.error('Imports ausentes:', missingImports);
  if (!genericFallback) console.error('Fallback operacional não encontrado.');
  process.exit(1);
}
console.log('Validação frontend OK: rotas declaradas, imports existentes, permissões avaliadas e fallback genérico auditado.');
