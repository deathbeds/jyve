*** Settings ***
Library           SeleniumLibrary
Resource          Lab.robot

*** Variables ***
${BUSY_KERNEL}    css:.jp-Toolbar-kernelStatus.jp-FilledCircleIcon
${BUSY_PROMPT}    In [*]:

*** Keywords ***
Add and Run Cell
    [Arguments]    ${code}
    [Documentation]    Add a code cell to the currently active notebook and run it
    Click Element    css:.jp-NotebookPanel-toolbar .jp-AddIcon
    Sleep    0.1s
    Click Element    css:${CELL_CSS}
    Execute JavaScript    document.querySelector("${CELL_CSS}").CodeMirror.setValue(`${code}`)
    Click Element    css:.jp-RunIcon

Make a Hello World
    [Arguments]    ${kernel}    ${category}
    [Documentation]    Make a new Python Notebook or Console
    Launch a new    ${kernel}    ${category}
    Add and Run Cell    for i in range(10):\n\tprint("Hello World")

Wait Until Kernel Is Idle
    [Documentation]    Wait for the kernel to be busy, and then stop being busy
    Wait Until Keyword Succeeds    30s    1s    Wait Until Page Does Not Contain Element    ${BUSY_KERNEL}
    Wait Until Page Does Not Contain    ${BUSY_PROMPT}
