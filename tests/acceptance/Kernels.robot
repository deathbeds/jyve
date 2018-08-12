*** Settings ***
Documentation     Jyve provides Kernels for languages that work in-browser
Suite Teardown    Clean Up JupyterLab
Library           SeleniumLibrary
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Jyve.robot
Resource          ../resources/Notebook.robot
Resource          ../resources/Kernels.robot

*** Test Cases ***
The Jyve Kernels Work as Static Interactive Applications
    [Documentation]    Fire up an Activity with a Jyve Kernel without a Server
    [Setup]    Start Testing Static Activities
    : FOR    ${kernel}    IN    @{KERNELS}
    \    Verify Kernel Activity Lifecycle    ${kernel}    Notebook    &{FORTY_TWO}[${kernel}]    &{HELLO_WORLD}[${kernel}]
    [Teardown]    Clean Up JupyterLab

The Jyve Kernels can be Authored in a Normal JupyterLab
    [Documentation]    Fire up an Activity with a Jyve Kernel in a full JupyterLab
    [Setup]    Start Testing JupyterLab Activities
    : FOR    ${kernel}    IN    @{KERNELS}
    \    Verify Kernel Activity Lifecycle    ${kernel}    Notebook    &{FORTY_TWO}[${kernel}]    &{HELLO_WORLD}[${kernel}]
    [Teardown]    Clean Up JupyterLab

*** Keywords ***
Start Testing Static Activities
    [Documentation]    Some demo startup stuff
    Set Screenshot Directory    ${OUTPUT_DIR}/${BROWSER}/kernels/static/
    Rebuild the Jyve Demo
    Start the Jyve Demo
    Open the Jyve Demo with    ${BROWSER}

Start Testing JupyterLab Activities
    [Documentation]    Some startup stuff
    Set Screenshot Directory    ${OUTPUT_DIR}/${BROWSER}/kernels/lab/
    Start Jupyterlab
    Open JupyterLab with    ${BROWSER}

Verify Kernel Activity Lifecycle
    [Arguments]    ${kernel}    ${activity}    ${fortytwo}    ${hello}
    [Documentation]    Create a Kernel and verify some basic behavior
    Execute Javascript    window.alert = window.onbeforeunload = function() {};
    Execute JupyterLab Command    Reset Application State
    Run Keyword And Ignore Error    Handle Alert    ACCEPT
    Wait for Splash Screen
    Launch a new    ${kernel} (unsafe) — Jyve    ${activity}
    Capture Page Screenshot    ${kernel}/${activity}_0.png
    Add and Run Cell    ${fortytwo}
    Wait Until Kernel Is Idle
    Wait Until Keyword Succeeds    30s    1s    Element Should Contain    css:.jp-OutputArea-output    42
    Capture Page Screenshot    ${kernel}/${activity}_1_run.png
    Add and Run Cell    ${hello}
    Wait Until Kernel Is Idle
    Frame Should Contain    css:.jyv-Frame iframe    hello world
    Capture Page Screenshot    ${kernel}/${activity}_2_win.png
