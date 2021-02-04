"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterCreate(result) {
      const inventory = await strapi.services.inventory.findOne({
        id: result.inventory,
      });
      if (inventory) {
        await strapi.services.inventory.update(
          { id: inventory.id },
          { ...inventory, amount: inventory.amount + result.quantity }
        );
      }
    },
  },
};
