"use strict";
const unparsed = require("koa-body/unparsed.js");
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async me(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      ctx.forbidden();
    }

    const _query = {
      user: user.id,
      _sort: "createdAt:DESC",
    };
    const entities = await strapi.services["cls-application"].find(_query);

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["cls-application"] })
    );
  },
  async checkoutComplete(ctx) {
    const stripe = require("../../../helpers/stripe.helper");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_CHECKOUT_COMPLETE;
    const payload = ctx.request.body[unparsed];
    const sig = ctx.request.header["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { caId } = session.metadata;

      await strapi.services["cls-application"].update(
        { id: caId },
        { isPaid: true, isConfirmed: true }
      );
    }

    return {};
  },
};
