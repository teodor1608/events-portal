const { DataSource } = require("typeorm");
const University = require("../entities/University");
const Student = require("../entities/Student");
// TODO: Import Subject entity
// const Subject = require("../entities/Subject");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [University, Student], // TODO: Add Subject to this array
});

module.exports = AppDataSource;
