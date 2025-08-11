Server Monitor Frontend (React)
===============================

Requirements: Node.js 18+ and npm

1) Extract this folder somewhere (e.g., Desktop).
2) In Command Prompt:
   cd <path-to>/server-monitor-frontend
   npm install
   npm start

Backend URL:
- Defined in .env.development as REACT_APP_API_BASE
- Default: http://127.0.0.1:5000

Pages:
- Dashboard: quick stats + diagnostics chart
- Alerts: list/filter/resolve, 'Seed sample batch' button
- Diagnostics: add/view diagnostics rows

Troubleshooting:
- If API calls fail, ensure backend is running and CORS is enabled.
- After editing .env files, restart `npm start`.
