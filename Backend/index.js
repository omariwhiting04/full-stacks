const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

app.get("/api/stocks/:ticker", async (req, res) => {
  const { ticker } = req.params;

  try {
    let growthRate = null;
    let growthOverPE = null;

    const incomeResp = await axios.get(
      `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${API_KEY}`
    );

    const reports = incomeResp.data.annualReports;
    if (reports && reports.length >= 2) {
      const netIncome1 = parseFloat(reports[0].netIncome);
      const netIncome2 = parseFloat(reports[1].netIncome);
      growthRate = (((netIncome1 - netIncome2) / netIncome2) * 100).toFixed(2);
    }

    const quoteResp = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${API_KEY}`
    );

    const peRatio = parseFloat(quoteResp.data.PERatio);
    const industry = quoteResp.data.Industry || "Unknown";
    const high52 = quoteResp.data["52WeekHigh"];
    const low52 = quoteResp.data["52WeekLow"];

    const priceResp = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`
    );

    const currentPrice = priceResp.data["Global Quote"]["05. price"];
    if (growthRate && peRatio) {
      growthOverPE = (growthRate / peRatio).toFixed(2);
    }

    res.json({
      ticker,
      growthRate,
      peRatio,
      growthOverPE,
      industry,
      high52,
      low52,
      currentPrice,
    });
  } catch (error) {
    console.log("❌ Error fetching stock data:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch stock data." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
