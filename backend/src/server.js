require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AppDataSource = require("./config/database");
const eventRoutes = require("./routes/eventRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const userRoutes = require("./routes/userRoutes");
const { startExpireReservationsJob } = require("./jobs/expireReservations");
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);



app.get("/", (req, res) => {
  res.json({
    message: "Student-University API Server",
    endpoints: {
      events: {
        "POST /api/events": "Create a new event (admin for now)",
        "GET /api/events?from=&to=&type=": "List public events with filters",
        "GET /api/events/:id": "Get public event details",
        "PUT /api/events/:id": "Update an event (admin for now)",
        "DELETE /api/events/:id": "Delete an event (admin for now)",
      },
      reservations: {
        "POST /api/reservations": "Hold seats for an event",
      },
    },
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
    try {
      startExpireReservationsJob();
      console.log("Started expire reservations job");
    } catch (err) {
      console.error("Failed to start expire reservations job:", err.message);
    }
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

module.exports = app;
