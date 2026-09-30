/**
 * BaristaCraft Pro™ - Coffee Vending Machine Simulator
 * Frontend Logic & Web Audio Sound Synthesizer
 */

// ==========================================
// Web Audio Sound Synthesizer (Realistic SFX)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, duration = 0.08, type = 'sine') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playCoinDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      [1400, 1800, 2200].forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.12);
        }, i * 45);
      });
    } catch (e) {}
  }

  playCardTap() {
    if (!this.enabled) return;
    this.init();
    this.playBeep(880, 0.1, 'sine');
    setTimeout(() => this.playBeep(1320, 0.15, 'sine'), 100);
  }

  playGrind() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playSteam() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playSuccessChime() {
    if (!this.enabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'sine'), idx * 90);
    });
  }

  playRefundChime() {
    if (!this.enabled) return;
    this.init();
    const notes = [800, 600, 400];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.15, 'sawtooth'), idx * 80);
    });
  }
}

const sounds = new SoundSynth();

// ==========================================
// Coffee Vending Machine State & Engine
// ==========================================

const DEFAULT_RECIPES = [
  {
    id: "espresso",
    name: "Espresso",
    price: 3.00,
    description: "Rich, intense full-bodied single shot of pure dark roast",
    icon: "☕",
    recipe: { water: 50, milk: 0, coffee_powder: 18, sugar: 0 },
    liquidColor: "#2b1408",
    foamColor: "#92400e",
    liquidHeight: "45%"
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    price: 4.50,
    description: "Espresso topped with equal parts steamed milk and thick velvety microfoam",
    icon: "🥛",
    recipe: { water: 100, milk: 120, coffee_powder: 18, sugar: 10 },
    liquidColor: "#5c2e17",
    foamColor: "#fef3c7",
    liquidHeight: "85%"
  },
  {
    id: "latte",
    name: "Caffè Latte",
    price: 4.00,
    description: "Delicate espresso balanced with creamy steamed milk and light silky foam",
    icon: "🍶",
    recipe: { water: 80, milk: 150, coffee_powder: 16, sugar: 10 },
    liquidColor: "#7c3f1d",
    foamColor: "#fdf8f6",
    liquidHeight: "90%"
  },
  {
    id: "americano",
    name: "Americano",
    price: 3.50,
    description: "Bold espresso diluted with purified steaming hot water for smooth sip",
    icon: "🫖",
    recipe: { water: 180, milk: 0, coffee_powder: 18, sugar: 5 },
    liquidColor: "#381a0b",
    foamColor: "#78350f",
    liquidHeight: "80%"
  },
  {
    id: "mocha",
    name: "Caffè Mocha",
    price: 5.00,
    description: "Espresso blended with artisanal dark chocolate, rich steamed milk and sugar",
    icon: "🍫",
    recipe: { water: 80, milk: 120, coffee_powder: 18, sugar: 20 },
    liquidColor: "#3e1c0e",
    foamColor: "#e5d5c5",
    liquidHeight: "88%"
  },
  {
    id: "macchiato",
    name: "Caramel Macchiato",
    price: 4.75,
    description: "Steamed milk layered with rich espresso and golden caramel syrup drizzle",
    icon: "🍯",
    recipe: { water: 70, milk: 110, coffee_powder: 16, sugar: 15 },
    liquidColor: "#854d0e",
    foamColor: "#fef08a",
    liquidHeight: "85%"
  }
];

const state = {
  menu: DEFAULT_RECIPES,
  selectedDrink: null,
  customization: {
    sugar: 0,
    temperature: "Hot (90°C)"
  },
  amountPaid: 0.00,
  currentStep: 1, // 1: Menu, 2: Payment, 3: Brewing, 4: Ready
  ingredients: {
    water: { name: "Water", unit: "ml", capacity: 2000, current_level: 1200, refill_threshold: 150 },
    milk: { name: "Milk", unit: "ml", capacity: 1500, current_level: 900, refill_threshold: 120 },
    coffee_powder: { name: "Coffee Powder", unit: "g", capacity: 500, current_level: 300, refill_threshold: 25 },
    sugar: { name: "Sugar", unit: "g", capacity: 400, current_level: 250, refill_threshold: 20 }
  },
  totalCupsServed: 0,
  totalEarnings: 0.00,
  logs: []
};

// ==========================================
// Initialization & DOM Setup
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  renderMenu();
  updateTanksDisplay();
  setupEventListeners();
  fetchBackendState();
  addLog("Vending Machine GUI initialized and ready for orders.");
});

function initClock() {
  const clockEl = document.getElementById("kioskClock");
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString();
  }, 1000);
}

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${msg}`;
  state.logs.push(entry);
  if (state.logs.length > 50) state.logs.shift();
  
  const consoleEl = document.getElementById("logConsole");
  if (consoleEl) {
    const p = document.createElement("div");
    p.innerText = entry;
    consoleEl.appendChild(p);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

// ==========================================
// Menu & Drink Selection (Step 1)
// ==========================================

function renderMenu() {
  const grid = document.getElementById("coffeeMenuGrid");
  grid.innerHTML = "";

  state.menu.forEach((item) => {
    const card = document.createElement("div");
    card.className = "coffee-card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="coffee-card-top">
        <div class="coffee-icon-bubble">${item.icon}</div>
        <div class="coffee-price-badge">$${item.price.toFixed(2)}</div>
      </div>
      <div class="coffee-title">${item.name}</div>
      <div class="coffee-desc">${item.description}</div>
      <div class="coffee-order-btn">Tap to Select</div>
    `;
    card.addEventListener("click", () => selectDrink(item));
    grid.appendChild(card);
  });
}

function selectDrink(drink) {
  sounds.playBeep(700, 0.08);
  state.selectedDrink = drink;
  state.amountPaid = 0.00;

  // Visual highlights
  document.querySelectorAll(".coffee-card").forEach(c => c.classList.remove("selected"));
  const card = document.querySelector(`.coffee-card[data-id="${drink.id}"]`);
  if (card) card.classList.add("selected");

  // Move to Payment View
  goToStep(2);
  updatePaymentView();
  addLog(`Customer selected: ${drink.name} ($${drink.price.toFixed(2)})`);
}

// ==========================================
// Customization Options
// ==========================================

function setupEventListeners() {
  // Sugar buttons
  document.querySelectorAll(".sugar-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      sounds.playBeep(800, 0.05);
      document.querySelectorAll(".sugar-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.customization.sugar = parseInt(btn.dataset.sugar);
      updatePaymentCustoms();
    });
  });

  // Temperature buttons
  document.querySelectorAll(".temp-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      sounds.playBeep(800, 0.05);
      document.querySelectorAll(".temp-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.customization.temperature = btn.dataset.temp;
      updatePaymentCustoms();
    });
  });

  // Custom cash input
  document.getElementById("insertCustomCashBtn").addEventListener("click", () => {
    const input = document.getElementById("customCashInput");
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
      insertMoney(val);
      input.value = "";
    } else {
      sounds.playBeep(300, 0.2, 'sawtooth');
      alert("Please enter a valid amount greater than $0.00");
    }
  });

  // Tap Card NFC
  document.getElementById("nfcTapPad").addEventListener("click", () => {
    if (!state.selectedDrink) return;
    sounds.playCardTap();
    insertExact();
  });

  // Confirm Brew Button
  document.getElementById("confirmBrewBtn").addEventListener("click", () => {
    if (state.selectedDrink && state.amountPaid >= state.selectedDrink.price) {
      processBrewing();
    }
  });

  // Cancel Order Button
  document.getElementById("cancelOrderBtn").addEventListener("click", () => {
    cancelTransaction();
  });

  // Collect Cup Button
  document.getElementById("collectCupBtn").addEventListener("click", () => {
    resetKioskToMainMenu();
  });

  // Sound Toggle Button
  const soundBtn = document.getElementById("soundToggleBtn");
  soundBtn.addEventListener("click", () => {
    sounds.enabled = !sounds.enabled;
    soundBtn.innerHTML = sounds.enabled ? '<span class="icon">🔊</span> Sound: ON' : '<span class="icon">🔇</span> Sound: OFF';
    if (sounds.enabled) sounds.playBeep(800, 0.1);
  });

  // Admin / Telemetry Modal
  const adminModal = document.getElementById("adminModalOverlay");
  document.getElementById("adminToggleBtn").addEventListener("click", () => {
    sounds.playBeep(600, 0.08);
    updateStatsDisplay();
    adminModal.classList.add("show");
  });
  document.getElementById("closeAdminModalBtn").addEventListener("click", () => {
    adminModal.classList.remove("show");
  });
  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) adminModal.classList.remove("show");
  });

  // Manual Refill in Modal
  document.getElementById("manualRefillAllBtn").addEventListener("click", () => {
    refillAllIngredients();
  });

  // Test Low Stock button
  document.getElementById("depleteForTestBtn").addEventListener("click", () => {
    state.ingredients.water.current_level = 100; // Trigger auto refill next time
    state.ingredients.milk.current_level = 80;
    updateTanksDisplay();
    addLog("TEST: Water & Milk artificially reduced to below threshold to test auto-refill!");
    alert("Simulated: Water and Milk tanks reduced below threshold. Next drink order will trigger Auto-Refill!");
  });
}

function updatePaymentCustoms() {
  const specs = document.getElementById("payDrinkSpecs");
  const sugarText = state.customization.sugar === 0 ? "No Sugar" : `${state.customization.sugar} Sugar Cube${state.customization.sugar > 1 ? 's' : ''}`;
  specs.innerText = `Sugar: ${sugarText} • ${state.customization.temperature}`;
}

// ==========================================
// Step & View Navigation
// ==========================================

function goToStep(stepNumber) {
  state.currentStep = stepNumber;

  // Update indicators
  for (let i = 1; i <= 4; i++) {
    const pill = document.getElementById(`stepIndicator${i}`);
    if (i <= stepNumber) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  }

  // Update Views
  const views = ["viewMenu", "viewPayment", "viewBrewing", "viewReady"];
  views.forEach((vId, idx) => {
    const el = document.getElementById(vId);
    if (idx + 1 === stepNumber) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

// ==========================================
// Payment Processing (Step 2)
// ==========================================

function updatePaymentView() {
  if (!state.selectedDrink) return;

  const drink = state.selectedDrink;
  document.getElementById("payDrinkIcon").innerText = drink.icon;
  document.getElementById("payDrinkName").innerText = drink.name;
  document.getElementById("payDrinkDesc").innerText = drink.description;
  document.getElementById("payDrinkPrice").innerText = drink.price.toFixed(2);
  document.getElementById("exactBtnVal").innerText = drink.price.toFixed(2);
  updatePaymentCustoms();

  document.getElementById("dispTotalAmount").innerText = `$${drink.price.toFixed(2)}`;
  document.getElementById("dispPaidAmount").innerText = `$${state.amountPaid.toFixed(2)}`;

  const remaining = drink.price - state.amountPaid;
  const statusLabel = document.getElementById("dispStatusLabel");
  const remainingEl = document.getElementById("dispRemainingAmount");
  const confirmBtn = document.getElementById("confirmBrewBtn");

  if (remaining > 0) {
    statusLabel.innerText = "Remaining Balance Required:";
    remainingEl.innerText = `$${remaining.toFixed(2)}`;
    remainingEl.className = "amount-val alert";
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="btn-icon">⏳</span> Insert $${remaining.toFixed(2)} More`;
  } else {
    const change = Math.abs(remaining);
    if (change > 0) {
      statusLabel.innerText = "Change To Return:";
      remainingEl.innerText = `$${change.toFixed(2)}`;
      remainingEl.className = "amount-val success-change";
    } else {
      statusLabel.innerText = "Payment Status:";
      remainingEl.innerText = "Exact Amount Inserted ✓";
      remainingEl.className = "amount-val success-change";
    }
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<span class="btn-icon">⚡</span> Start Brewing (${drink.name})`;
  }
}

function insertMoney(amount) {
  if (state.currentStep !== 2) {
    if (state.currentStep === 1) {
      sounds.playBeep(400, 0.1);
      alert("Please select your preferred coffee from the menu first!");
      return;
    }
    return;
  }

  sounds.playCoinDrop();
  state.amountPaid = +(state.amountPaid + amount).toFixed(2);
  updatePaymentView();
  addLog(`Payment accepted: +$${amount.toFixed(2)} | Total Inserted: $${state.amountPaid.toFixed(2)}`);

  // Animate physical payment slit
  document.getElementById("tickerText").innerText = `ACCEPTED $${amount.toFixed(2)} • TOTAL: $${state.amountPaid.toFixed(2)}`;
}

function insertExact() {
  if (!state.selectedDrink) return;
  const remaining = state.selectedDrink.price - state.amountPaid;
  if (remaining > 0) {
    insertMoney(remaining);
  }
}

// ==========================================
// Transaction Cancellation & Refund (Requirement 9)
// ==========================================

function cancelTransaction() {
  const refundAmount = state.amountPaid;
  sounds.playRefundChime();

  if (refundAmount > 0) {
    showRefundToast(refundAmount);
    dispensePhysicalChange(refundAmount);
    addLog(`TRANSACTION CANCELLED: Refunded $${refundAmount.toFixed(2)} to customer.`);
  } else {
    addLog("TRANSACTION CANCELLED: No funds were inserted.");
  }

  // Notify backend
  try {
    fetch("/api/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_paid: refundAmount })
    }).catch(() => {});
  } catch (e) {}

  resetKioskToMainMenu();
}

function showRefundToast(amount) {
  const toast = document.getElementById("refundToast");
  document.getElementById("refundToastMsg").innerText = `Full refund of $${amount.toFixed(2)} returned to the change tray below.`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4500);
}

// ==========================================
// Auto-Refill & Ingredient Logic (Req 6, 7, 8)
// ==========================================

function checkAndAutoRefill(drink) {
  const refillEvents = [];

  for (const [key, reqQty] of Object.entries(drink.recipe)) {
    const ing = state.ingredients[key];
    if (!ing) continue;

    // Check if below required quantity or below auto-refill threshold
    if (ing.current_level < reqQty || ing.current_level <= ing.refill_threshold) {
      const added = ing.capacity - ing.current_level;
      ing.current_level = ing.capacity;
      refillEvents.push({
        name: ing.name,
        added: added,
        unit: ing.unit,
        capacity: ing.capacity
      });
      addLog(`AUTO-REFILL TRIGGER: ${ing.name} was low. Automatically restored to ${ing.capacity}${ing.unit}.`);
    }
  }

  if (refillEvents.length > 0) {
    showRefillToast(refillEvents);
    // Visual glow on tank
    refillEvents.forEach(r => {
      const card = document.getElementById(`tank${capitalize(r.name.split(' ')[0])}`);
      if (card) {
        card.classList.add("refilling");
        setTimeout(() => card.classList.remove("refilling"), 3000);
      }
    });
  }

  updateTanksDisplay();
  return refillEvents;
}

function showRefillToast(refills) {
  const toast = document.getElementById("refillToast");
  const names = refills.map(r => `${r.name} (+${r.added.toFixed(0)}${r.unit})`).join(", ");
  document.getElementById("refillToastMsg").innerText = `Low level detected: Automatically refilled ${names} to 100% capacity.`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 5000);
}

function deductIngredients(drink) {
  for (const [key, reqQty] of Object.entries(drink.recipe)) {
    if (state.ingredients[key]) {
      state.ingredients[key].current_level = Math.max(0, state.ingredients[key].current_level - reqQty);
    }
  }
  updateTanksDisplay();
}

function updateTanksDisplay() {
  const map = {
    water: { idVal: "valWater", idLvl: "levelWater", idPct: "pctWater" },
    milk: { idVal: "valMilk", idLvl: "levelMilk", idPct: "pctMilk" },
    coffee_powder: { idVal: "valCoffee", idLvl: "levelCoffee", idPct: "pctCoffee" },
    sugar: { idVal: "valSugar", idLvl: "levelSugar", idPct: "pctSugar" }
  };

  for (const [k, ing] of Object.entries(state.ingredients)) {
    const elIds = map[k];
    if (!elIds) continue;

    const pct = Math.max(0, Math.min(100, (ing.current_level / ing.capacity) * 100));
    document.getElementById(elIds.idVal).innerText = `${ing.current_level.toFixed(0)} / ${ing.capacity} ${ing.unit}`;
    document.getElementById(elIds.idPct).innerText = `${pct.toFixed(0)}%`;
    document.getElementById(elIds.idLvl).style.width = `${pct}%`;
  }
}

function refillAllIngredients() {
  for (const ing of Object.values(state.ingredients)) {
    ing.current_level = ing.capacity;
  }
  updateTanksDisplay();
  addLog("MANUAL MAINTENANCE: All tanks refilled to 100%.");
  sounds.playSuccessChime();
  alert("All ingredient tanks have been refilled to full capacity!");
}

// ==========================================
// Brewing Simulation (Step 3)
// ==========================================

function processBrewing() {
  const drink = state.selectedDrink;
  if (!drink) return;

  goToStep(3);
  sounds.playBeep(900, 0.1);

  // 1. Check & Trigger Auto Refill if needed
  checkAndAutoRefill(drink);

  // 2. Animate Hardware Dispenser
  const dispenserLed = document.getElementById("dispenserLed");
  const coffeeStream = document.getElementById("coffeeStream");
  const steamContainer = document.getElementById("steamContainer");
  const liquidBody = document.getElementById("liquidBody");
  const cupLiquid = document.getElementById("cupLiquid");
  const foamLayer = document.getElementById("foamLayer");

  dispenserLed.classList.add("active");
  cupLiquid.style.height = "0%";
  cupLiquid.style.backgroundColor = drink.liquidColor || "#3e1c0e";
  if (foamLayer) foamLayer.style.backgroundColor = drink.foamColor || "#fef3c7";

  // Stages timeline
  const stages = [
    { name: "Grinding Fresh Arabica Beans...", id: "stageGrind", sfx: () => sounds.playGrind(), pct: 20 },
    { name: "Heating Purified Water to 92°C...", id: "stageHeat", sfx: () => sounds.playSteam(), pct: 45 },
    { name: "Extracting Rich Espresso Under 9 Bar...", id: "stageExtract", sfx: () => sounds.playSteam(), pct: 70 },
    { name: "Frothing Milk & Blending...", id: "stageFroth", sfx: () => {}, pct: 90 },
    { name: "Finishing & Dispensing Cup...", id: "stagePour", sfx: () => {}, pct: 100 }
  ];

  let currentStageIdx = 0;
  const progressFill = document.getElementById("brewProgressFill");
  const progressPct = document.getElementById("brewProgressPct");
  const stepText = document.getElementById("brewingStepText");

  const interval = setInterval(() => {
    if (currentStageIdx >= stages.length) {
      clearInterval(interval);
      finishBrewing();
      return;
    }

    const stage = stages[currentStageIdx];
    stepText.innerText = stage.name;
    progressFill.style.width = `${stage.pct}%`;
    progressPct.innerText = `${stage.pct}%`;

    // Highlight stage pills
    document.querySelectorAll(".stage-item").forEach(s => s.classList.remove("active"));
    const stageEl = document.getElementById(stage.id);
    if (stageEl) stageEl.classList.add("active");

    // Audio SFX
    if (stage.sfx) stage.sfx();

    // Visual pouring during extract and froth
    if (currentStageIdx === 2) {
      coffeeStream.classList.add("pouring");
      steamContainer.classList.add("steaming");
      cupLiquid.style.height = "50%";
    } else if (currentStageIdx === 3) {
      cupLiquid.style.height = drink.liquidHeight || "85%";
    } else if (currentStageIdx === 4) {
      coffeeStream.classList.remove("pouring");
    }

    currentStageIdx++;
  }, 900);
}

function finishBrewing() {
  const drink = state.selectedDrink;
  const change = +(state.amountPaid - drink.price).toFixed(2);

  // Deduct ingredients
  deductIngredients(drink);

  // Update machine stats
  state.totalCupsServed += 1;
  state.totalEarnings += drink.price;

  // Turn off nozzle/steam
  document.getElementById("coffeeStream").classList.remove("pouring");
  document.getElementById("dispenserLed").classList.remove("active");

  // Dispense change if greater than 0
  if (change > 0) {
    dispensePhysicalChange(change);
  }

  // Play Victory sound
  sounds.playSuccessChime();

  // Render Receipt & Complete (Step 4)
  renderReceipt(drink, state.amountPaid, change);
  goToStep(4);
  addLog(`ORDER COMPLETE: Dispensed ${drink.name}. Paid: $${state.amountPaid.toFixed(2)}, Change: $${change.toFixed(2)}`);

  // Sync with Python backend
  syncOrderWithBackend(drink.id, state.amountPaid);
}

// ==========================================
// Change Return & Receipt (Req 5, 11)
// ==========================================

function dispensePhysicalChange(changeAmount) {
  const chute = document.getElementById("chuteTray");
  const statusText = document.getElementById("chuteStatusText");
  const dispensedCoins = document.getElementById("dispensedCoins");

  statusText.style.display = "none";
  dispensedCoins.innerHTML = "";

  sounds.playCoinDrop();

  // Generate coin icons
  let rem = Math.round(changeAmount * 100);
  const denominations = [
    { val: 100, label: "$1" },
    { val: 25, label: "25¢" },
    { val: 10, label: "10¢" },
    { val: 5, label: "5¢" }
  ];

  let coinCount = 0;
  denominations.forEach(d => {
    while (rem >= d.val && coinCount < 6) {
      rem -= d.val;
      coinCount++;
      const coin = document.createElement("div");
      coin.className = "coin-chip";
      coin.innerText = d.label;
      dispensedCoins.appendChild(coin);
    }
  });

  if (coinCount === 0) {
    const coin = document.createElement("div");
    coin.className = "coin-chip";
    coin.innerText = `$${changeAmount.toFixed(2)}`;
    dispensedCoins.appendChild(coin);
  }
}

function renderReceipt(drink, paid, change) {
  document.getElementById("readyDrinkTitle").innerText = `Your ${drink.name} is Ready!`;
  document.getElementById("receiptTimestamp").innerText = new Date().toLocaleString();
  document.getElementById("receiptItemName").innerText = `1x ${drink.name}`;
  document.getElementById("receiptItemPrice").innerText = `$${drink.price.toFixed(2)}`;
  
  const sugarText = state.customization.sugar === 0 ? "No Sugar" : `${state.customization.sugar} Sugar Cube${state.customization.sugar > 1 ? 's' : ''}`;
  document.getElementById("receiptCustoms").innerText = `Specs: ${sugarText} | ${state.customization.temperature}`;
  document.getElementById("receiptPaid").innerText = `$${paid.toFixed(2)}`;
  document.getElementById("receiptChange").innerText = change > 0 ? `$${change.toFixed(2)}` : "$0.00 (Exact)";
}

function resetKioskToMainMenu() {
  sounds.playBeep(600, 0.08);

  // Clear tray
  const statusText = document.getElementById("chuteStatusText");
  const dispensedCoins = document.getElementById("dispensedCoins");
  if (statusText) statusText.style.display = "block";
  if (dispensedCoins) dispensedCoins.innerHTML = "";

  // Reset cup visuals
  const cupLiquid = document.getElementById("cupLiquid");
  const steamContainer = document.getElementById("steamContainer");
  if (cupLiquid) cupLiquid.style.height = "0%";
  if (steamContainer) steamContainer.classList.remove("steaming");

  state.selectedDrink = null;
  state.amountPaid = 0.00;
  goToStep(1);
  renderMenu();
  document.getElementById("tickerText").innerText = "SYSTEM READY • READY FOR NEXT ORDER";
}

function updateStatsDisplay() {
  document.getElementById("statCups").innerText = state.totalCupsServed;
  document.getElementById("statRevenue").innerText = `$${state.totalEarnings.toFixed(2)}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ==========================================
// Python Backend API Sync
// ==========================================

function fetchBackendState() {
  fetch("/api/state")
    .then(res => res.json())
    .then(data => {
      if (data.ingredients) {
        state.ingredients = data.ingredients;
        updateTanksDisplay();
      }
      if (data.total_cups_served !== undefined) {
        state.totalCupsServed = data.total_cups_served;
        state.totalEarnings = data.total_earnings;
      }
      addLog("Connected to Python backend engine.");
    })
    .catch(() => {
      // Standalone mode works seamlessly with internal JavaScript engine
    });
}

function syncOrderWithBackend(recipeId, amountPaid) {
  fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipe_id: recipeId,
      amount_paid: amountPaid
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.state && data.state.ingredients) {
      state.ingredients = data.state.ingredients;
      updateTanksDisplay();
    }
  })
  .catch(() => {});
}
