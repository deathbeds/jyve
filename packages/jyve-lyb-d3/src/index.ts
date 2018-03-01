import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
const id = '@deathbeds/jyve-lyb-d3';

import '../style/index.css';

import * as d3 from 'd3';


const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (
    app: JupyterLab, jyve: IJyve
  ) => {
    jyve.lyb('d3', async function(ns: any) {
      ns['d3'] = d3;
    });
  }
};

export default extension;
