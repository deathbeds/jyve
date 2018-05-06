*** Settings **
Library         SeleniumLibrary
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Jyve.robot
Suite Teardown  Kill'em all

*** Test Cases **
The Jyve Kyrnels Have Entered The Lab
  Start Jupyterlab
  Open JupyterLab with      ${BROWSER}
  Verify Kyrnels
  Capture Page Screenshot   00_kyrnels.png
  [Teardown]                Reset Application State and Close

Jyve don't need no WebSocket
  Rebuild the Jyve Demo
  Start the Jyve Demo
  Open the Jyve Demo with   ${BROWSER}
  Verify Kyrnels
  Capture Page Screenshot   01_kyrnels_offline.png
  [Teardown]                Reset Application State and Close

*** Keywords ***
Verify Kyrnels
  Wait for Splash Screen
  Page Should Contain                       Brython (unsafe)
  Page Should Contain                       CoffeeScript (unsafe)
  Page Should Contain                       JS (unsafe)
  Page Should Contain                       P5 (unsafe)
  Page Should Contain                       TypeScript (unsafe)
