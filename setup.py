import os
from setuptools import setup

name = "jyve"
__version__ = None


with open(os.path.join(name, "_version.py")) as fp:
    exec(fp.read())


setup_args = dict(
    name='jyve',
    version=__version__,
    description='Jyve for JupyterLab',
    url='http://github.com/deathbeds/jyve',
    author='Dead Pixel Collective',
    license='BSD-3-Clause',
    packages=['jyve'],
    setup_requires=['nbconvert', 'jupyterlab'],
    zip_safe=False,
    entry_points={'nbconvert.exporters': ['jyve = jyve.exporter:JyveExporter']}
)

if __name__ == "__main__":
    setup(**setup_args)
