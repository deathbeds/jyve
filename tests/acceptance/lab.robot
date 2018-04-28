*** Variables ***
${BROWSER}  headlessfirefox
${TOKEN}    hopelesslyinsecure
${LAB_CMD}  jupyter-lab --no-browser --NotebookApp.token=${TOKEN}
${LAB_URL}  http://127.0.0.1:8888/lab?token=${TOKEN}


*** Settings **
Library  Process
Library  SeleniumLibrary

Suite Setup       Start Process              ${LAB_CMD}   shell=true
Suite Teardown    Terminate All Processes    kill=True


*** Test Cases **
The Jyve Kyrnels Have Entered The Building
  Open Browser              ${LAB_URL}  ${BROWSER}
  Wait Until Page Does Not Contain Element  id:jupyterlab-splash
  Page Should Contain                       Brython (unsafe)
  Page Should Contain                       CoffeeScript (unsafe)
  Page Should Contain                       JS (unsafe)
  Page Should Contain                       P5 (unsafe)
  Page Should Contain                       TypeScript (unsafe)
  Capture Page Screenshot   00_kyrnels.png
  [Teardown]    Close Browser
