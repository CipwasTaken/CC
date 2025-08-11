\
@echo off
REM Creates a venv, activates it, installs deps, and runs the app.
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python app.py
