# Calculator — Full-Stack

A proper calculator with a real frontend and a real backend.

- **Frontend** (`public/index.html`): modern dark UI, all buttons (+ − × ÷, %, brackets, √, x², 1/x), keyboard support (Enter = equals, Esc = clear), history panel. The browser never calculates — every `=` calls the backend.
- **Backend** (`server.js`): plain Node.js, zero dependencies. Hand-written expression parser (no `eval()`). API: `POST /api/calculate`, `GET /api/history`, `POST /api/history/clear`. History is saved in `data.json`.
- **C version** (`calculator.c`): the same calculator as a console program in C. Compile with `gcc calculator.c -o calculator.exe` and run `calculator.exe`.

## Run it (Windows CMD)

```
cd calculator-fullstack
node server.js
```

Then open http://localhost:3000 in Chrome/Edge. Stop with Ctrl+C.

> Note: this app needs its Node server to run, so it does not work on GitHub Pages (Pages only serves static files). The repo is the code — run it on your PC.
