const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const publicRoutes = require("./routes/Public");
const adminRoutes = require("./routes/Admin");
const { connect } = require("./controllers/RedisClient");
require("dotenv").config();


const port = 3000;
const app = express();

(async () => {
  try {
    await connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }

  const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
  };

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);

  app.get("/", (req, res) => {
    res.send("fortnite battlepass");
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
