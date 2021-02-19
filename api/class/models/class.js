"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const format = (data) => {
  if (data.lessons) {
    data.startAt = data.lessons[0].startAt;
    data.endAt = data.lessons[data.lessons.length - 1].endAt;
  }
};

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      format(data);
    },
    async beforeUpdate(params, data) {
      format(data);
    },
  },
};
