*** Settings **
Library  OperatingSystem
Library  Process
Library  SeleniumLibrary
Suite Teardown  Kill'em all


*** Variables ***
${BROWSER}       headlessfirefox

${TOKEN}         hopelesslyinsecure
${LAB_CMD}       jupyter-lab --no-browser --NotebookApp.token=${TOKEN} --port 18888
${HTTP_CMD}      python -m http.server --bind 127.0.0.1 19980
${DEMO_CMD}      ./scripts/demo.sh

${LAB_URL}       http://127.0.0.1:18888/lab?token=${TOKEN}
${OFFLINE_URL}   http://127.0.0.1:19980/


*** Test Cases **
The Jyve Kyrnels Have Entered The Lab
  Start Process             ${LAB_CMD}    shell=true
  Open Browser              ${LAB_URL}    ${BROWSER}
  Verify Kyrnels
  Capture Page Screenshot   00_kyrnels.png
  [Teardown]                Kill'em all

Jyve don't need no WebSocket
  Rebuild the Jyve Demo
  Start Process             ${HTTP_CMD}     shell=true  cwd=demo
  Open Browser              ${OFFLINE_URL}  ${BROWSER}
  Verify Kyrnels
  Capture Page Screenshot   01_kyrnels_offline.png
  [Teardown]                Kill'em all


*** Keywords ***
Wait for Splash Screen
  Wait Until Page Contains Element          jupyterlab-splash
  Wait Until Page Does Not Contain Element  jupyterlab-splash

Verify Kyrnels
  Wait for Splash Screen
  Page Should Contain                       Brython (unsafe)
  Page Should Contain                       CoffeeScript (unsafe)
  Page Should Contain                       JS (unsafe)
  Page Should Contain                       P5 (unsafe)
  Page Should Contain                       TypeScript (unsafe)

Kill'em all
  Close All Browsers
  Terminate All Processes    kill=True

Rebuild the Jyve Demo
  Remove Directory                 demo    recursive=true
  Run Process                      ${DEMO_CMD}
  Directory Should Exist           demo
  Directory Should Not Be Empty    demo    timeout=20
