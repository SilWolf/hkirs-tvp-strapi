"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findClses(ctx) {
    const { id } = ctx.params;
    const _query = {
      ...ctx.query,
      course: id,
    };

    let entities;
    if (ctx.query._q) {
      entities = await strapi.services["class"].search(_query);
    } else {
      entities = await strapi.services["class"].find(_query);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["class"] })
    );
  },
};
