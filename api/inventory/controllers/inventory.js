"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findLogs(ctx) {
    const { id } = ctx.params;

    const query = {
      ...ctx.query,
      inventory: id,
      _sort: "createdAt:DESC",
    };

    let entities;
    if (query._q) {
      entities = await strapi.services["inventory-log"].search(query);
    } else {
      entities = await strapi.services["inventory-log"].find(query);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["inventory-log"] })
    );
  },

  async createLog(ctx) {
    const { id } = ctx.params;
    const user = ctx.state?.user;
    ctx.request.body.inventory = id;
    ctx.request.body.user = user?.id;

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services["inventory-log"].create(data, { files });
    } else {
      entity = await strapi.services["inventory-log"].create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models["inventory-log"] });
  },
};
