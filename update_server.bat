@echo off
echo Starting server update...
cd /d c:\myserver
git add .
git commit -m "update"
git push
echo Update completed!
pause