*** Settings ***
Documentation     Some quick tests to see if we broke the build somehow.
Suite Setup       Start the Servers
Suite Teardown    Clean Up JupyterLab
Test Teardown     Close All Browsers
Library           SeleniumLibrary
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Jyve.robot
Resource          ../resources/Kernels.robot

*** Test Cases ***
Firefox: Jyve don't need no WebSocket
    [Documentation]    Does a static demo open in Firefox?
    Set Tags    browser:ff
    Smoke test the static app    ${FIREFOX}

Firefox: The Jyve Kernels Have Entered the Lab
    [Documentation]    Does a server-backed JupyterLab open in Firefox?
    Set Tags    browser:ff
    Smoke test JupyterLab    ${FIREFOX}

Chrome: Jyve don't need no WebSocket
    [Documentation]    Does a static demo open in Chrome?
    Set Tags    browser:chrome
    Smoke test the static app    ${CHROME}

Chrome: The Jyve Kernels Have Entered the Lab
    [Documentation]    Does a server-backed JupyterLab open in Chrome?
    Set Tags    browser:chrome
    Smoke test JupyterLab    ${CHROME}

*** Keywords ***
Smoke test JupyterLab
    [Arguments]    ${browser}
    [Documentation]    Verify that JupyterLab still sorta works
    Set Tags    app:lab
    Set Screenshot Directory    ${OUTPUT_DIR}/${browser}/smoke/lab
    Open JupyterLab with    ${browser}
    Verify Kyrnels

Smoke test the static app
    [Arguments]    ${browser}
    [Documentation]    Verify that the static app at least kind of works
    Set Tags    app:static
    Set Screenshot Directory    ${OUTPUT_DIR}/${browser}/smoke/static
    Open the Jyve Demo with    ${browser}
    Verify Kyrnels

Verify Kyrnels
    [Documentation]    Roughly check whether the Launcher contains all the kernels
    Capture Page Screenshot    00_lab.png
    : FOR    ${kernel}    IN    @{KERNELS}
    \    Page Should Contain    ${kernel} (unsafe)
    Capture Page Screenshot    01_kyrnels.png
