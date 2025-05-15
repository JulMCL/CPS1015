const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

//file to store data
const coinData = path.join(__dirname, "Data.json");
const defaultData = { 
  coins: 0, 
  rubies: 0, 
  upgradeCount: 0, 
  baseRate: 100,
  rubyRate: 1,
  shopItems: [
    {id: 1, name: "Golden Hat", cost: 5000, coinsPerSec: 5, owned: 0},
    {id: 2, name: "Cat Companion", cost: 7500, coinsPerSec: 0, owned: 0},
    {id: 3, name: "Treasure Chest", cost: 50000, coinsPerSec: 30, owned: 0},
    {id: 4, name: "Pickaxe", cost: 15000, coinsPerSec: 0, owned: 0}
  ]
};

//load game data
app.get("/load", (req, res) => {
    if(fs.existsSync(coinData)) {
        const data = fs.readFileSync(coinData, "utf-8");
        res.json(JSON.parse(data));
    } else {
        res.json(defaultData);
    }
});

//saving game data
app.post("/save", (req, res) => {
    const data = req.body;
    fs.writeFileSync(coinData, JSON.stringify(data, null, 2));
    res.json({ message: "Game is saved"});
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});