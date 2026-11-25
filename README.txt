Calculator — Full-Stack (Frontend + Backend)
==========================================

This folder has TWO calculators:
  1. calculator.c      - the console C calculator (old one, same file as before)
  2. server.js + public/index.html - the NEW full-stack web calculator

HOW IT WORKS
------------
- Frontend (public/index.html) only SHOWS the calculator and sends your
  expression to the server. It does NOT do any maths itself.
- Backend (server.js, plain Node.js, no install needed) evaluates the
  expression with a safe hand-written parser (NO eval()).
  It supports: +  -  *  /  %  ( )  decimals, unary minus, sqrt(...)
- Every "=" press calls POST /api/calculate on the server.
- History is saved in data.json (last 50 calculations, newest first).

HOW TO RUN (Windows CMD, one line at a time)
--------------------------------------------
1. Extract the ZIP. NOTE: the ZIP extracts NESTED — inside the first
   folder there is another folder with the same name. Open the INNER
   folder (the one that has server.js in it).

2. In CMD, go into that folder (adjust the path to where you extracted it):
   cd C:\Users\aryan\Downloads\calculator-fullstack\calculator-fullstack

3. Start the server:
   node server.js

4. Open in Chrome/Edge:
   http://localhost:3000

5. To stop the server, press Ctrl+C in the CMD window.

WHAT YOU CAN DO
---------------
- Click the buttons or type on your keyboard.
- Enter = equals, Esc = clear, Backspace = delete one character.
- Buttons: 0-9, ., +, -, x, /, %, ( ), =, C, backspace, +/-, square root,
  x squared, 1/x.
- The result under the expression is LIVE — it comes from the server
  as you type (but is only saved to history when you press "=").
- History panel on the right: click any old calculation to reuse it.
  "Clear all" wipes the history (data.json becomes empty again).

API (for the curious)
---------------------
- POST /api/calculate  { "expression": "12+7*3" }  ->  { "result": 33 }
  Add "preview": true to calculate WITHOUT saving to history.
- GET  /api/history        ->  { "history": [...] }
- POST /api/history/clear  ->  { "ok": true }

No internet, no install, no account needed. Node.js is the only
requirement (check with: node --version).
