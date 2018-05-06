*** Settings ***
Library  SeleniumLibrary
Resource  Lab.robot

*** Variables ***
${BUSY_KERNEL}    css:.jp-Toolbar-kernelStatus.jp-FilledCircleIcon
${BUSY_PROMPT}    In [*]:

*** Keywords ***
Add and Run Cell
  [Arguments]   ${code}
  Click Element             css:.jp-NotebookPanel-toolbar .jp-AddIcon
  Sleep  0.1s
  Click Element             css:${CELL_CSS}
  Execute JavaScript
    ...    document.querySelector("${CELL_CSS}").CodeMirror.setValue(`${code}`)
  Click Element             css:.jp-RunIcon

Wait Until Kernel Is Idle
  Wait Until Page Does Not Contain Element    ${BUSY_KERNEL}
  Wait Until Page Does Not Contain            ${BUSY_PROMPT}
