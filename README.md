# jyve

[![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/deathbeds/jyve/master?urlpath=lab/tree/index.ipynb)

Experimental, unsafe Jupyter Kernels in the Browser... from anywhere.

## IFrame-backed kernels
- [JS](./notebooks/JavaScript.ipynb)
- [CoffeeScript](./notebooks/CoffeeScript.ipynb)
- [Brython](./notebooks/Brython.ipynb)
- [TypeScript](./notebooks/TypeScript.ipynb)
- [P5](./notebooks/P5.ipynb)

## Convenience wrappers
- [PhosphorJS](./notebooks/Phosphor Playground.ipynb)
- [d3](./notebooks/d3 Playground.ipynb)

These kernels create their own widget next to a
Notebook (or Console). Restarting the kernel is equivalent to refreshing the
page.

## The Big Security Hole
For **extra danger**, these kernels also make the root `JupyterLab` application
instance available. In particular, this allows you to do things like:

```JavaScript
JupyterLab.commands.execute('notebook:create-new');
```

...to create a new notebook, though you can do
[just about anything](./notebooks/JupyterLab API.ipynb).


## Before
Install:
* JupyterLab >=0.31.10 from [pip](https://pypi.io/project/jupyterlab) or
  [conda](https://anaconda.org/conda-forge/jupyterlab)

## Install
```bash
# the core manager, required but doesn't do anything by itself
jupyter labextension install @deathbeds/jyve-extension
# the base kernel
jupyter labextension install @deathbeds/jyve-js-unsafe-extension
# specific compile-to-js kernels (needs the js kernel)
jupyter labextension install @deathbeds/jyve-brython-unsafe-extension
jupyter labextension install @deathbeds/jyve-coffee-unsafe-extension
jupyter labextension install @deathbeds/jyve-p5-unsafe-extension
jupyter labextension install @deathbeds/jyve-typescript-unsafe-extension
# extra packages, wrapped for convenience in jyve kernels
jupyter labextension install @deathbeds/jyve-lyb-d3
jupyter labextension install @deathbeds/jyve-lyb-phosphor
```

Or, since hey, **this is Jyve**:
```bash
jupyter labextension install \
  @deathbeds/jyve-brython-unsafe-extension \
  @deathbeds/jyve-coffee-unsafe-extension \
  @deathbeds/jyve-extension \
  @deathbeds/jyve-js-unsafe-extension \
  @deathbeds/jyve-lyb-d3 \
  @deathbeds/jyve-lyb-phosphor \
  @deathbeds/jyve-p5-unsafe-extension \
  @deathbeds/jyve-typescript-unsafe-extension \
  && jupyter labextension list
```


## Motivation
JupyterLab currently **disables execution of arbitrary JavaScript** in output
cells, Markdown documents and other places. This is a Good Thing,
and will help keep safe people who are primarily interested in learning and
doing science, research, and analysis and don't want to be bothered with
**cross-site scripting**, **click-jacking**, **privilege escalation** and the
other things that a Jupyter kernel and attached JavaScript Jyve session can do.

**However**, one of the beautiful elements of the Classic Notebook was the
ability to "build the ship while you are sailing it," e.g. writing the Python
and JavaScript for a new ipywidget in the same notebook, writing notebook
extensions. The IPython `%%javascript` magic, for example, will just emit a
nasty warning in JupyterLab. However, this immediately exposed you to a
relatively high likelihood of breaking other extensions, or even core behavior
itself.

**Jyve** fits somewhere between the two. A Jyve **Kyrnel** runs in JupyterLab
and has **full, unsafe access** to the full capability of your browser,
including:
- its own dedicated DOM in an `iframe`
- the JupyterLab `Application` instance, including
  - commands
  - the application shell
  - so much more...

Because it's _almost_ a real Jupyter Kernel, a Jyve Kyrnel can be used by tools
like the JupyterLab Notebook and the JupyterLab Console. But, because of its
relationship to JupyterLab and the browser, it can:
- load arbitrary code and data from anywhere on the internet
- integrate with the excellent local browser debugger tools
- run JupyterLab commands
- add new phosphor Widgets to the application shell

## Development

### Before
Install:
- [conda](https://conda.io/docs/user-guide/install/download.html)


### Setup
```bash
conda env update
source activate jyve-dev
./postBuild
```

## Build Once
```bash
jlpm build
jlpm lab:build
```

## Always Be Building
```bash
jlpm build --watch
# and in another terminal
./scripts/watch.sh
# and in another terminal
jlpm lab:watch
```
