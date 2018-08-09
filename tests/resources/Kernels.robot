*** Variables ***
@{KERNELS}        Brython    CoffeeScript    JS    P5    TypeScript
&{FORTY_TWO}      Brython=print(39 + 3)    CoffeeScript=6 * 7    JS=Math.round(Math.PI * 13.3)    P5=152 % 55    TypeScript=84 / 2
&{HELLO_WORLD}    Brython=__import__("browser").window.document.body.textContent = "hello world"    CoffeeScript=document.write "hello world"    JS=document.write("hello world")    P5=document.write("hello world")    TypeScript=this.document.write("hello world")
