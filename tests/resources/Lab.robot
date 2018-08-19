*** Settings ***
Library           Process
Library           BuiltIn
Library           SeleniumLibrary
Library           OperatingSystem

*** Variables ***
${CELL_CSS}       .jp-Notebook .jp-Cell:last-of-type .jp-InputArea-editor .CodeMirror
${TOKEN}          hopelesslyinsecure
${LAB_CMD}        jupyter-lab --no-browser --NotebookApp.token=${TOKEN} --port 18888
${LAB_URL}        http://localhost:18888/lab?token=${TOKEN}
${SPLASH_ID}      jupyterlab-splash
${SPINNER}        css:.jp-Spinner
${CMD_PAL_XPATH}    //div[contains(@class, "jp-mod-left")]//li[@title = "Command Palette"]//div
${CMD_PAL_INPUT}    css:.p-CommandPalette-input
${CMD_PAL_ITEM}    css:.p-CommandPalette-item
${TOP}            //div[@id='jp-top-panel']
${BAR_ITEM}       //div[@class='p-MenuBar-itemLabel']
${CARD}           //div[@class='jp-LauncherCard']
${DOCK}           //div[@id='jp-main-dock-panel']

*** Keywords ***
Wait for Splash Screen
    [Documentation]    Wait for the JupyterLab splash animation to run its course
    Wait Until Page Contains Element    ${SPLASH_ID}
    Wait Until Page Does Not Contain Element    ${SPLASH_ID}
    Sleep    0.1s

Launch a new
    [Arguments]    ${kernel}    ${category}
    [Documentation]    Use the JupyterLab launcher to launch Notebook or Console
    Click Element    ${CARD}[@title='${kernel}'][@data-category='${category}']
    Wait Until Page Does Not Contain Element    ${SPINNER}
    Wait Until Page Contains Element    css:${CELL_CSS}

Start JupyterLab
    [Documentation]    Start a Jupyter Notebook Server with JupyterLab
    Start Process    ${LAB_CMD}    shell=true    stderr=STDOUT    stdout=${OUTPUT_DIR}/lab.log

Click JupyterLab Menu
    [Arguments]    ${menu_label}
    [Documentation]    Click a top-level JupyterLab Menu bar, e.g. File, Help, etc.
    Wait Until Page Contains Element    ${TOP}${BAR_ITEM}[text() = '${menu_label}']
    Mouse Over    ${TOP}${BAR_ITEM}[text() = '${menu_label}']
    Click Element    ${TOP}${BAR_ITEM}[text() = '${menu_label}']

Click JupyterLab Menu Item
    [Arguments]    ${item_label}
    [Documentation]    Click a top-level JupyterLab Menu Item (not File, Help, etc.)
    ${item} =    Set Variable    //div[@class='p-Menu-itemLabel']
    Wait Until Page Contains Element    ${item}[text() = '${item_label}']
    Mouse Over    ${item}[text() = '${item_label}']
    Click Element    ${item}[text() = '${item_label}']

Open JupyterLab with
    [Arguments]    ${browser}
    [Documentation]    Start the given browser and wait for the animation
    Open Browser    ${LAB_URL}    ${browser}
    Wait for Splash Screen
    Sleep    1s

Execute JupyterLab Command
    [Arguments]    ${command}
    [Documentation]    Use the JupyterLab Command Palette to run a command
    Run Keyword And Ignore Error    Click Element   css:.jp-mod-accept
    Click Element    ${CMD_PAL_XPATH}
    Input Text    ${CMD_PAL_INPUT}    ${command}
    Wait Until Page Contains Element    ${CMD_PAL_ITEM}
    Click Element    ${CMD_PAL_ITEM}
    Run Keyword And Ignore Error    Click Element    ${CMD_PAL_XPATH}


Reset Application State and Close
    [Documentation]    Try to clean up after doing some things to the JupyterLab state
    Execute JupyterLab Command    Reset Application State
    Close Browser

Clean Up JupyterLab
    [Documentation]    Close all the browsers and stop all processes
    Close All Browsers
    Terminate All Processes    kill=True
