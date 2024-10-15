import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import path from "path";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { fileURLToPath } from "url";
import analysisRoute from "./routes/analysisRoute.js";
import cors from "cors";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Convert __dirname to ES module equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.once("SIGUSR2", () =>
  server.close((err) => process.kill(process.pid, "SIGUSR2"))
);

app.use(cors({
    origin: ['chrome-extension://kfdhmncppbjhhhmacomhmjmnbjpmpefn', 'http://localhost:3000']
  }));

app.use(express.json());

app.use("/api/analysis", analysisRoute);


if (process.env.NODE_ENV === "production") {
  // need to come back here an ensure that the path is correct
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);