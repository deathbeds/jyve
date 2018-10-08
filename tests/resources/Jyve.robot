*** Settings ***
Library           OperatingSystem
Library           Process
Resource          Lab.robot

*** Variables ***
${DEMO_CMD}       ./scripts/build_demo.sh
${HTTPS_CMD}      python ./scripts/serve_demo.py
${DEMO_URL}       https://127.0.0.1:8443/d/e/m/o/

*** Keywords ***
Rebuild the Jyve Demo
    [Documentation]    Use nbconvert (and wget) to rebuild the static demo site
    Remove Directory    demo    recursive=true
    Run Process    ${DEMO_CMD}
    Directory Should Exist    demo
    Directory Should Not Be Empty    demo    timeout=20

Start the Jyve Demo
    [Documentation]    Serve the static demo
    Start Process    ${HTTPS_CMD}    shell=true    stderr=STDOUT    stdout=${OUTPUT_DIR}/demo.log


Open the Jyve Demo with
    [Arguments]    ${browser}
    [Documentation]    Open the browser to the static demo
    Open Browser    ${DEMO_URL}    ${browser}
    Wait for Splash Screen
    Sleep    1s
