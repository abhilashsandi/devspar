// Adds an "Azure implementation" column next to the "AWS implementation" column in the layer-by-layer
// design / optimization table, in all four places it appears.
//   node scripts/study/add-azure-column.mjs && npm run study:build
// Safe to re-run: a table that already has the column is skipped.
import * as lib from './lib.mjs';

// Layer name (as it appears in the first column) -> Azure equivalent of that row's AWS cell.
const AZURE = {
  'Client': 'Static Web Apps, or Blob Storage + Azure Front Door; API Management GraphQL APIs if GraphQL',
  'Network / CDN': 'Azure Front Door (CDN, WAF, Rules Engine), Azure DNS, Traffic Manager',
  'API / Gateway': 'API Management, Microsoft Entra External ID, Application Gateway',
  'Services / app tier': 'Container Apps or AKS; Azure Functions for event-driven pieces',
  'Data / database': 'Azure SQL or PostgreSQL Flexible Server (zone-redundant HA + read replicas), Cosmos DB; SQL Hyperscale or Cosmos DB partitioning to scale out',
  'Caching': 'Azure Managed Redis (successor to Azure Cache for Redis), Front Door caching, Cosmos DB integrated cache',
  'Async / messaging': 'Service Bus, Event Grid, Event Hubs; Durable Functions for saga orchestration',
  'Deployment / scaling': 'Container Apps / AKS autoscaling (KEDA), VM Scale Sets, Azure Pipelines or GitHub Actions, deployment slots',
  'Reliability / observability': 'Azure Monitor, Application Insights, Front Door health probes, Availability Zones',
};

const TARGETS = [
  ['performance-optimization', 'overview', 1],
  ['system-design-scale', 'overview', 1],
  ['interview-prep', 'sdscale', 0],
  ['interview-prep', 'perf', 0],
];

const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();

function addColumn(a) {
  if (a.includes('Azure implementation')) return a;
  let rows = 0;
  let out = a.replace('<th>AWS implementation</th></tr>', '<th>AWS implementation</th><th>Azure implementation</th></tr>');
  out = out.replace(/(<tr><td><strong>([\s\S]*?)<\/strong><\/td>[\s\S]*?)<\/tr>/g, (m, body, layer) => {
    const cell = AZURE[plain(layer)];
    if (!cell) throw new Error('no Azure mapping for layer: ' + plain(layer));
    rows++;
    return body + '<td>' + cell + '</td></tr>';
  });
  if (rows !== Object.keys(AZURE).length) throw new Error('expected ' + Object.keys(AZURE).length + ' rows, found ' + rows);
  out = out.replace('min-width:680px', 'min-width:900px');
  // Prose that introduces the table.
  out = out
    .replace('The AWS column shows what "implement this on AWS" looks like per layer.', 'The AWS and Azure columns show what "implement this on AWS" or "implement this on Azure" looks like per layer.')
    .replace('The AWS column is what "implement this on AWS specifically" looks like for each row', 'The AWS and Azure columns are what "implement this on AWS (or Azure) specifically" looks like for each row');
  return out;
}

const byGuide = new Map();
for (const [guide, sid, idx] of TARGETS) {
  if (!byGuide.has(guide)) byGuide.set(guide, await lib.load(guide));
  const { data } = byGuide.get(guide);
  const sec = data.find((s) => s.id === sid);
  const q = sec.questions[idx];
  const next = addColumn(q.a);
  console.log(guide + ' / ' + sid + ':' + idx + (next === q.a ? ' already has the column' : ' updated'));
  q.a = next;
}
for (const [guide, { html, data }] of byGuide) {
  await lib.save(guide, await lib.upgrade(lib.withData(html, data)));
}
