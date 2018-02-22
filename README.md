# jyve

[![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/deathbeds/jyve/master?urlpath=lab/tree/index.ipynb)

Experimental, unsafe Jupyter Kernels in the Browser.

## IFrame-backed kernels
- [JS](./notebooks/JavaScript.ipynb)
- [CoffeeScript](./notebooks/CoffeeScript.ipynb)
- [Brython](./notebooks/Brython.ipynb)
- [TypeScript](./notebooks/TypeScript.ipynb)

These kernels create their own widget next to a
Notebook (or Console). Restarting the kernel is equivalent to refreshing the
page.

> 🤔 You can use []`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for some semi-persistent data.

For extra danger, these kernels also make the root `JupyterLab` application
instance available. In particular, this allows you to do things like:

```JavaScript
JupyterLab.commands.execute('notebook:create-new');
```

...to create a new notebook, though you can do
[just about anything](./notebooks/JupyterLab API.ipynb).


## Before
Install:
* JupyterLab >=0.31.8 from [pip](https://pypi.io/project/jupyterlab) or
  [conda](https://anaconda.org/conda-forge/jupyterlab)

## Install
```bash
# the core manager, required but doesn't do anything by itself
jupyter labextension install @deathbeds/jyve-extension
# the base kernel
jupyter labextension install @deathbeds/jyve-js-unsafe-extension
# specific compile-to-js kernels (needs the js kernel)
jupyter labextension install @deathbeds/jyve-coffee-unsafe-extension
jupyter labextension install @deathbeds/jyve-typescript-unsafe-extension
jupyter labextension install @deathbeds/jyve-brython-unsafe-extension
```

Or, since hey, this is Jyve:
```bash
jupyter labextension install \
  @deathbeds/jyve-brython-unsafe-extension \
  @deathbeds/jyve-coffee-unsafe-extension \
  @deathbeds/jyve-extension \
  @deathbeds/jyve-js-unsafe-extension \
  @deathbeds/jyve-typescript-unsafe-extension
```


## Motivation
JupyterLab currently disables execution of arbitrary JavaScript in output cells,
as you might get from the IPython `%%javascript` magic. This is a Good Thing,
and will help keep people who are primarily interested in learning and doing
science, research, and analysis and don't want to be bothered with cross-site
scripting, click jacking, privilege escalation and the other things that a
Jupyter kernel and attached JavaScript client can do.

However, one of the beautiful elements of the Classic Notebook was the ability
to "build the ship while you are sailing it," e.g. writing the Python and
JavaScript for a new ipywidget in the same notebook, writing notebook
extensions. However, this immediately exposed you to a relatively high
likelihood of breaking other extensions, or even core behavior iteself.

**Jyve** fits somewhere between the two. A Jyve Kernel runs in JupyterLab
and has access to the full capability of your browser, including its own
dedicated DOM, integration with the exellent local browser debugger tools.
Because it's _almost_ a real Jupyter Kernel, it can be used by tools like
the JupyterLab Notebook and the JupyterLab Console.

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
jupyter lab build
```

## Always Be Building
```bash
jlpm build --watch
# and in another terminal
jupyter lab build --watch --debug --no-browser
```
