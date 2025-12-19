const { DataSource } = require("typeorm");
const Event = require("../entities/Event");
const Reservation = require("../entities/Reservation");
const User = require("../entities/User");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Event, Reservation, User],
});

module.exports = AppDataSource;
