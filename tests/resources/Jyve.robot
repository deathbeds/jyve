*** Settings **
Library  OperatingSystem
Library  Process


*** Variables ***
${DEMO_CMD}  ./scripts/demo.sh
${HTTP_CMD}  python -m http.server --bind 127.0.0.1 19980
${DEMO_URL}  http://127.0.0.1:19980/


*** Keywords ***
Rebuild the Jyve Demo
  Remove Directory                 demo    recursive=true
  Run Process                      ${DEMO_CMD}
  Directory Should Exist           demo
  Directory Should Not Be Empty    demo    timeout=20

Start the Jyve Demo
  Start Process             ${HTTP_CMD}     shell=true  cwd=demo

Open the Jyve Demo with
  [Arguments]   ${browser}
  Open Browser              ${DEMO_URL}  ${browser}
