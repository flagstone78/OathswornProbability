:loop
git pull
call npm start
if %ERRORLEVEL%==0 goto loop