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
Jyve Kernels
    [Documentation]    Check a number of combinations of browsers, kernels and activities
    [Template]    Perform a Jyve Kernel actvitity
    # for app in ["Static", "JupyterLab"]:
    #    for browser in ["${FIREFOX}", "${CHROME}"]:
    #    for kernel in ['Brython', 'CoffeeScript', 'JS', 'P5', 'Pyodide', 'TypeScript']:
    #    for activity in ["Notebook"]:
    #    print(f"    {app}    {kernel}    {activity}    {browser}")
    Static    Brython    Notebook    ${FIREFOX}
    Static    CoffeeScript    Notebook    ${FIREFOX}
    Static    JS    Notebook    ${FIREFOX}
    Static    P5    Notebook    ${FIREFOX}
    Static    TypeScript    Notebook    ${FIREFOX}
    Static    Brython    Notebook    ${CHROME}
    Static    CoffeeScript    Notebook    ${CHROME}
    Static    JS    Notebook    ${CHROME}
    Static    P5    Notebook    ${CHROME}
    Static    Pyodide    Notebook    ${CHROME}
    Static    TypeScript    Notebook    ${CHROME}
    JupyterLab    Pyodide    Notebook    ${CHROME}
    JupyterLab    Brython    Notebook    ${FIREFOX}
    JupyterLab    CoffeeScript    Notebook    ${FIREFOX}
    JupyterLab    JS    Notebook    ${FIREFOX}
    JupyterLab    P5    Notebook    ${FIREFOX}
    JupyterLab    TypeScript    Notebook    ${FIREFOX}
    JupyterLab    Brython    Notebook    ${CHROME}
    JupyterLab    CoffeeScript    Notebook    ${CHROME}
    JupyterLab    JS    Notebook    ${CHROME}
    JupyterLab    P5    Notebook    ${CHROME}
    JupyterLab    TypeScript    Notebook    ${CHROME}

Experimental Jyve Kernels
    [Documentation]    These cases are expected to fail at this time
    [Tags]    noncritical
    [Template]    Perform a Jyve Kernel actvitity
    JupyterLab    Pyodide    Notebook    ${FIREFOX}
    Static    Pyodide    Notebook    ${FIREFOX}

*** Keywords ***
Perform a Jyve Kernel actvitity
    [Arguments]    ${app}    ${kernel}    ${activity}    ${browser}
    [Documentation]    Open a browser and do some kernel stuff
    Set Screenshot Directory    ${OUTPUT_DIR}/${browser}/kernels/${app}/${kernel}
    Run Keyword If    '${app}'=='Static'    Open the Jyve Demo with    ${browser}
    Run Keyword If    '${app}'=='JupyterLab'    Open JupyterLab with    ${browser}
    Wait for Splash Screen
    Sleep    1s
    Verify Kernel Activity Lifecycle    ${kernel}    ${activity}    &{FORTY_TWO}[${kernel}]    &{HELLO_WORLD}[${kernel}]

Verify Kernel Activity Lifecycle
    [Arguments]    ${kernel}    ${activity}    ${fortytwo}    ${hello}
    [Documentation]    Create a Kernel and verify some basic behavior
    Launch a new    ${kernel} (unsafe) — Jyve    ${activity}
    Capture Page Screenshot    0_load.png
    Add and Run Cell    ${fortytwo}
    Wait Until Kernel Is Idle
    Wait Until Keyword Succeeds    20s    1s    Element Should Contain    css:.jp-OutputArea-output    42
    Capture Page Screenshot    1_math.png
    Add and Run Cell    ${hello}
    Wait Until Kernel Is Idle
    Frame Should Contain    css:.jyv-Frame iframe    hello world
    Capture Page Screenshot    2_dom.png
