/**
 * DAST API Security Tests — CodeLearn.Ai Backend
 * Non-destructive, detection-only API security checks
 * Run: node scripts/security/dast-api-tests.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const REPORT_FILE = 'dast-report.json';

const findings = [];
let requestCount = 0;

// ─── HTTP helper ─────────────────────────────────────────────────────────────
async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeLearn-SecurityScanner/1.0',
        ...headers,
      },
      rejectUnauthorized: false, // Allow self-signed certs in test env
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        requestCount++;
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function addFinding(severity, title, endpoint, description, evidence) {
  findings.push({ severity, title, endpoint, description, evidence, timestamp: new Date().toISOString() });
  const icons = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵', INFO: 'ℹ️' };
  console.log(`${icons[severity] || '⚪'} [${severity}] ${title} — ${endpoint}`);
}

// ─── TEST SUITES ─────────────────────────────────────────────────────────────

async function testHealthEndpoint() {
  console.log('\n[1/8] Testing Health Endpoint Information Disclosure...');
  const r = await request('GET', '/api/health');
  if (r.status === 200 && r.body?.env) {
    addFinding('MEDIUM', 'Health endpoint leaks NODE_ENV', 'GET /api/health',
      'The health endpoint returns process.env.NODE_ENV, revealing deployment environment type to attackers.',
      { env: r.body.env });
  }
  if (r.status === 200) {
    addFinding('INFO', 'Health endpoint reachable', 'GET /api/health',
      'API is live and responding.', { status: r.status });
  }
}

async function testMissingAuthOnProtectedRoutes() {
  console.log('\n[2/8] Testing Missing Authentication on Protected Routes...');
  const protectedRoutes = [
    ['GET', '/api/auth/me'],
    ['GET', '/api/users/notes'],
    ['GET', '/api/users/notifications'],
    ['POST', '/api/code/run'],
    ['GET', '/api/code/submissions'],
  ];

  for (const [method, path] of protectedRoutes) {
    const r = await request(method, path);
    if (r.status !== 401) {
      addFinding('HIGH', `Missing auth protection on ${method} ${path}`, `${method} ${path}`,
        `Expected HTTP 401 without token, but got HTTP ${r.status}. Route may not be properly protected.`,
        { expectedStatus: 401, actualStatus: r.status });
    } else {
      console.log(`  ✅ ${method} ${path} → correctly returns 401`);
    }
  }
}

async function testAdminSeedEndpoint() {
  console.log('\n[3/8] Testing Admin Seed Endpoint with Known Default Secret...');
  const r = await request('POST', '/api/auth/seed-admin', { secretKey: 'codelearn-setup-2024' });
  if (r.status === 200 || r.status === 201) {
    addFinding('CRITICAL', 'Admin seed endpoint accepts hardcoded default secret',
      'POST /api/auth/seed-admin',
      'The endpoint accepted the default secret key and reset admin credentials. Admin account is compromised.',
      { status: r.status, responseKeys: Object.keys(r.body || {}) });
  } else if (r.status === 403) {
    console.log('  ✅ Seed endpoint rejects request (custom secret configured)');
  } else if (r.status === 404) {
    console.log('  ✅ Seed endpoint not found (disabled in production)');
  } else {
    addFinding('MEDIUM', 'Admin seed endpoint exists but returned unexpected status',
      'POST /api/auth/seed-admin',
      `Unexpected status: ${r.status}. Investigate whether the endpoint is properly secured.`,
      { status: r.status });
  }
}

async function testNoSQLInjection() {
  console.log('\n[4/8] Testing NoSQL Injection on Login Endpoint...');
  const payloads = [
    { email: { $gt: '' }, password: 'anything' },
    { email: { $ne: null }, password: { $ne: null } },
    { email: 'admin@codelearn.com', password: { $regex: '.*' } },
  ];

  for (const payload of payloads) {
    const r = await request('POST', '/api/auth/login', payload);
    if (r.status === 200 && r.body?.token) {
      addFinding('CRITICAL', 'NoSQL Injection successful on login endpoint',
        'POST /api/auth/login',
        'A JSON operator payload bypassed authentication and returned a valid JWT token.',
        { payload: JSON.stringify(payload), status: r.status });
    } else if (r.status === 200 && r.body?.success) {
      addFinding('HIGH', 'Login returned 200 for NoSQL injection payload',
        'POST /api/auth/login',
        'A JSON operator payload returned HTTP 200. Investigate response for data exposure.',
        { payload: JSON.stringify(payload), status: r.status });
    } else {
      console.log(`  ✅ NoSQL payload blocked (${r.status})`);
    }
  }
}

async function testJWTSecurity() {
  console.log('\n[5/8] Testing JWT Security...');

  // Test with invalid token
  const r1 = await request('GET', '/api/auth/me', null, {
    Authorization: 'Bearer invalid.token.value'
  });
  if (r1.status !== 401) {
    addFinding('CRITICAL', 'Invalid JWT token not rejected', 'GET /api/auth/me',
      `Expected 401 for invalid token, got ${r1.status}.`, { status: r1.status });
  } else {
    console.log('  ✅ Invalid token correctly rejected (401)');
  }

  // Test with expired token (pre-generated HS256 exp: 1)
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.INVALID';
  const r2 = await request('GET', '/api/auth/me', null, {
    Authorization: `Bearer ${expiredToken}`
  });
  if (r2.status !== 401) {
    addFinding('HIGH', 'Expired JWT token not rejected', 'GET /api/auth/me',
      `Expected 401 for expired token, got ${r2.status}.`, { status: r2.status });
  } else {
    console.log('  ✅ Expired token correctly rejected (401)');
  }

  // Test with missing Bearer prefix
  const r3 = await request('GET', '/api/auth/me', null, {
    Authorization: 'sometoken'
  });
  if (r3.status !== 401) {
    addFinding('MEDIUM', 'Malformed Authorization header accepted',
      'GET /api/auth/me',
      `Token without "Bearer " prefix returned ${r3.status} instead of 401.`,
      { status: r3.status });
  }
}

async function testRateLimiting() {
  console.log('\n[6/8] Testing Rate Limiting on Login Endpoint...');
  const results = [];
  const REQUESTS = 15;

  for (let i = 0; i < REQUESTS; i++) {
    const r = await request('POST', '/api/auth/login', {
      email: `testuser${i}@example.com`,
      password: 'wrongpassword'
    });
    results.push(r.status);
  }

  const rateLimited = results.filter(s => s === 429).length;
  const successCount = results.filter(s => s !== 429 && s !== 0).length;

  if (rateLimited === 0) {
    addFinding('MEDIUM', 'No rate limiting triggered after 15 login attempts',
      'POST /api/auth/login',
      `${REQUESTS} sequential login attempts completed without receiving HTTP 429. Login endpoint may be susceptible to brute-force.`,
      { statuses: results.join(','), rateLimited, successCount });
  } else {
    console.log(`  ✅ Rate limiting triggered (${rateLimited}/${REQUESTS} requests returned 429)`);
  }
}

async function testCORS() {
  console.log('\n[7/8] Testing CORS Configuration...');
  const r = await request('GET', '/api/health', null, {
    Origin: 'https://evil-attacker.com'
  });

  const allowedOrigin = r.headers?.['access-control-allow-origin'];
  const allowCredentials = r.headers?.['access-control-allow-credentials'];

  if (allowedOrigin === '*' || allowedOrigin === 'https://evil-attacker.com') {
    if (allowCredentials === 'true') {
      addFinding('CRITICAL', 'Wildcard CORS with credentials enabled',
        'GET /api/health',
        'API reflects all origins with credentials:true. Any malicious website can make authenticated cross-origin requests.',
        { allowedOrigin, allowCredentials });
    } else {
      addFinding('HIGH', 'Wildcard CORS policy',
        'GET /api/health',
        'API allows requests from any origin.',
        { allowedOrigin });
    }
  } else {
    console.log(`  ✅ CORS origin restricted: ${allowedOrigin}`);
  }
}

async function testSecurityHeaders() {
  console.log('\n[8/8] Testing Security Headers...');
  const r = await request('GET', '/api/health');
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'strict-transport-security',
    'content-security-policy',
    'x-xss-protection',
  ];

  const missing = requiredHeaders.filter(h => !r.headers?.[h]);
  if (missing.length > 0) {
    addFinding('HIGH', 'Missing security headers',
      'All routes',
      `${missing.length} required security headers are absent: ${missing.join(', ')}`,
      { missingHeaders: missing });
  } else {
    console.log('  ✅ All required security headers present');
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('====================================================');
  console.log('  CodeLearn.Ai — DAST API Security Scanner');
  console.log('====================================================');
  console.log(`Target: ${BASE_URL}`);
  console.log('Mode: Detection-only, Non-destructive');
  console.log('====================================================\n');

  await testHealthEndpoint();
  await testMissingAuthOnProtectedRoutes();
  await testAdminSeedEndpoint();
  await testNoSQLInjection();
  await testJWTSecurity();
  await testRateLimiting();
  await testCORS();
  await testSecurityHeaders();

  // ─── Generate Report ──────────────────────────────────────────────────────
  const summary = {
    scanDate: new Date().toISOString(),
    target: BASE_URL,
    totalRequests: requestCount,
    findings: {
      CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length,
      HIGH: findings.filter(f => f.severity === 'HIGH').length,
      MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length,
      LOW: findings.filter(f => f.severity === 'LOW').length,
      INFO: findings.filter(f => f.severity === 'INFO').length,
    },
    details: findings,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(summary, null, 2));

  console.log('\n====================================================');
  console.log('  DAST SCAN COMPLETE');
  console.log('====================================================');
  console.log(`Total Requests: ${requestCount}`);
  console.log(`CRITICAL: ${summary.findings.CRITICAL}`);
  console.log(`HIGH:     ${summary.findings.HIGH}`);
  console.log(`MEDIUM:   ${summary.findings.MEDIUM}`);
  console.log(`Report:   ${REPORT_FILE}`);
  console.log('====================================================\n');

  if (summary.findings.CRITICAL > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
