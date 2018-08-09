*** Variables ***
@{KERNELS}        Brython    CoffeeScript    JS    P5    Pyodide  TypeScript
# Code that adds up to 42
&{FORTY_TWO}      Brython=print(39 + 3)    CoffeeScript=6 * 7    JS=Math.round(Math.PI * 13.3)    P5=152 % 55    Pyodide="24"[::-1]   TypeScript=84 / 2
# Code that prints hello world in the iframe
${HW_BRYTHON}  __import__("browser").window.document.body.textContent = "hello world"
${HW_COFFEE}    document.write "hello world"
${HW_JS}        document.write("hello world")
${HW_P5}        ${HW_JS}
${HW_TS}        this.document.write("hello world")
${HW_PYODIDE}        raise NotImplementedError()
&{HELLO_WORLD}    Brython=${HW_BRYTHON}    CoffeeScript=${HW_COFFEE}    JS=${HW_JS}    P5=${HW_P5}   Pyodide=${HW_PYODIDE}  TypeScript=${HW_TS}
