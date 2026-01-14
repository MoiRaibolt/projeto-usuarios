import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

app.listen(3333, () => {
  console.log("🚀 Server running on http://localhost:3333");
});
