'use strict';

const fs = require('fs');
const path = require('path');
const xml2map = require('xml2map');

exports.dumpXML = async function () {

  xml = xml.replace(/content-desc=\"\"/g, 'content-desc="null"');
  const tempDir = path.join(__dirname, '..', '.temp');
  _.mkdir(tempDir);
  const xmlFilePath = path.join(tempDir, 'android.json');
  const hierarchy = xml2map.tojson(xml).hierarchy;

  const adaptor = function (node) {
    if (node.bounds) {
      const bounds = node.bounds.match(/[\d\.]+/g);

      // [ x, y, width, height]
      node.bounds = [
        ~~bounds[0],
        ~~bounds[1],
        bounds[2] - bounds[0],
        bounds[3] - bounds[1],
      ];
    }

    if (node.node) {
      node.nodes = node.node.length ? node.node : [node.node];
      node.nodes.forEach(adaptor);
      delete node.node;
    }
    return node;
  };

  var origin = _.filter(hierarchy.node, i => i !== null && typeof i === 'object' && i.package !== 'com.android.systemui');
  var data = adaptor(origin[0]);
  fs.writeFileSync(xmlFilePath, JSON.stringify(data), 'utf8');
};
