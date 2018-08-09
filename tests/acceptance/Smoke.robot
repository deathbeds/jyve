*** Settings ***
Documentation     Some quick tests to see if we broke the build somehow.
Suite Teardown    Clean Up JupyterLab
Library           SeleniumLibrary
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Jyve.robot

*** Test Cases ***
The Jyve Kyrnels Have Entered The Lab
    [Documentation]    Does a server-backed JupyterLab open?
    Set Screenshot Directory    ${OUTPUT_DIR}/${BROWSER}/smoke/lab
    Start Jupyterlab
    Open JupyterLab with    ${BROWSER}
    Verify Kyrnels
    Capture Page Screenshot    00_kyrnels.png
    [Teardown]    Reset Application State and Close

Jyve don't need no WebSocket
    [Documentation]    Does a static demo open?
    Set Screenshot Directory    ${OUTPUT_DIR}/${BROWSER}/smoke/static
    Rebuild the Jyve Demo
    Start the Jyve Demo
    Open the Jyve Demo with    ${BROWSER}
    Verify Kyrnels
    Capture Page Screenshot    01_kyrnels_offline.png
    [Teardown]    Reset Application State and Close

*** Keywords ***
Verify Kyrnels
    [Documentation]    Roughly check whether the Launcher contains all the kernels
    Page Should Contain    Brython (unsafe)
    Page Should Contain    CoffeeScript (unsafe)
    Page Should Contain    JS (unsafe)
    Page Should Contain    P5 (unsafe)
    Page Should Contain    TypeScript (unsafe)
