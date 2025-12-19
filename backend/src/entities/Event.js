const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Event",
  tableName: "events",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },

    title: {
      type: "varchar",
      nullable: false,
    },

    description: {
      type: "text",
      nullable: true,
    },

    // fixed categories enforce in routes/services
    type: {
      type: "varchar",
      nullable: false,
      default: "other",
    },

    startsAt: {
      type: "datetime",
      nullable: false,
    },

    endsAt: {
      type: "datetime",
      nullable: true,
    },

    city: {
      type: "varchar",
      nullable: false,
      default: "",
    },

    venue: {
      type: "varchar",
      nullable: false,
      default: "",
    },

    imageUrl: {
      type: "varchar",
      nullable: true,
    },

    priceCents: {
      type: "integer",
      nullable: false,
      default: 0,
    },

    currency: {
      type: "varchar",
      nullable: false,
      default: "EUR",
    },

    totalSeats: {
      type: "integer",
      nullable: false,
      default: 0,
    },

    availableSeats: {
      type: "integer",
      nullable: false,
      default: 0,
    },

    // status DRAFT/SCHEDULED/CANCELLED/COMPLETED
    status: {
      type: "varchar",
      nullable: false,
      default: "DRAFT",
    },

    isPublished: {
      type: "boolean",
      nullable: false,
      default: false,
    },
  },
});
