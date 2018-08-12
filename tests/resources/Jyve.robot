*** Settings ***
Library           OperatingSystem
Library           Process
Resource          Lab.robot

*** Variables ***
${DEMO_CMD}       ./scripts/demo.sh
${HTTP_CMD}       python -m jyve.server --bind 127.0.0.1 19980
${DEMO_URL}       http://127.0.0.1:19980/

*** Keywords ***
Start the Servers
    [Documentation]   Stary JupyterLab and the static demo server
    Start Jupyterlab
    Rebuild the Jyve Demo
    Start the Jyve Demo

Rebuild the Jyve Demo
    [Documentation]    Use nbconvert (and wget) to rebuild the static demo site
    Remove Directory    demo    recursive=true
    Run Process    ${DEMO_CMD}
    Directory Should Exist    demo
    Directory Should Not Be Empty    demo    timeout=20

Start the Jyve Demo
    [Documentation]    Serve the static demo
    Start Process    ${HTTP_CMD}    shell=true    cwd=demo     stderr=STDOUT    stdout=${OUTPUT_DIR}/static.log

Open the Jyve Demo with
    [Arguments]    ${browser}
    [Documentation]    Open the browser to the static demo
    Open Browser    ${DEMO_URL}    ${browser}
    Sleep    1s
