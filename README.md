# solos

Experimental, unsafe Jupyter Kernels in the Browser


## Before
Install:
* JupyterLab >=0.31.2

## Install
```bash
# the core manager
jupyter labextension install @deathbeds/browserkernels-extension
# the individual kernels
jupyter labextension install @deathbeds/browserkernels-js-unsafe-extension
# ...
```

## Development

### Before
Install:
- [conda](https://conda.io/docs/user-guide/install/download.html)


### Setup
```bash
conda env update
source activate solos
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
