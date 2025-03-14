const { Then } = require('@cucumber/cucumber');

Then(
  'eventually kind {word} of {word} does not exist',
  /**
   * @this import("../support/world.cjs").MyWorld
   * @param {string} kind
   * @param {string} apiVersion
   * @returns {Promise}
   */
  async function(kind, apiVersion) {
    await this.eventuallyKindDoesNotExist(kind, apiVersion);
  },
);
