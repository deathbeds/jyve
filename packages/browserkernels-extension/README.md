# jupyterlab_browserkernels

Jupyter Kernels in the Browser


## Before
Install:
* JupyterLab

## Install
```bash
jupyter labextension install jupyterlab_browserkernels
```

## Development

### Before
Install:
- [conda](https://conda.io/docs/user-guide/install/download.html)


### Setup
```bash
conda env update
source activate jupyterlab_browserkernels-dev
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
