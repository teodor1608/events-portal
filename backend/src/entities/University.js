const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "University",
  tableName: "universities",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    location: {
      type: "varchar",
      nullable: false,
    },
  },
  relations: {
    students: {
      target: "Student",
      type: "one-to-many",
      inverseSide: "university",
    },
  },
});
