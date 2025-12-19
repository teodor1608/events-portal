const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { primary: true, type: "integer", generated: true },

    email: { type: "varchar", nullable: false, unique: true },

    // local auth
    passwordHash: { type: "varchar", nullable: true },

    // google auth
    googleId: { type: "varchar", nullable: true, unique: true },

    role: { type: "varchar", nullable: false, default: "USER" }, // USER | ADMIN

    createdAt: { type: "datetime", createDate: true },
    updatedAt: { type: "datetime", updateDate: true },
  },
});
