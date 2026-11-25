// Calculator Full-Stack — Backend
// Plain Node.js, ONLY built-in modules (no npm install needed).
// The server does ALL the maths. The browser never computes anything.
//
// Run:  node server.js
// Then: http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_HISTORY = 50;
const MAX_BODY = 10 * 1024; // 10 KB

// ---------------------------------------------------------------------------
// History storage (data.json)
// ---------------------------------------------------------------------------
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.history)) return parsed;
  } catch (e) {
    // missing or corrupt -> start fresh
  }
  return { history: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let store = loadData();

function addToHistory(expression, result) {
  store.history.unshift({
    expression: expression,
    result: result,
    at: new Date().toISOString(),
  });
  if (store.history.length > MAX_HISTORY) {
    store.history.length = MAX_HISTORY;
  }
  saveData(store);
}

// ---------------------------------------------------------------------------
// Safe expression parser — hand-written recursive descent.
// NEVER eval() / Function(). Supports: + - * / % ( ) decimals, unary minus,
// and sqrt(...). Everything else is an error.
// Grammar:
//   expression := term (('+' | '-') term)*
//   term       := factor (('*' | '/' | '%') factor)*
//   factor     := '-' factor | primary
//   primary    := number | '(' expression ')' | 'sqrt' '(' expression ')'
// ---------------------------------------------------------------------------
class ParseError extends Error {}

class Parser {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  peek() {
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  next() {
    const ch = this.peek();
    this.pos += 1;
    return ch;
  }

  skipSpaces() {
    while (this.peek() === ' ' || this.peek() === '\t') this.pos += 1;
  }

  error(message) {
    throw new ParseError(message + ' (at position ' + (this.pos + 1) + ')');
  }

  parseExpression() {
    let value = this.parseTerm();
    for (;;) {
      this.skipSpaces();
      const op = this.peek();
      if (op !== '+' && op !== '-') break;
      this.next();
      const rhs = this.parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  parseTerm() {
    let value = this.parseFactor();
    for (;;) {
      this.skipSpaces();
      const op = this.peek();
      if (op !== '*' && op !== '/' && op !== '%') break;
      this.next();
      const rhs = this.parseFactor();
      if (op === '*') {
        value = value * rhs;
      } else if (op === '/') {
        if (rhs === 0) this.error('Cannot divide by zero');
        value = value / rhs;
      } else {
        if (rhs === 0) this.error('Cannot divide by zero');
        value = value % rhs;
      }
    }
    return value;
  }

  parseFactor() {
    this.skipSpaces();
    if (this.peek() === '-') {
      this.next();
      return -this.parseFactor();
    }
    if (this.peek() === '+') {
      this.next();
      return this.parseFactor();
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    this.skipSpaces();
    const ch = this.peek();

    if (ch === '(') {
      this.next();
      const value = this.parseExpression();
      this.skipSpaces();
      if (this.peek() !== ')') this.error("Expected ')'");
      this.next();
      return value;
    }

    // sqrt(...)
    if (this.input.startsWith('sqrt', this.pos)) {
      this.pos += 4;
      this.skipSpaces();
      if (this.peek() !== '(') this.error("Expected '(' after sqrt");
      this.next();
      const value = this.parseExpression();
      this.skipSpaces();
      if (this.peek() !== ')') this.error("Expected ')'");
      this.next();
      if (value < 0) this.error('Cannot take square root of a negative number');
      return Math.sqrt(value);
    }

    if ((ch >= '0' && ch <= '9') || ch === '.') {
      return this.parseNumber();
    }

    if (ch === '') this.error('Unexpected end of expression');
    this.error("Unexpected character '" + ch + "'");
  }

  parseNumber() {
    const start = this.pos;
    let seenDigit = false;
    let seenDot = false;
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (ch >= '0' && ch <= '9') {
        seenDigit = true;
        this.pos += 1;
      } else if (ch === '.' && !seenDot) {
        seenDot = true;
        this.pos += 1;
      } else {
        break;
      }
    }
    if (!seenDigit) this.error('Invalid number');
    const value = parseFloat(this.input.slice(start, this.pos));
    if (!Number.isFinite(value)) this.error('Number too large');
    return value;
  }
}

function evaluate(expression) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    throw new ParseError('Empty expression — type something first');
  }
  const parser = new Parser(expression);
  const value = parser.parseExpression();
  parser.skipSpaces();
  if (parser.pos < parser.input.length) {
    throw new ParseError(
      "Unexpected character '" + parser.input[parser.pos] + "' (at position " + (parser.pos + 1) + ')'
    );
  }
  if (!Number.isFinite(value)) throw new ParseError('Result is not a finite number');
  // Tidy up floating-point noise: 0.1 + 0.2 -> 0.3
  return Math.round(value * 1e10) / 1e10;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
    });
    res.end(data);
  });
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Request too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  // --- API: POST /api/calculate ---
  if (pathname === '/api/calculate' && req.method === 'POST') {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }
    try {
      const result = evaluate(body && body.expression);
      if (!body.preview) addToHistory(String(body.expression).trim(), result);
      sendJson(res, 200, { result: result });
    } catch (e) {
      sendJson(res, 400, { error: e.message || 'Invalid expression' });
    }
    return;
  }

  // --- API: GET /api/history ---
  if (pathname === '/api/history' && req.method === 'GET') {
    sendJson(res, 200, { history: store.history });
    return;
  }

  // --- API: POST /api/history/clear ---
  if (pathname === '/api/history/clear' && req.method === 'POST') {
    store.history = [];
    saveData(store);
    sendJson(res, 200, { ok: true });
    return;
  }

  // --- API: unknown route ---
  if (pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'Unknown API route' });
    return;
  }

  // --- Static files ---
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
    return;
  }
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  sendFile(res, filePath, CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream');
});

server.listen(PORT, () => {
  console.log('Calculator running at http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop.');
});
