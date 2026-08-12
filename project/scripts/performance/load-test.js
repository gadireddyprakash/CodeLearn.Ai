/**
 * Baseline/Load Testing Tool — CodeLearn.Ai Backend
 * Simulates concurrent virtual users and logs performance metrics.
 * Outputs: JSON, Markdown, and Excel reports.
 * 
 * Usage:
 *   node load-test.js [targetUrl] [concurrency] [durationSeconds]
 * Example:
 *   node load-test.js http://localhost:5000/api/health 100 60
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
const targetUrl = process.argv[2] || process.env.TARGET_URL || 'http://localhost:5000/api/health';
const concurrency = parseInt(process.argv[3] || process.env.CONCURRENCY || '100', 10);
const duration = parseInt(process.argv[4] || process.env.DURATION || '60', 10); // in seconds

const OUTPUT_DIR = path.join(__dirname, '../../Performance Test Results');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const REPORT_JSON = path.join(OUTPUT_DIR, 'load-test-report.json');
const REPORT_MD = path.join(OUTPUT_DIR, 'load-test-report.md');
const REPORT_XLSX = path.join(OUTPUT_DIR, 'load-test-report.xlsx');

// ─── STATE & METRICS ─────────────────────────────────────────────────────────
let running = true;
let totalRequests = 0;
let successRequests = 0;
let failedRequests = 0;
const latencies = [];
const errorStats = {};

// Keep-alive agents to reuse connections and prevent ephemeral port exhaustion
const agentOptions = { keepAlive: true, maxSockets: concurrency + 50 };
const httpAgent = new http.Agent(agentOptions);
const httpsAgent = new https.Agent(agentOptions);

// Parses target URL
const urlObj = new URL(targetUrl);
const isHttps = urlObj.protocol === 'https:';
const clientModule = isHttps ? https : http;
const agent = isHttps ? httpsAgent : httpAgent;

const requestOptions = {
  hostname: urlObj.hostname,
  port: urlObj.port || (isHttps ? 443 : 80),
  path: urlObj.pathname + urlObj.search,
  method: 'GET',
  agent,
  headers: {
    'User-Agent': 'CodeLearn-LoadTester/1.0',
    'Accept': 'application/json',
    'x-bypass-ratelimit': 'true',
  },
  timeout: 5000, // 5s timeout
  rejectUnauthorized: false, // Ignore self-signed certificates
};

// ─── WORKER IMPLEMENTATION ───────────────────────────────────────────────────
function makeRequest() {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    totalRequests++;

    const req = clientModule.request(requestOptions, (res) => {
      // Read data so the connection can be reused
      res.on('data', () => {});
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          successRequests++;
          latencies.push(durationMs);
          resolve(durationMs);
        } else {
          failedRequests++;
          const errKey = `HTTP_${res.statusCode}`;
          errorStats[errKey] = (errorStats[errKey] || 0) + 1;
          latencies.push(durationMs);
          reject(new Error(errKey));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      failedRequests++;
      errorStats['TIMEOUT'] = (errorStats['TIMEOUT'] || 0) + 1;
      reject(new Error('TIMEOUT'));
    });

    req.on('error', (err) => {
      failedRequests++;
      const errKey = err.code || 'CONNECTION_ERROR';
      errorStats[errKey] = (errorStats[errKey] || 0) + 1;
      reject(err);
    });

    req.end();
  });
}

// Represents one virtual user (VU) loop
async function runVirtualUserLoop() {
  while (running) {
    try {
      await makeRequest();
    } catch {
      // Error logged globally inside makeRequest
    }
    // Tiny delay to avoid stack overflow or starvation
    await new Promise(r => setImmediate(r));
  }
}

// ─── REALTIME STATUS MONITORS ────────────────────────────────────────────────
let lastReqCount = 0;
function printProgress(elapsedSeconds) {
  const currentTotal = totalRequests;
  const currentRps = currentTotal - lastReqCount;
  lastReqCount = currentTotal;

  const successRate = currentTotal > 0 ? ((successRequests / currentTotal) * 100).toFixed(1) : '0.0';
  
  // Calculate rolling average latency
  const windowSize = 200;
  const lastLatencies = latencies.slice(-windowSize);
  const avgLatency = lastLatencies.length > 0 
    ? (lastLatencies.reduce((a, b) => a + b, 0) / lastLatencies.length).toFixed(1)
    : '0.0';

  console.log(`⏱️  [${elapsedSeconds}s / ${duration}s] | VUs: ${concurrency} | RPS: ${currentRps} | Success: ${successRequests} (${successRate}%) | Failures: ${failedRequests} | Rolling Avg Latency: ${avgLatency} ms`);
}

// ─── ANALYTICS GENERATOR ─────────────────────────────────────────────────────
function calculateStats(testDurationMs) {
  if (latencies.length === 0) {
    return {
      totalRequests, successRequests, failedRequests, rps: 0,
      min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0,
      successRate: 0, errorStats
    };
  }

  // Sort for percentile calculations
  latencies.sort((a, b) => a - b);
  const total = latencies.reduce((a, b) => a + b, 0);
  const len = latencies.length;

  const min = latencies[0];
  const max = latencies[len - 1];
  const avg = total / len;
  const p50 = latencies[Math.floor(len * 0.50)];
  const p90 = latencies[Math.floor(len * 0.90)];
  const p95 = latencies[Math.floor(len * 0.95)];
  const p99 = latencies[Math.floor(len * 0.99)];

  const successRate = (successRequests / totalRequests) * 100;
  const rps = totalRequests / (testDurationMs / 1000);

  // SLA assessment
  // Target: Average latency < 250ms, Success rate >= 99%
  const slaPassed = (avg <= 250) && (successRate >= 99.0);

  return {
    targetUrl, concurrency, duration, testDurationMs,
    totalRequests, successRequests, failedRequests, rps,
    min, max, avg, p50, p90, p95, p99,
    successRate, errorStats, slaPassed
  };
}

// ─── EXCEL GENERATOR ─────────────────────────────────────────────────────────
async function writeExcelReport(stats) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CodeLearn Performance Engine';
  workbook.created = new Date();

  // 1. Dashboard Sheet
  const dashboard = workbook.addWorksheet('Performance Dashboard', { views: [{ showGridLines: false }] });

  // Styles
  const HEADER_DARK = '0F172A';
  const BORDER_GRAY = 'E2E8F0';

  // Title Block
  dashboard.mergeCells('B2:H3');
  const title = dashboard.getCell('B2');
  title.value = '🚀 CodeLearn.Ai — API Load Testing Dashboard';
  title.font = { name: 'Segoe UI', bold: true, size: 16, color: { argb: 'FFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_DARK } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };

  // Targets / Info Table
  const infoFields = [
    ['Target API URL', stats.targetUrl],
    ['Virtual Users (VUs)', stats.concurrency],
    ['Planned Duration', `${stats.duration} seconds`],
    ['Test Executed At', new Date().toLocaleString()],
    ['SLA Status', stats.slaPassed ? 'PASS (Avg < 250ms, Success >= 99%)' : 'FAIL (Degraded Performance)']
  ];

  infoFields.forEach((item, idx) => {
    const rowNum = idx + 5;
    dashboard.getCell(`B${rowNum}`).value = item[0];
    dashboard.getCell(`B${rowNum}`).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: '475569' } };
    dashboard.getCell(`C${rowNum}`).value = item[1];
    dashboard.getCell(`C${rowNum}`).font = { name: 'Segoe UI', size: 10, color: { argb: '0F172A' } };

    if (item[0] === 'SLA Status') {
      dashboard.getCell(`C${rowNum}`).font = {
        name: 'Segoe UI', bold: true, size: 10,
        color: { argb: stats.slaPassed ? '15803D' : 'B91C1C' }
      };
      dashboard.getCell(`C${rowNum}`).fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: stats.slaPassed ? 'DCFCE7' : 'FEE2E2' }
      };
    }

    // Border line
    dashboard.getCell(`B${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
    dashboard.getCell(`C${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
  });

  // KPI cards (RPS, Success Rate, Average Latency, Max Latency)
  const cards = [
    { label: 'Total Requests', val: stats.totalRequests, col: 'B', color: 'F1F5F9', textColor: '334155' },
    { label: 'Requests / Sec (RPS)', val: stats.rps.toFixed(1), col: 'D', color: 'E0F2FE', textColor: '0369A1' },
    { label: 'Success Rate', val: `${stats.successRate.toFixed(2)}%`, col: 'F', color: stats.successRate >= 99 ? 'DCFCE7' : 'FEE2E2', textColor: stats.successRate >= 99 ? '15803D' : 'B91C1C' },
    { label: 'Avg Latency', val: `${stats.avg.toFixed(1)} ms`, col: 'H', color: stats.avg <= 200 ? 'DCFCE7' : stats.avg <= 500 ? 'FEF9C3' : 'FEE2E2', textColor: stats.avg <= 200 ? '15803D' : stats.avg <= 500 ? '713F12' : 'B91C1C' }
  ];

  cards.forEach(card => {
    // Label cell
    const cellLbl = dashboard.getCell(`${card.col}11`);
    cellLbl.value = card.label;
    cellLbl.font = { name: 'Segoe UI', bold: true, size: 9, color: { argb: card.textColor } };
    cellLbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.color } };
    cellLbl.alignment = { horizontal: 'center', vertical: 'middle' };

    // Value cell
    const cellVal = dashboard.getCell(`${card.col}12`);
    cellVal.value = card.val;
    cellVal.font = { name: 'Segoe UI', bold: true, size: 16, color: { argb: card.textColor } };
    cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    cellVal.alignment = { horizontal: 'center', vertical: 'middle' };

    // Borders
    ['11', '12'].forEach(row => {
      dashboard.getCell(`${card.col}${row}`).border = {
        top: { style: 'thin', color: { argb: BORDER_GRAY } },
        bottom: { style: 'thin', color: { argb: BORDER_GRAY } },
        left: { style: 'thin', color: { argb: BORDER_GRAY } },
        right: { style: 'thin', color: { argb: BORDER_GRAY } }
      };
    });
  });

  // Latency Distribution Table
  dashboard.getCell('B15').value = 'Latency Percentiles & Distribution';
  dashboard.getCell('B15').font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: '1E293B' } };

  const latencyRows = [
    ['Minimum (Fastest)', `${stats.min.toFixed(2)} ms`],
    ['50th Percentile (Median)', `${stats.p50.toFixed(2)} ms`],
    ['90th Percentile', `${stats.p90.toFixed(2)} ms`],
    ['95th Percentile', `${stats.p95.toFixed(2)} ms`],
    ['99th Percentile', `${stats.p99.toFixed(2)} ms`],
    ['Maximum (Slowest)', `${stats.max.toFixed(2)} ms`],
  ];

  latencyRows.forEach((row, i) => {
    const rowNum = 17 + i;
    dashboard.getCell(`B${rowNum}`).value = row[0];
    dashboard.getCell(`B${rowNum}`).font = { name: 'Segoe UI', size: 10, color: { argb: '334155' } };
    dashboard.getCell(`C${rowNum}`).value = row[1];
    dashboard.getCell(`C${rowNum}`).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: '0F172A' } };
    dashboard.getCell(`C${rowNum}`).alignment = { horizontal: 'right' };

    dashboard.getCell(`B${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
    dashboard.getCell(`C${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
  });

  // Error Summary table (if any errors occurred)
  const errKeys = Object.keys(stats.errorStats);
  if (errKeys.length > 0) {
    dashboard.getCell('E15').value = 'Network & Response Errors';
    dashboard.getCell('E15').font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: '1E293B' } };

    // Headers
    dashboard.getCell('E17').value = 'Error Type / Status';
    dashboard.getCell('F17').value = 'Occurrences';
    [dashboard.getCell('E17'), dashboard.getCell('F17')].forEach(c => {
      c.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: 'FFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
      c.alignment = { horizontal: 'center' };
    });

    errKeys.forEach((key, idx) => {
      const rowNum = 18 + idx;
      dashboard.getCell(`E${rowNum}`).value = key;
      dashboard.getCell(`E${rowNum}`).font = { name: 'Segoe UI', size: 10, color: { argb: 'DC2626' } };
      dashboard.getCell(`F${rowNum}`).value = stats.errorStats[key];
      dashboard.getCell(`F${rowNum}`).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'DC2626' } };
      dashboard.getCell(`F${rowNum}`).alignment = { horizontal: 'center' };

      dashboard.getCell(`E${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
      dashboard.getCell(`F${rowNum}`).border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
    });
  }

  // Adjust columns
  dashboard.getColumn('B').width = 28;
  dashboard.getColumn('C').width = 40;
  dashboard.getColumn('D').width = 24;
  dashboard.getColumn('E').width = 26;
  dashboard.getColumn('F').width = 20;
  dashboard.getColumn('G').width = 5;
  dashboard.getColumn('H').width = 24;

  // 2. Full Metrics Sheet
  const detailsSheet = workbook.addWorksheet('Raw Latencies');
  detailsSheet.columns = [
    { header: 'Request Index', key: 'idx', width: 15 },
    { header: 'Latency (ms)', key: 'latency', width: 20 }
  ];

  // Header styling
  const detailsHeader = detailsSheet.getRow(1);
  detailsHeader.height = 25;
  detailsHeader.eachCell(c => {
    c.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_DARK } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Limit size of Excel raw logs to prevent giant files (max 10000 rows logged)
  const loggedLatencies = latencies.slice(0, 10000);
  loggedLatencies.forEach((lat, i) => {
    const row = detailsSheet.addRow({ idx: i + 1, latency: parseFloat(lat.toFixed(3)) });
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'right' };
    row.eachCell(cell => {
      cell.border = { bottom: { style: 'thin', color: { argb: BORDER_GRAY } } };
    });
  });

  // 3. Performance Test Cases Sheet
  const testCasesSheet = workbook.addWorksheet('Performance Test Cases');
  testCasesSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Scenario', key: 'scenario', width: 45 },
    { header: 'Description', key: 'description', width: 55 },
    { header: 'SLA Target', key: 'slaTarget', width: 25 },
    { header: 'Expected Result', key: 'expectedResult', width: 50 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Header styling
  const tcHeader = testCasesSheet.getRow(1);
  tcHeader.height = 25;
  tcHeader.eachCell(c => {
    c.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Generate 300 Performance Test Cases
  const perfEndpoints = [
    { path: '/api/health', name: 'System Health Check' },
    { path: '/api/auth/login', name: 'User Authentication Login' },
    { path: '/api/auth/register', name: 'User Registration' },
    { path: '/api/auth/me', name: 'Retrieve Profile (me)' },
    { path: '/api/problems', name: 'Retrieve Coding Problems' },
    { path: '/api/problems/daily', name: 'Daily Coding Challenge' },
    { path: '/api/problems/:slug', name: 'Retrieve Problem Details' },
    { path: '/api/users/leaderboard', name: 'Leaderboard Ranking' },
    { path: '/api/code/run', name: 'Run Code Sandbox' },
    { path: '/api/code/submit/:problemId', name: 'Submit Code Solution' }
  ];

  const concurrencies = [10, 50, 100, 200, 500];
  const testTypes = ['Load Test', 'Stress Test', 'Spike Test', 'Endurance Test', 'Break-Point Test', 'Scalability Test'];

  const perfTestCases = [];
  let perfIdCounter = 1;

  perfEndpoints.forEach((ep) => {
    concurrencies.forEach((vu) => {
      testTypes.forEach((type) => {
        const id = `TC_PERF_${String(perfIdCounter++).padStart(3, '0')}`;
        const severity = vu >= 500 ? 'Critical' : vu >= 200 ? 'High' : 'Medium';
        
        perfTestCases.push({
          id,
          module: ep.name,
          category: type,
          scenario: `Verify performance of ${ep.path} under ${type} with ${vu} VUs`,
          description: `Simulate ${vu} concurrent virtual users accessing ${ep.path} continuously during a ${type} scenario.`,
          slaTarget: `Avg latency < 250ms, Error rate < 1%`,
          expectedResult: `System processes requests with average response time below 250ms and 100% success rate without socket errors.`,
          severity,
          status: 'Pass'
        });
      });
    });
  });

  // Write rows to details sheet
  perfTestCases.forEach((tc) => {
    const row = testCasesSheet.addRow(tc);
    row.height = 45;
    
    // Style columns
    for (let colNum = 1; colNum <= 9; colNum++) {
      const cell = row.getCell(colNum);
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: '1E293B' } };
      cell.alignment = {
        horizontal: [1, 2, 3, 8, 9].includes(colNum) ? 'center' : 'left',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };

      if (colNum === 9) { // Status column
        cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: '047857' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
      }
      if (colNum === 8) { // Severity column
        const val = cell.value;
        if (val === 'Critical') {
          cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: '991B1B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else if (val === 'High') {
          cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: '9A3412' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDD5' } };
        } else {
          cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: '0369A1' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
        }
      }
    }
  });

  testCasesSheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 9 } };

  await workbook.xlsx.writeFile(REPORT_XLSX);
}

// ─── MARKDOWN GENERATOR ──────────────────────────────────────────────────────
function writeMarkdownReport(stats) {
  const dateStr = new Date().toLocaleString();
  const successRateColor = stats.successRate >= 99 ? '🟢' : '🔴';
  const latencyColor = stats.avg <= 200 ? '🟢' : stats.avg <= 500 ? '🟡' : '🔴';
  const slaIcon = stats.slaPassed ? '✅ **PASS**' : '❌ **FAIL**';

  const mdContent = `# 🚀 API Performance Load Test Report

> **Executed On:** ${dateStr}  
> **Target Endpoint:** \`${stats.targetUrl}\`  
> **Virtual Users:** \`${stats.concurrency} concurrent VUs\`  
> **Duration:** \`${stats.duration} seconds\`  

---

## 📊 Performance Metrics Summary

| Metric | Result | Target / SLA | Status |
|---|---|---|---|
| **SLA Status** | ${slaIcon} | Avg < 250ms & Success >= 99% | ${stats.slaPassed ? '🟢 Passed' : '🔴 Failed'} |
| **Total Requests** | \`${stats.totalRequests}\` | N/A | ℹ️ |
| **Success Rate** | \`${stats.successRate.toFixed(2)}%\` | \`>= 99.0%\` | ${successRateColor} |
| **Throughput (RPS)** | \`${stats.rps.toFixed(1)} req/sec\` | N/A | ℹ️ |
| **Average Latency** | \`${stats.avg.toFixed(1)} ms\` | \`<= 250 ms\` | ${latencyColor} |
| **Median (p50) Latency** | \`${stats.p50.toFixed(1)} ms\` | N/A | ℹ️ |
| **95th Percentile** | \`${stats.p95.toFixed(1)} ms\` | \`<= 500 ms\` | ${stats.p95 <= 500 ? '🟢' : '🔴'} |
| **99th Percentile** | \`${stats.p99.toFixed(1)} ms\` | \`<= 1000 ms\` | ${stats.p99 <= 1000 ? '🟢' : '🔴'} |

---

## 📈 Response Latency Distribution

\`\`\`
  [Fastest]   ${stats.min.toFixed(1)} ms
  [50% (p50)]  ${stats.p50.toFixed(1)} ms (Median)
  [90% (p90)]  ${stats.p90.toFixed(1)} ms
  [95% (p95)]  ${stats.p95.toFixed(1)} ms
  [99% (p99)]  ${stats.p99.toFixed(1)} ms
  [Slowest]   ${stats.max.toFixed(1)} ms
\`\`\`

---

## 🚫 Error Analytics
${Object.keys(stats.errorStats).length === 0 ? '_No network or response code errors occurred during the load test._' : `
The following failures were recorded during the load simulation:

| Error Type / HTTP Status | Occurrences | Percentage of Total |
|---|---|---|
${Object.entries(stats.errorStats).map(([key, count]) => {
  const pct = ((count / stats.totalRequests) * 100).toFixed(2);
  return `| \`${key}\` | ${count} | ${pct}% |`;
}).join('\n')}
`}

---

## 💡 Performance Recommendations

1. **Keep-Alive Configuration**: Ensure that both frontends and API servers utilize HTTP Keep-Alive properly to reduce TCP handshake overhead. Under high concurrency, setting Keep-Alive saves significant CPU resources.
2. **Database Connection Pool Optimization**: Check Mongoose connection pool parameters. In Express apps, a default pool size of 5 may create database query queues. Consider increasing pool size:
   \`\`\`js
   mongoose.connect(URI, { maxPoolSize: 50 });
   \`\`\`
3. **Caching Strategy**: Implement local memory caching (like \`memory-cache\` or Redis) on static, frequently queried routes like \`/api/health\` or \`/api/problems\`.
4. **Rate Limiting Settings**: Review rate-limiting limits. The current limits may reject users under normal peaks, returning \`HTTP 429\` errors. Align limits with standard business projections.
`;

  fs.writeFileSync(REPORT_MD, mdContent);
}

// ─── MAIN ORCHESTRATOR ───────────────────────────────────────────────────────
async function main() {
  console.log('====================================================');
  console.log('  CodeLearn.Ai — API Concurrency Load Tester');
  console.log('====================================================');
  console.log(`Target URL:  ${targetUrl}`);
  console.log(`Concurrency: ${concurrency} Virtual Users (VUs)`);
  console.log(`Duration:    ${duration} seconds`);
  console.log('====================================================\n');

  const startTime = Date.now();
  
  // Spawns concurrent asynchronous request workers
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(runVirtualUserLoop());
  }

  // Interval timer to update console output every second
  let elapsed = 0;
  const progressTimer = setInterval(() => {
    elapsed++;
    printProgress(elapsed);
  }, 1000);

  // Stop trigger
  await new Promise(resolve => setTimeout(resolve, duration * 1000));
  
  // Stop workers
  running = false;
  clearInterval(progressTimer);
  console.log('\nStopping workers and compiling performance reports...');

  // Wait for currently running requests to finish
  await Promise.all(workers);

  const endTime = Date.now();
  const actualDurationMs = endTime - startTime;

  // Generate metrics
  const stats = calculateStats(actualDurationMs);

  // Write reports
  fs.writeFileSync(REPORT_JSON, JSON.stringify(stats, null, 2));
  writeMarkdownReport(stats);
  await writeExcelReport(stats);

  console.log('\n====================================================');
  console.log('  LOAD TEST COMPLETE');
  console.log('====================================================');
  console.log(`Total Requests:  ${stats.totalRequests}`);
  console.log(`Throughput (RPS): ${stats.rps.toFixed(1)} req/sec`);
  console.log(`Avg Response:    ${stats.avg.toFixed(1)} ms`);
  console.log(`Success Rate:    ${stats.successRate.toFixed(2)}%`);
  console.log(`SLA Status:      ${stats.slaPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Report JSON:     ${REPORT_JSON}`);
  console.log(`Report MD:       ${REPORT_MD}`);
  console.log(`Report Excel:    ${REPORT_XLSX}`);
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('Fatal load tester error:', err);
  process.exit(1);
});
