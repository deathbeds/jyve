*** Settings ***
Library           OperatingSystem
Library           Process
Resource          Lab.robot

*** Variables ***
${DEMO_CMD}       ./scripts/demo.sh
${HTTP_CMD}       python -m http.server --bind 127.0.0.1 19980
${DEMO_URL}       http://127.0.0.1:19980/

*** Keywords ***
Rebuild the Jyve Demo
    [Documentation]    Use nbconvert (and wget) to rebuild the static demo site
    Remove Directory    demo    recursive=true
    Run Process    ${DEMO_CMD}
    Directory Should Exist    demo
    Directory Should Not Be Empty    demo    timeout=20

Start the Jyve Demo
    [Documentation]    Serve the static demo
    Start Process    ${HTTP_CMD}    shell=true    cwd=demo

Open the Jyve Demo with
    [Arguments]    ${browser}
    [Documentation]    Open the browser to the static demo
    Open Browser    ${DEMO_URL}    ${browser}
    Wait for Splash Screen
    Sleep    1s
