# jyve

[![Build Status][travis-badge]][travis] [![Binder][binder-badge]][binder] [![npm-version][]][npm-search]

Experimental, unsafe, interactive Jupyter Kernel-like things in your browser. Try the [demo][].

[demo]: https://deathbeds.github.io/jyve
[travis]: https://travis-ci.org/deathbeds/jyve
[travis-badge]: https://travis-ci.org/deathbeds/jyve.svg?branch=master
[binder]: https://mybinder.org/v2/gh/deathbeds/jyve/master?urlpath=lab/tree/index.ipynb
[binder-badge]: https://mybinder.org/badge.svg
[npm-version]: https://badge.fury.io/js/%40deathbeds%2Fjyve.svg
[npm-search]: https://www.npmjs.com/search?q=jyve%20keywords%3Ajupyterlab-extension

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

- JupyterLab >=0.31.10 from [pip](https://pypi.io/project/jupyterlab) or
  [conda](https://anaconda.org/conda-forge/jupyterlab)

## Install

```bash
# the core manager, required but doesn't do anything by itself
jupyter labextension install @deathbeds/jyve
# the base kernel
jupyter labextension install @deathbeds/jyve-kyrnel-js-unsafe
# specific compile-to-js kernels (needs the js kernel)
jupyter labextension install @deathbeds/jyve-kyrnel-brython-unsafe
jupyter labextension install @deathbeds/jyve-kyrnel-coffee-unsafe
jupyter labextension install @deathbeds/jyve-kyrnel-p5-unsafe
jupyter labextension install @deathbeds/jyve-kyrnel-typescript-unsafe
# extra packages, wrapped for convenience in jyve kernels
jupyter labextension install @deathbeds/jyve-lyb-d3
jupyter labextension install @deathbeds/jyve-lyb-phosphor
```

Or, since hey, **This is Jyve**:

```bash
jupyter labextension install \
    @deathbeds/jyve \
    @deathbeds/jyve-kyrnel-brython-unsafe \
    @deathbeds/jyve-kyrnel-coffee-unsafe \
    @deathbeds/jyve-kyrnel-js-unsafe \
    @deathbeds/jyve-kyrnel-p5-unsafe \
    @deathbeds/jyve-kyrnel-typescript-unsafe \
    @deathbeds/jyve-lyb-d3 \
    @deathbeds/jyve-lyb-phosphor \
  && jupyter labextension list
```

## Motivation

JupyterLab currently **disables or limits the scope of of arbitrary JavaScript**
in output cells, Markdown documents and other places. This is a Good Thing,
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

**Jyve** fits somewhere between the two.

## Kyrnels

A Jyve **Kyrnel** runs in JupyterLab and has **full, unsafe access** to the
many of the capabilities of your browser, including:

- its own dedicated DOM in an `iframe`
- the JupyterLab `Application` instance, including
  - commands
  - the application shell
  - so much more...
- debugging with in-browser (or remote) tools
- `localStorage`, `IndexedDB` and other storage mechanisms

Because it's _almost_ a real Jupyter Kernel, a Jyve Kyrnel can be used by tools
like the JupyterLab Notebook and the JupyterLab Console. But, because of its
relationship to JupyterLab and the browser, it can:

- load arbitrary code and data from anywhere on the internet
- integrate with the excellent local browser debugger tools
- run JupyterLab commands
- add new phosphor Widgets to the application shell

## Lybs

JupyterLab, while very customizable, is still delivered as a series of
intentionally-unpredictable files which bundle many megabytes of JS, CSS, JSON
and other artifacts.

To make it easier to learn about key libraries inside JupyterLab (or
even external to it), a Jyve Lyb wraps up a library and makes it usable
directly inside every kyrnel.

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
jlpm watch
# and in another terminal
jupyter lab --watch
```
