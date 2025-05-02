const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/hangman", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const stockSchema = new mongoose.Schema({
  ticker: String,
  growthRate: Number,
  peRatio: Number,
  growthOverPE: Number,
  industry: String,
});
// AFTER your schema definition…




const Stock = mongoose.model("Stock", stockSchema);

app.get("/favorites", async (req, res) => {
  const { industry } = req.query;
  const query = industry ? { industry } : {};
  const stocks = await Stock.find(query);
  res.json(stocks);
});

app.post("/favorites", async (req, res) => {
  const stock = new Stock(req.body);
  await stock.save();
  res.json({ message: "Saved", stock });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
