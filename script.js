let coins = 0;
let rubies = 0;
let baseRate = 100;
let rubyRate = 1;
let upgradeCount = 0;
let upgradeCost = 500;
let boostActive = false;

//list of shop items, their cost and attributes
let shopItems = [
  {id: 1, name: "Golden Hat", cost: 5000, coinsPerSec: 5, owned: 0},
  {id: 2, name: "Cat Companion", cost: 7500, coinsPerSec: 0, owned: 0},
  {id: 3, name: "Treasure Chest", cost: 50000, coinsPerSec: 30, owned: 0},
  {id: 4, name: "Pickaxe", cost: 15000, coinsPerSec: 0, owned: 0}
];

//list of achievements
let achievements = {
  cats: {required: 10, progress: 0, completed: false},
  chests: {required: 5, progress: 0, completed: false},
  coins: {required: 100000, progress: 0, completed: false},
  hats: {required: 3, progress: 0, completed: false},
  pickaxes: {required: 15, progress: 0, completed: false}
};

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

    if(data.shopItems){
      shopItems = data.shopItems;
    }
  
    //user interface for shop items
    shopItems.forEach(item => {
      const ownedElement = document.querySelector(`.owned${item.id}`);
      const costElement = document.querySelector(`.cost${item.id}`);
      
      if (ownedElement) ownedElement.textContent = item.owned;
      if (costElement) costElement.textContent = item.cost;
    });

    console.log("Loaded rubyRate:", rubyRate);
    upgradeCost = 500 * Math.pow(1.5, upgradeCount);
    updateUI();
  })

  .catch(err => {
    console.error("Failed to load data:", err);
  });

//automatic coin and ruby generator
setInterval(() => {
    coins += baseRate;
    rubies += rubyRate;
    updateUI();
}, 1000); //gives coins and rubies automatically every second

//button to activate booster
booster.addEventListener("click", () => {
    if(rubies >= 200 && !boostActive){
        rubies -= 200; //cost of activating booster
        baseRate *=3; //booster is applied here
        boostActive = true;
        updateUI();

        booster.disabled = true;
        booster.textContent = "Booster is active!";

        setTimeout(() => {
            baseRate /= 3; //setting base rate to normal after booster ends
            boostActive = false;
            booster.disabled = false;
            booster.innerHTML = `
              <img src="images/ruby.png" alt="Ruby" class="button-icon">
              Activate Booster (200 rubies)
              `;
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

//handles clicks that add coins
collect.addEventListener("click", () => {
    coins += coinsPerClick;
    updateUI();
    
    //click effect
    collect.classList.add("click-feedback");
    setTimeout(() => collect.classList.remove("click-feedback"), 100);
});

//updates values that are visible to the user
function updateUI(){
    coinCount.textContent = Math.floor(coins);
    rubyCount.textContent = rubies;
    coinRate.textContent = baseRate;
    rubyRateElement.textContent = rubyRate
    upgradeCountElement.textContent = upgradeCount;
    document.getElementById("upgradeCost").textContent = Math.floor(upgradeCost);
    
    //updating shop items depending on current coin amount
    shopItems.forEach(item => {
      shopItems.forEach(item => {
        const button = document.querySelector(`.buy-button[data-item="${item.id}"]`);
        if(button){
          button.disabled = coins < item.cost;
        }
      });
    });

    checkAchievements();
}

//handles shop items by applying coin boosts and increase in cost
document.querySelectorAll('.buy-button').forEach(button => {
  button.addEventListener('click', () => {
    const itemId = parseInt(button.getAttribute('data-item'));
    const item = shopItems.find(i => i.id === itemId);
      
    if(item && coins >= item.cost){
      coins -= item.cost;
      item.owned++;
          
      //coin bonus is applied if applicable
      if(item.coinsPerSec > 0){
          baseRate += item.coinsPerSec;
      }
          
      //increase in cost for next purchases
      item.cost = Math.floor(item.cost*1.2);

      document.querySelector(`.owned${itemId}`).textContent = item.owned;
      document.querySelector(`.cost${itemId}`).textContent = item.cost;
      
      checkAchievements();
      updateUI();
      saveGame();
    }
  });
});

//function that implements achievements
function checkAchievements(){
  //achievement progress
  achievements.cats.progress = shopItems[1].owned;
  achievements.chests.progress = shopItems[2].owned;
  achievements.coins.progress = coins;
  achievements.hats.progress = shopItems[0].owned;
  achievements.pickaxes.progress = shopItems[3].owned;

  //checking each achievement
  checkSingleAchievement('cats', 300);
  checkSingleAchievement('chests', 400);
  checkSingleAchievement('coins', 500);
  checkSingleAchievement('hats', 100);
  checkSingleAchievement('pickaxes', 1000);

  updateAchievementsUI();
}

function checkSingleAchievement(achievementName, rubyReward){
  const achievement = achievements[achievementName];
  if(!achievement.completed && achievement.progress >= achievement.required){
      achievement.completed = true;
      rubies += rubyReward;
      saveGame();
  }
}

function updateAchievementsUI(){
  for (const [key, achievement] of Object.entries(achievements)){
      const element = document.getElementById(`achieve-${key}`);
      const progressElement = element.querySelector('.achievement-progress');
      
      // Update progress text
      if(key === 'coins'){
          progressElement.textContent = `${Math.min(achievement.progress, achievement.required)}/${achievement.required}`;
      }else{
          progressElement.textContent = `${achievement.progress}/${achievement.required}`;
      }
      
      //when achievement is completed
      if(achievement.completed){
          element.classList.add('unlocked');
      }else{
          element.classList.remove('unlocked');
      }
  }
}

//saves game data
function saveGame(){
    const gameData = {
      coins,
      rubies,
      upgradeCount,
      baseRate,
      rubyRate,
      shopItems
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