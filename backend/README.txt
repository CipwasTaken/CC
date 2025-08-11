Server Monitor Backend (Flask)
==============================

Quick start (Windows, using Command Prompt):

1) Open Command Prompt (not PowerShell) in this folder.
2) Create & activate virtual environment, install dependencies, and run:
   python -m venv venv
   venv\Scripts\activate.bat
   pip install -r requirements.txt
   python app.py

3) Visit: http://127.0.0.1:5000/

Test endpoints:
- GET  /                -> 'Server Monitor API is running.'
- GET  /healthz         -> {"status":"ok"}
- GET  /api/alerts
- POST /api/alerts      -> JSON body: {"type":"Test","message":"Hello","severity":"Warning"}
- GET  /api/diagnostics
- POST /api/diagnostics -> JSON body: {"cpu_usage":42.5,"memory_usage":61.0,"disk_usage":70.2}

If PowerShell blocks activation, either use Command Prompt or run:
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
then activate again.
