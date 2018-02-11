# jyve

[![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/deathbeds/jyve/master?urlpath=lab/tree/notebooks/index.ipynb)

Experimental, unsafe Jupyter Kernels in the Browser.


## Before
Install:
* JupyterLab >=0.31.5 from [pip](https://pypi.io/project/jupyterlab) or
  [conda](https://anaconda.org/conda-forge/jupyterlab)

## Install
```bash
# the core manager
jupyter labextension install @deathbeds/jyve-extension
# the individual kernels
jupyter labextension install @deathbeds/jyve-js-unsafe-extension
jupyter labextension install @deathbeds/jyve-coffee-unsafe-extension
# ...
```

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
