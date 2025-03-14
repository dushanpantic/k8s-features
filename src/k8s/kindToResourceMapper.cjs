const { getAsync } = require('./http.cjs');
const { ExpiringMap } = require('../util/expiringMap.cjs');
/**
 * @typedef ListResponseType
 * @property {import('node:http').IncomingMessage} response
 * @property {import("@kubernetes/client-node").V1APIResourceList} body
 */

class KindToResourceMapper {

  /**
   * @param {import("@kubernetes/client-node").KubeConfig} kc
   */
  constructor(kc) {
    /**
     * @type {import("@kubernetes/client-node").KubeConfig}
     * @private
     * @readonly
     */
    this.kc = kc;

    /**
     * @type {Map<string, import("@kubernetes/client-node").V1APIResourceList>}
     * @private
     * @readonly
     */
    this.cache = new ExpiringMap(3000);

    /**
     * @private
     * @readonly
     */
    this.opts = undefined;
  }

  /**
   * @param {string} apiVersion
   * @returns {Promise<import("@kubernetes/client-node").V1APIResource[]>}
   */
  async getAllResourcesFromApiVersion(apiVersion) {
    if (this.cache.has(apiVersion)) {
      return this.cache.get(apiVersion).resources;
    }

    await this.loadApiVersion(apiVersion);

    return this.cache.get(apiVersion).resources;
  }

  /**
   *
   * @param {string} apiVersion
   * @param {string} kind
   * @returns {Promise<import("@kubernetes/client-node").V1APIResource | undefined>}
   */
  async getResourceFromKind(apiVersion, kind) {
    if (this.cache.has(apiVersion)) {
      const resource = this.cache.get(apiVersion).resources.find((r) => r.kind === kind);
      if (resource) {
          return resource;
      }
    }

    await this.loadApiVersion(apiVersion);

    const resource = this.cache.get(apiVersion).resources.find((r) => r.kind === kind);
    if (resource) {
        return resource;
    }

    return undefined;
  }

  /**
   * @param {string} apiVersion
   * @returns {Promise<void>}
   * @protected
   */
  async loadApiVersion(apiVersion) {
    const url = this.apiVersionUrl(this.kc.getCurrentCluster().server, apiVersion);
    if (!this.opts) {
      this.opts = {};
      await this.kc.applyToHTTPSOptions(this.opts);
    }
    /**
     * @type {ListResponseType}
     */
    const resp = await getAsync(url, this.opts);
    this.cache.set(apiVersion, resp.body);
  }

  /**
   *
   * @param {string} basePath
   * @param {string} apiVersion
   * @returns {string}
   * @protected
   */
  apiVersionUrl(basePath, apiVersion) {
    const api = apiVersion.includes('/') ? 'apis' : 'api';
    return [basePath, api, apiVersion].join('/');
  }

}

module.exports = {
  KindToResourceMapper,
};
