# Coffee_Machine_Simulator

Coffee Vending Machine Simulator for CCA-2. A complete simulation of a real vending machine with coffee selection, payment processing, insufficient/exact/excess payment handling, automatic ingredient refilling, ingredient management, change calculation, transaction cancellation and refunds, input validation, and support for multiple transactions.

🌐 **Live Demo (GitHub Pages)**: [https://prats-11.github.io/Coffee_Machine_Simulator/](https://prats-11.github.io/Coffee_Machine_Simulator/)

---

## ☕ BaristaCraft Pro™ - Coffee Vending Machine Simulator

An interactive **Coffee Vending Machine Simulator** built in **Python 3** and modern web technologies, featuring both a **high-end Touchscreen Web GUI (Kiosk Simulator)** and a **Terminal CLI Engine**.

---

## 🚀 Key Features (Mapped to Requirements)

| # | Requirement | Implementation in Simulator |
|---|---|---|
| **1** | **Menu Display** | Displays Espresso ($3.00), Cappuccino ($4.50), Caffè Latte ($4.00), Americano ($3.50), Mocha ($5.00), Caramel Macchiato ($4.75) with live specs. |
| **2** | **Selection & Money Input** | Interactive coffee selection with coin/bill inputs ($1, $2, $5, $10, $20, custom amounts, and contactless card tap). |
| **3** | **Amount Validation** | Real-time checks whether inserted funds are insufficient, exact, or greater than drink price. |
| **4** | **Insufficient Balance Handling** | Displays remaining balance needed dynamically and prompts user to insert additional money. |
| **5** | **Change Calculation & Return** | Calculates exact difference and dispenses physical change animation & breakdown in the coin chute. |
| **6** | **Ingredient Management** | Real-time tracking of **Water (ml)**, **Milk (ml)**, **Coffee Powder (g)**, and **Sugar (g)** with animated tank gauges. |
| **7** | **Automatic Smart Refill** | When any ingredient drops below threshold or drink requirement, system automatically refills tank to maximum capacity with visual/toast alert and logs. |
| **8** | **Ingredient Deduction** | Precisely deducts recipe proportions upon successful drink preparation. |
| **9** | **Transaction Cancellation & Full Refund** | Allows user to cancel before brewing; instantly returns all inserted money with chime and tray animation. |
| **10** | **Input & Error Handling** | Validates menu numbers, negative/invalid currency inputs, and out-of-bound requests gracefully. |
| **11** | **Continuous Operation Loop** | Returns to the Main Menu automatically after every completed or cancelled transaction for the next customer. |

---

## 🖥️ How to Run

### 🌟 Option 1: Live Web Demo (GitHub Pages)
Visit [https://prats-11.github.io/Coffee_Machine_Simulator/](https://prats-11.github.io/Coffee_Machine_Simulator/)

### 🌟 Option 2: Local Web GUI
Run the Python web server:
```bash
python3 app.py
```
*Your default browser will automatically open `http://localhost:8080` with high-fidelity visuals, brewing animations, and synthesized audio effects.*

### 💻 Option 3: Interactive Terminal CLI
Run the pure Python command-line simulator:
```bash
python3 coffee_machine.py
```

---

## 🎨 Visual & Technical Highlights
- **Realistic Audio Synthesizer**: Web Audio API generating authentic coffee bean grinding, steaming milk, coin drop, and cash return chimes.
- **Dynamic Cup Visualizer**: Real-time glass cup filling with coffee streams, steam particle physics, and foam layers customized to the selected drink.
- **Smart Telemetry Drawer**: Live diagnostics monitor for total cups served, revenue earned, and detailed auto-refill logs.
- **Zero External Dependencies**: Works out-of-the-box with standard web technologies and Python 3 standard library!
