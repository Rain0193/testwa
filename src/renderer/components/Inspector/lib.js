import XPath from "xpath";
import * as _request from "request";
export const request = _request.defaults({
  forever: true,
  json: true,
  baseUrl: "http://localhost:4444/wd/hub/session/"
  // headers: {
  //   "Content-type": "application/json"
  // }
});
export const getSource = cb => {
  request.get("/1/source", (err, res, body) => {
    cb(body);
  });
};
export const xmlToJSON = source => {
  let xmlDoc;
  let recursive = (xmlNode, parentPath, index) => {
    // Translate attributes array to an object
    let attrObject = {};
    for (let attribute of xmlNode.attributes || []) {
      attrObject[attribute.name] = attribute.value;
    }

    // Dot Separated path of indices
    let path =
      index !== undefined && `${!parentPath ? "" : parentPath + "."}${index}`;

    return {
      children: [...xmlNode.children].map((childNode, childIndex) =>
        recursive(childNode, path, childIndex)
      ),
      tagName: xmlNode.tagName,
      attributes: attrObject,
      xpath: getOptimalXPath(xmlDoc, xmlNode, [
        "name",
        "content-desc",
        "id",
        "accessibility-id"
      ]),
      path
    };
  };

  xmlDoc = new DOMParser().parseFromString(source, "text/xml");
  let sourceXML = xmlDoc.children[0];
  return recursive(sourceXML);
};

/**
 * Get an optimal XPath for a DOMNode
 * @param {*} domNode {DOMNode}
 * @param {string[]} uniqueAttributes Attributes we know are unique (defaults to just 'id')
 */
function getOptimalXPath(doc, domNode, uniqueAttributes = ["id"]) {
  try {
    // BASE CASE #1: If this isn't an element, we're above the root, return empty string
    if (!domNode.tagName || domNode.nodeType !== 1) {
      return "";
    }

    // BASE CASE #2: If this node has a unique attribute, return an absolute XPath with that attribute
    for (let attrName of uniqueAttributes) {
      const attrValue = domNode.getAttribute(attrName);
      if (attrValue) {
        let xpath = `//${domNode.tagName || "*"}[@${attrName}="${attrValue}"]`;
        let othersWithAttr;

        // If the XPath does not parse, move to the next unique attribute
        try {
          othersWithAttr = XPath.select(xpath, doc);
        } catch (ign) {
          continue;
        }

        // If the attribute isn't actually unique, get it's index too
        if (othersWithAttr.length > 1) {
          let index = othersWithAttr.indexOf(domNode);
          xpath = `(${xpath})[${index + 1}]`;
        }
        return xpath;
      }
    }

    // Get the relative xpath of this node using tagName
    let xpath = `/${domNode.tagName}`;

    // If this node has siblings of the same tagName, get the index of this node
    if (domNode.parentNode) {
      // Get the siblings
      const childNodes = [...domNode.parentNode.childNodes].filter(
        childNode =>
          childNode.nodeType === 1 && childNode.tagName === domNode.tagName
      );

      // If there's more than one sibling, append the index
      if (childNodes.length > 1) {
        let index = childNodes.indexOf(domNode);
        xpath += `[${index + 1}]`;
      }
    }

    // Make a recursive call to this nodes parents and prepend it to this xpath
    return getOptimalXPath(doc, domNode.parentNode, uniqueAttributes) + xpath;
  } catch (ign) {
    // If there's an unexpected exception, abort and don't get an XPath
    return null;
  }
}
let elVariableCounter = 0;
export const addRecordedActions = element => {
  const { attributes, xpath } = element;
  const STRATEGY_MAPPINGS = [
    ["name", "accessibility id"],
    ["content-desc", "accessibility id"],
    ["id", "id"],
    ["resource-id", "id"]
  ];
  for (let [strategyAlias, strategy] of STRATEGY_MAPPINGS) {
    if (attributes[strategyAlias])
      return {
        variableName: `el${elVariableCounter++}`,
        // variableType: "string",
        strategy,
        selector: attributes[strategyAlias]
      };
  }
  return {
    variableName: `el${elVariableCounter++}`,
    // variableType: "string",
    strategy: "xpath",
    selector: xpath
  };
};
export function selectHoveredElement(path, source) {
  let selectedElement = source;
  for (let index of path.split(".")) {
    selectedElement = selectedElement.children[index];
  }
  return { ...selectedElement };
}
export const selectElement = (path, expandedPaths) => {};

// async function main() {
//   request(
//     "http://localhost:4444/wd/hub/session/1/package/all",
//     (error, response, body) => {
//       console.log(body);
//       console.log(JSON.parse(JSON.parse(body).value));
//     }
//   );
//   // request(
//   //   {
//   //     url: "http://localhost:4444/wd/hub/session/1/appium/tap",
//   //     method: "POST",
//   //     json: {
//   //       x: evt.nativeEvent.offsetX * 2,
//   //       y: evt.nativeEvent.offsetY * 2
//   //     },
//   //     forever: true,
//   //     headers: {
//   //       "Content-type": "application/json"
//   //     }
//   //   },
//   //   console.log
//   // );
// }
// // main();
