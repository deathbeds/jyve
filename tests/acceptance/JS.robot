*** Settings **
Library         SeleniumLibrary
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Jyve.robot
Resource        ../resources/Notebook.robot
Suite Teardown  Kill'em all

*** Variables ***
${KERNEL_NAME}       JS (unsafe) — Jyve


*** Test Cases **
A JS Kernel Works in Lab
  Start Jupyterlab
  Open JupyterLab with      ${BROWSER}
  Verify Lifecycle
  [Teardown]                Reset Application State and Close

A JS Kernel Works in the static demo
  Rebuild the Jyve Demo
  Start the Jyve Demo
  Open the Jyve Demo with   ${BROWSER}
  Verify Lifecycle
  [Teardown]                Reset Application State and Close

*** Keywords ***
Verify Lifecycle
  Wait for Splash Screen
  Launch a new              ${KERNEL_NAME}    Notebook
  Add and Run Cell          1 + 1
  Wait Until Kernel Is Idle
