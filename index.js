const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// test api
app.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Routes
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const purchaseRoutes = require("./routes/purchase");

app.use("/user", userRoutes);
app.use("/book", bookRoutes);
app.use("/purchase", purchaseRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
