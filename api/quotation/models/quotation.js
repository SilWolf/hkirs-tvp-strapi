"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const createAccountJournal = async (result) => {
  if (result.paidAt) {
    // try to find related account journal
    const count = await strapi.services["account-journal"].count({
      invoice: result.id,
    });

    if (count === 0) {
      strapi.services["account-journal"].create({
        invoice: result.id,
        title: `Payment on invoice "${result.name}"`,
        description: result.description,
        value: (result.items || []).reduce(
          (prev, curr) => prev + curr.quantity * curr.unitPrice,
          0
        ),
        files: result.paidReferences,
      });
    }
  }
};

module.exports = {
  lifecycles: {
    async afterCreate(result) {
      createAccountJournal(result);
    },

    async afterUpdate(result) {
      createAccountJournal(result);
    },
  },
};
