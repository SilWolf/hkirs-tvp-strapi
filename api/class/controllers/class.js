"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async me(ctx) {
    const user = ctx.state?.user;
    const { startAt, endAt } = ctx.query;
    if (user.role?.name === "Authenticated") {
      const cas = await strapi.services["cls-application"].find({
        user: user.id,
        clsStartAt_gte: startAt,
        clsStartAt_lte: endAt,
      });
      const clses = cas.map((ca) => ca.cls).filter((cls) => !!cls);

      return sanitizeEntity(clses, { model: strapi.models["class"] });
    } else if (user.role?.name === "Staff") {
      const clses = await strapi.services["class"].find({
        startAt_gte: startAt,
        startAt_lte: endAt,
      });

      return sanitizeEntity(clses, { model: strapi.models["class"] });
    }
    return {};
  },

  async postApplicationAndCheckout(ctx) {
    const user = ctx.state?.user;
    if (!user || user.role?.name !== "Authenticated") {
      ctx.forbidden();
    }

    const { id } = ctx.params;
    const cls = await strapi.services["class"].findOne({ id });

    const { name, gender, age, hkid } = ctx.request.body;
    const entity = await strapi.services["cls-application"].create({
      cls: cls.id,
      user: user.id,
      name,
      gender,
      age,
      hkid,
      clsStartAt: cls.startAt,
      clsEndAt: cls.endAt,
    });
    const createdClsApplication = sanitizeEntity(entity, {
      model: strapi.models["cls-application"],
    });

    const stripe = require("../../../helpers/stripe.helper");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "hkd",
            product_data: {
              name: cls.course.name,
            },
            unit_amount: cls.price * 100,
          },
          quantity: 1,
        },
      ],
      customer: user.strapiCustomerId,
      metadata: {
        userId: user.id,
        clsId: cls.id,
        caId: createdClsApplication.id,
      },
      mode: "payment",
      success_url: `${process.env.APP_DOMAIN_NAME}/student/cls-applications/${createdClsApplication.id}?success=true`,
      cancel_url: `${process.env.APP_DOMAIN_NAME}/student/cls-applications/${createdClsApplication.id}?canceled=true`,
    });

    return { ...createdClsApplication, _stripeSessionId: session.id };
  },
};
