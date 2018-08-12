*** Settings ***
Documentation     Jyve provides Kernels for languages that work in-browser
Test Teardown     Close All Browsers
Library           SeleniumLibrary
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Jyve.robot
Resource          ../resources/Notebook.robot
Resource          ../resources/Kernels.robot

*** Test Cases ***
Chrome: Static: Kernels
    [Documentation]    Fire up an Activity with a Jyve Kernel without a Server
    [Setup]    Start Testing Static Activities    ${CHROME}
    Set Tags    browser:chrome
    Verify Kernel Basics

Chrome: JupyterLab: Kernels
    [Documentation]    Fire up an Activity with a Jyve Kernel in a full JupyterLab
    [Setup]    Start Testing JupyterLab Activities    ${CHROME}
    Set Tags    browser:chrome
    Verify Kernel Basics

Firefox: JupyterLab: Kernels
    [Documentation]    Fire up an Activity with a Jyve Kernel in a full JupyterLab
    [Setup]    Start Testing JupyterLab Activities    ${FIREFOX}
    Set Tags    browser:ff
    Verify Kernel Basics

Firefox: Static: Kernels
    [Documentation]    Fire up an Activity with a Jyve Kernel without a Server
    [Setup]    Start Testing Static Activities    ${FIREFOX}
    Set Tags    browser:ff
    Verify Kernel Basics

*** Keywords ***
Verify Kernel Basics
    [Documentation]    Do some basic activities with kernels
    : FOR    ${kernel}    IN    @{KERNELS}
    \    Verify Kernel Activity Lifecycle    ${kernel}    Notebook    &{FORTY_TWO}[${kernel}]    &{HELLO_WORLD}[${kernel}]

Start Testing Static Activities
    [Arguments]    ${browser}
    [Documentation]    Some demo startup stuff
    Set Tags    app:static
    Set Screenshot Directory    ${OUTPUT_DIR}/${browser}/kernels/static/
    Open the Jyve Demo with    ${browser}

Start Testing JupyterLab Activities
    [Arguments]    ${browser}
    [Documentation]    Some startup stuff
    Set Tags    app:lab
    Set Screenshot Directory    ${OUTPUT_DIR}/${browser}/kernels/lab/
    Open JupyterLab with    ${browser}

Verify Kernel Activity Lifecycle
    [Arguments]    ${kernel}    ${activity}    ${fortytwo}    ${hello}
    [Documentation]    Create a Kernel and verify some basic behavior
    Execute Javascript    window.alert = window.onbeforeunload = function() {};
    Execute JupyterLab Command    Reset Application State
    Run Keyword And Ignore Error    Handle Alert    ACCEPT    timeout=1s
    Wait for Splash Screen
    Launch a new    ${kernel} (unsafe) — Jyve    ${activity}
    Capture Page Screenshot    ${kernel}/${activity}_0.png
    Add and Run Cell    ${fortytwo}
    Wait Until Kernel Is Idle
    Wait Until Keyword Succeeds    20s    1s    Element Should Contain    css:.jp-OutputArea-output    42
    Capture Page Screenshot    ${kernel}/${activity}_1_run.png
    Add and Run Cell    ${hello}
    Wait Until Kernel Is Idle
    Frame Should Contain    css:.jyv-Frame iframe    hello world
    Capture Page Screenshot    ${kernel}/${activity}_2_win.png
