import {
  flowRendererV2,
  flowStyles
} from "./chunk-5BV2GUEK.js";
import {
  flowDb,
  parser$1
} from "./chunk-6NOTM3FT.js";
import "./chunk-FI3X24ZI.js";
import "./chunk-OY7N3A5M.js";
import "./chunk-FKBD6CIM.js";
import "./chunk-Y7LAQE5J.js";
import "./chunk-6L3LR5EX.js";
import {
  require_dayjs_min,
  require_dist,
  require_purify,
  setConfig
} from "./chunk-CZJXQLXN.js";
import {
  init_define_import_meta_env
} from "./chunk-YRUDZAGT.js";
import {
  __toESM
} from "./chunk-F3UQABQJ.js";

// ../../node_modules/mermaid/dist/flowDiagram-v2-3b53844e.js
init_define_import_meta_env();
var import_dayjs = __toESM(require_dayjs_min(), 1);
var import_sanitize_url = __toESM(require_dist(), 1);
var import_dompurify = __toESM(require_purify(), 1);
var diagram = {
  parser: parser$1,
  db: flowDb,
  renderer: flowRendererV2,
  styles: flowStyles,
  init: (cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    setConfig({ flowchart: { arrowMarkerAbsolute: cnf.arrowMarkerAbsolute } });
    flowRendererV2.setConf(cnf.flowchart);
    flowDb.clear();
    flowDb.setGen("gen-2");
  }
};
export {
  diagram
};
//# sourceMappingURL=flowDiagram-v2-3b53844e-KOV5432O.js.map
