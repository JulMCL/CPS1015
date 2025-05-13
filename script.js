let coins = 0;
let rubies = 0;
let baseRate = 100;
let rubyRate = 1;
let upgradeCount = 0;
let upgradeCost = 500;
let boostActive = false;

const coinCount = document.getElementById("coinCount");
const rubyCount = document.getElementById("rubyCount");
const coinRate = document.getElementById("coinRate");
const rubyRateElement = document.getElementById("rubyRate");
const collect = document.getElementById("collect");
const upgrade = document.getElementById("upgrade");
const upgradeCountElement = document.getElementById("upgradeCount");
const booster = document.getElementById("booster");
const coinsPerClick = 10;

//load game state from server
fetch("http://localhost:8000/load")
  .then(res => res.json())
  .then(data => {
    coins = data.coins || 0;
    rubies = data.rubies || 0;
    upgradeCount = data.upgradeCount || 0;
    baseRate = data.baseRate || 100;
    rubyRate = data.rubyRate || 1;
    upgradeCost = 500 * Math.pow(1.5, upgradeCount);
    updateUI();
  })
  .catch(err => {
    console.error("Failed to load data:", err);
  });

//automatic goin generator
setInterval(() => {
    coins += baseRate;
    updateUI();
}, 1000); //gives coins automatically every second

//button to activate booster
booster.addEventListener("click", () => {
    if(rubies >= 10 && !boostActive) {
        rubies -= 10;
        baseRate *=3;
        boostActive = true;
        updateUI();

        booster.disabled = true;
        booster.textContent = "Booster is active!";

        setTimeout(() => {
            baseRate /= 3; //setting base rate to normal after booster ends
            boostActive = false;
            booster.disabled = false;
            booster.textContent = "Activate Booster (for 10 rubies)";
            updateUI();
        }, 10000); //booster lasts for 10 seconds
    }
})

//button to make an upgrade
upgrade.addEventListener("click", () => {
    if(coins >= upgradeCost){
        coins -= upgradeCost;
        upgradeCount++;
        baseRate += 10;
        upgradeCost = Math.floor(upgradeCost*1.5); //increase in cost of next upgrade
        updateUI();
    }
})

collect.addEventListener("click", () => {
    coins += coinsPerClick;
    updateUI();
    
    // Optional visual feedback
    collect.classList.add("click-feedback");
    setTimeout(() => collect.classList.remove("click-feedback"), 100);
});

//earn rubies every minute
setInterval(() => {
    rubies += rubyRate;
    updateUI();
}, 60000) //automatically gives a ruby each minute

function updateUI() {
    coinCount.textContent = Math.floor(coins);
    rubyCount.textContent = rubies;
    coinRate.textContent = baseRate;
    rubyRateElement.textContent = rubyRate
    upgradeCountElement.textContent = `Buy Upgrade for ${upgradeCost} Coins`;
}

function saveGame() {
    const gameData = {
      coins,
      rubies,
      upgradeCount,
      baseRate,
      rubyRate
    };
  
    fetch("http://localhost:8000/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gameData)
    })
    .catch(err => {
        console.error("Failed to save game:", err);
    });
}

setInterval(saveGame, 10000); //save game every 10 seconds