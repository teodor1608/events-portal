const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Reservation",
  tableName: "reservations",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },

    eventId: {
      type: "integer",
      nullable: false,
    },

    qty: {
      type: "integer",
      nullable: false,
    },

    status: {
      type: "varchar",
      nullable: false,
      default: "HELD", // HELD | PAID | EXPIRED | CANCELLED
    },

    holdExpiresAt: {
      type: "datetime",
      nullable: false,
    },

    createdAt: {
      type: "datetime",
      createDate: true,
    },

    userId: {
      type: "integer",
      nullable: false,
    },
  },
});
