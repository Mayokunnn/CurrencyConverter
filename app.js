// app.js
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://admin:1234@cluster0.okxuf4a.mongodb.net/?retryWrites=true&w=majority",
  { tls: true }
);

// Create a CurrencyConversion model
const CurrencyConversion = mongoose.model("CurrencyConversion", {
  fromCurrency: String,
  toCurrency: String,
  amount: Number,
  result: Number,
  timestamp: { type: Date, default: Date.now },
});

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to handle form data
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});
// Routes
app.post("/convert", async (req, res) => {
  // Extract data from the request
  const { fromCurrency, toCurrency, amount, result } = req.body;

  // Create a new CurrencyConversion document
  const conversion = new CurrencyConversion({
    fromCurrency,
    toCurrency,
    amount,
    result,
  });

  // Save the document to the database
  try {
    await conversion.save();
    res.status(201).json({ message: "Conversion saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/history", async (req, res) => {
  // Retrieve all conversions from the database
  try {
    const history = await CurrencyConversion.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
