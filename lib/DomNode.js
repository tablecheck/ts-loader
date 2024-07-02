export default class DomNode {
  constructor(nodeInfo) {
    this.nodeInfo = nodeInfo;
  }

  getNodeAttributes = () => {
    const { type, module = false } = this.nodeInfo;
    if (type === 'js') {
      return { element: 'script', type: module ? 'module' : 'text/javascript' };
    }
    if (type === 'css') {
      return {
        element: 'link',
        type: 'text/css',
        rel: 'stylesheet'
      };
    }
    throw new Error(`Unknown node type: ${type}`);
  };

  static updateNodeAttributes = (node, attributes) => {
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        node.setAttribute(key, attributes[key]);
      });
    }
  };

  createRemoteNode = () => {
    const { element, ...attributes } = this.getNodeAttributes();

    return new Promise((resolve, reject) => {
      const node = document.createElement(element);

      DomNode.updateNodeAttributes(node, attributes);
      DomNode.updateNodeAttributes(node, this.nodeInfo.attributes);

      node.onload = resolve;

      node.onerror = (error) => {
        if (this.nodeInfo.optional) {
          return resolve();
        }
        console.error('error loading: ', this.nodeInfo, error);
        return reject(error);
      };

      node.setAttribute(
        element === 'script' ? 'src' : 'href',
        this.nodeInfo.path
      );

      document.body.appendChild(node);
    });
  };
}
