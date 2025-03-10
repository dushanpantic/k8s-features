const { When } = require('@cucumber/cucumber');

When(
  'resource {word} is deleted',
  /**
   * @this import("../support/world.cjs").MyWorld
   * @param {string} alias
   * @returns {Promise}
   */
  async function (alias) {
    const item = this.getItem(alias);
    if (!item) {
      throw new Error(`Item ${alias} is not declared`);
    }
    const obj = item.getObj();
    if (!obj) {
      throw new Error(`Item ${alias} does not exist`);
    }
    await this.delete(obj);
  }
);
