@echo off
:: start cmd /k python Backend/ser.py
start cmd /k node Backend/server.js
start cmd /k cd /d ../ember-eye && npm run dev