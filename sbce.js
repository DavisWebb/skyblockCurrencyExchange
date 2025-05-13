const HYPIXEL_API_KEY = '150f17d2-ceaf-4b18-a6d6-5892e1d5928d'; // Replace with your API key
const bitsShopItems = [

  { name: "God Potion", currency: 1500 },
  { name: "Kat Flower", currency: 500 },
  { name: "Builder's Wand", currency: 12000 },
  { name: "Heat Core", currency: 3000},
  { name: "Hyper Catalyst Upgrade", currency: 300},
  { name: "Ultimate Carrot Candy Upgrade", currency: 8000},
  { name: "Colossal Experience Bottle Upgrade", currency: 1200},
  { name: "Jumbo Backpack Upgrade", currency: 4000},
  { name: "Kat Bouquet", currency: 2500},
  { name: "Matriarch's Perfume", currency: 1200},
  { name: "Hologram", currency: 2000},
  { name: "Ditto Blob", currency: 600},
  { name: "Block Zapper", currency: 5000},
  { name: "Bits Talisman", currency: 15000},
  { name: "Pocket Sack-in-a-Sack", currency: 8000},
  { name: "Portalizer", currency: 4800},
  { name: "Abiphone Contacts Trio", currency: 6450},
  { name: "G3 Abicase", currency: 15000},
  { name: "GG Abicase", currency: 25000},
  { name: "Rezar", currency: 26000},
  { name: "Autopet Rules 2-Pack", currency: 21000},
  { name: "Pure Black Dye", currency: 250000},
  { name: "Pure White Dye", currency: 250000},
  { name: "Magic Find Enrichment", currency: 5000},
  { name: "Accessory Enrichment Swapper", currency: 200}

];

const copperShopItems = [

  { name: "Builder's Ruler", currency: 20},
  { name: "Lotus Bracelet", currency: 50},
  { name: "Lotus Belt", currency: 100},
  { name: "Lotus Necklace", currency: 200},
  { name: "Lotus Cloak", currency: 500},
  { name: "Yellow Bandana", currency: 300},
  { name: "Basic Gardening Hoe", currency: 5},
  { name: "Advanced Gardening Hoe", currency: 25},
  { name: "Garden Scythe", currency: 20},
  { name: "Basic Gardening Axe", currency: 5},
  { name: "Advanced Gardening Axe", currency: 25},
  { name: "Trading Post Barn Skin", currency: 1000},
  { name: "Autumn Hut Barn Skin", currency: 2000},
  { name: "Bamboo Barn Skin", currency: 7500},
  { name: "Hive Barn Skin", currency: 10000},
  { name: "Castle Barn Skin", currency: 15000},
  { name: "SkyMart Turbo Vacuum", currency: 200},
  { name: "SkyMart Hyper Vacuum", currency: 700},
  { name: "Infinivacuum", currency: 1700},
  { name: "Hooverius", currency: 4200},
  { name: "Pest Repellent", currency: 15},
  { name: "Pest Repellent MAX", currency: 40}

];

const pestShopItems = [

  { name: "Pesthunter Badge", currency: 25},
  { name: "Pesthunter Ring", currency: 75},
  { name: "Pesthunter Artifact", currency: 175},
  { name: "Biohazard Helmet", currency: 50},
  { name: "Biohazard Suit", currency: 80},
  { name: "Biohazard Leggings", currency: 70},
  { name: "Biohazard Boots", currency: 40},
  { name: "Pesthunter's Necklace", currency: 40},
  { name: "Pesthunter's Cloak", currency: 40},
  { name: "Pesthunter's Belt", currency: 40},
  { name: "Pesthunter's Gloves", currency: 40},
  { name: "Pest Trap", currency: 50},
  { name: "Mouse Trap", currency: 125},
  { name: "Pesthunter's Lair Barn Skin", currency: 1500},
  { name: "Hedgehog", currency: 500}

];

const progressI = document.getElementById("progressIndicator");

async function fetchLowestBinPrices(list) {
  const itemPrices = {};
  const pageRes = await fetch(`https://api.hypixel.net/skyblock/auctions?page=0`);
  const pageData = await pageRes.json();
  const totalPages = Math.min(50, pageData.totalPages)

  for (let i = 0; i < totalPages; i++) {
    const res = await fetch(`https://api.hypixel.net/skyblock/auctions?page=${i}`);
    const data = await res.json();

    data.auctions.forEach((auction) => {
        console.log(`Fetching page ${i}`);
        progressIndicator.innerHTML = `Checking Page ${i}/50...`;
      if (!auction.bin) return; // Only consider BIN listings

      for (const item of list) {
        if (auction.item_name.toLowerCase().includes(item.name.toLowerCase())) {
          if (!itemPrices[item.name] || auction.starting_bid < itemPrices[item.name]) {
            itemPrices[item.name] = auction.starting_bid;
            console.log(`Checking auction: ${auction.item_name}`);
          }
        }
      }
    });

    // Optional: wait a bit to prevent hitting the rate limit
    await new Promise(r => setTimeout(r, 25)); 
  }

  return itemPrices;
}

function calculateProfitPerBit(bitPrices, lowestBinPrices, map) {
  return map.map(item => {
    const bin = lowestBinPrices[item.name];
    const profitPerBit = bin ? bin / item.currency : 0;

    return {
      name: item.name,
      bitCost: item.currency,
      binPrice: bin || "Not Found",
      profitPerBit: profitPerBit.toFixed(2)
    };
  }).sort((a, b) => b.profitPerBit - a.profitPerBit); // Sort descending
}

const loading = document.getElementById("loading");

function displayResults(results, currency) {
  const table = document.getElementById('results');
  table.innerHTML = `
    <tr>
      <th>Item</th><th>${currency} Cost</th><th>BIN Price</th><th>Profit/${currency}</th>
    </tr>
  `;

  results.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.bitCost}</td>
        <td>${item.binPrice.toLocaleString()}</td>
        <td>${item.profitPerBit}</td>
      </tr>
    `;
  });
  loading.style.display = 'none';
}

const resTable = document.getElementById("resCont");
const buttonGrid = document.getElementById("selectionGrid");

async function updateData(val) {
  progressIndicator.style.display = 'block';
  resTable.style.display = 'none';
  if (val == 1) {
    buttonGrid.style.display = 'none';
    loading.style.display = 'block';
    const binPrices = await fetchLowestBinPrices(bitsShopItems);
    const results = calculateProfitPerBit(bitsShopItems, binPrices, bitsShopItems);
    progressIndicator.style.display = 'none';
    displayResults(results, "Bits");
    resTable.style.display = 'block';
  }
  else if (val == 2) {
    buttonGrid.style.display = 'none';
    loading.style.display = 'block';
    const binPrices = await fetchLowestBinPrices(copperShopItems);
    const results = calculateProfitPerBit(copperShopItems, binPrices, copperShopItems);
    progressIndicator.style.display = 'none';
    displayResults(results, "Copper");
    resTable.style.display = 'block';
  }
  else {
    buttonGrid.style.display = 'none';
    loading.style.display = 'block';
    const binPrices = await fetchLowestBinPrices(pestShopItems);
    const results = calculateProfitPerBit(pestShopItems, binPrices, pestShopItems);
    progressIndicator.style.display = 'none';
    displayResults(results, "Pests");
    resTable.style.display = 'block';
  }
  resetButton.style.display = 'block';
}

const resetButton = document.getElementById("resetButton");

function resetAll() {
  buttonGrid.style.display = 'grid';
  loading.style.display = 'none';
  progressIndicator.style.display = 'none';
  resTable.style.display = 'none';
  resetButton.style.display = 'none';
}

