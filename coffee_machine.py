"""
Coffee Vending Machine Simulator
Core Engine & CLI Implementation
Language: Python 3
"""

import time
import sys
import os

class Ingredient:
    def __init__(self, name: str, unit: str, capacity: float, current_level: float, refill_threshold: float):
        self.name = name
        self.unit = unit
        self.capacity = capacity
        self.current_level = current_level
        self.refill_threshold = refill_threshold

    def has_sufficient(self, required_amount: float) -> bool:
        return self.current_level >= required_amount

    def consume(self, amount: float):
        if self.current_level >= amount:
            self.current_level -= amount
            return True
        return False

    def refill(self, target_level: float = None):
        if target_level is None:
            target_level = self.capacity
        previous = self.current_level
        self.current_level = min(self.capacity, target_level)
        return self.current_level - previous

    def to_dict(self):
        return {
            "name": self.name,
            "unit": self.unit,
            "capacity": self.capacity,
            "current_level": round(self.current_level, 2),
            "refill_threshold": self.refill_threshold,
            "percentage": round((self.current_level / self.capacity) * 100, 1)
        }


class CoffeeRecipe:
    def __init__(self, id: str, name: str, price: float, description: str, 
                 water_ml: float, milk_ml: float, coffee_g: float, sugar_g: float,
                 icon: str = "☕", brew_time_sec: int = 3):
        self.id = id
        self.name = name
        self.price = price
        self.description = description
        self.recipe = {
            "water": water_ml,
            "milk": milk_ml,
            "coffee_powder": coffee_g,
            "sugar": sugar_g
        }
        self.icon = icon
        self.brew_time_sec = brew_time_sec

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "recipe": self.recipe,
            "icon": self.icon,
            "brew_time_sec": self.brew_time_sec
        }


class CoffeeMachine:
    def __init__(self):
        # Ingredient Capacities and Predefined Refill Levels
        self.ingredients = {
            "water": Ingredient("Water", "ml", capacity=2000.0, current_level=1200.0, refill_threshold=150.0),
            "milk": Ingredient("Milk", "ml", capacity=1500.0, current_level=900.0, refill_threshold=120.0),
            "coffee_powder": Ingredient("Coffee Powder", "g", capacity=500.0, current_level=300.0, refill_threshold=25.0),
            "sugar": Ingredient("Sugar", "g", capacity=400.0, current_level=250.0, refill_threshold=20.0),
        }

        # Menu configuration
        self.menu = [
            CoffeeRecipe("espresso", "Espresso", 3.00, "Rich, intense full-bodied single shot of pure espresso", 
                         water_ml=50, milk_ml=0, coffee_g=18, sugar_g=0, icon="☕", brew_time_sec=2),
            CoffeeRecipe("cappuccino", "Cappuccino", 4.50, "Espresso topped with creamy steamed milk and thick velvety foam", 
                         water_ml=100, milk_ml=120, coffee_g=18, sugar_g=10, icon="🥛", brew_time_sec=3),
            CoffeeRecipe("latte", "Caffè Latte", 4.00, "Delicate espresso blended with silky steamed milk and light microfoam", 
                         water_ml=80, milk_ml=150, coffee_g=16, sugar_g=10, icon="🍶", brew_time_sec=3),
            CoffeeRecipe("americano", "Americano", 3.50, "Bold espresso diluted with hot steaming water for smooth sip", 
                         water_ml=180, milk_ml=0, coffee_g=18, sugar_g=5, icon="🫖", brew_time_sec=2),
            CoffeeRecipe("mocha", "Caffè Mocha", 5.00, "Espresso infused with rich dark chocolate, steamed milk and sugar", 
                         water_ml=80, milk_ml=120, coffee_g=18, sugar_g=20, icon="🍫", brew_time_sec=4),
            CoffeeRecipe("macchiato", "Caramel Macchiato", 4.75, "Steamed milk stained with espresso and sweet caramel drizzle", 
                         water_ml=70, milk_ml=110, coffee_g=16, sugar_g=15, icon="🍯", brew_time_sec=3)
        ]

        self.total_earnings = 0.0
        self.total_cups_served = 0
        self.logs = []
        self.add_log("Machine initialized with standard capacities and menu.")

    def add_log(self, message: str):
        timestamp = time.strftime("%H:%M:%S")
        self.logs.append(f"[{timestamp}] {message}")
        if len(self.logs) > 50:
            self.logs.pop(0)

    def get_recipe_by_id(self, recipe_id: str):
        for item in self.menu:
            if item.id == recipe_id:
                return item
        return None

    def check_and_auto_refill(self, recipe: CoffeeRecipe):
        """
        Check if any ingredient required for selected coffee is below requirement or threshold.
        If so, automatically refills up to predefined maximum capacity.
        Returns a list of refilled ingredients messages.
        """
        refill_events = []
        for ing_key, required_qty in recipe.recipe.items():
            ingredient = self.ingredients.get(ing_key)
            if not ingredient:
                continue

            # If current level is less than required for drink or below refill threshold
            if ingredient.current_level < required_qty or ingredient.current_level <= ingredient.refill_threshold:
                refilled_amount = ingredient.refill()
                msg = f"Auto-refilled {ingredient.name}: +{refilled_amount:.1f}{ingredient.unit} (Restored to {ingredient.capacity}{ingredient.unit})"
                refill_events.append({
                    "ingredient": ingredient.name,
                    "added": refilled_amount,
                    "new_level": ingredient.current_level,
                    "unit": ingredient.unit,
                    "message": msg
                })
                self.add_log(f"ALERT: {msg}")
        return refill_events

    def deduct_ingredients(self, recipe: CoffeeRecipe):
        """Deducts the required ingredients for the coffee."""
        for ing_key, required_qty in recipe.recipe.items():
            ingredient = self.ingredients.get(ing_key)
            if ingredient:
                ingredient.consume(required_qty)
        self.add_log(f"Dispensed '{recipe.name}'. Ingredients deducted.")
        self.total_cups_served += 1
        self.total_earnings += recipe.price

    def manual_refill_all(self):
        for ingredient in self.ingredients.values():
            ingredient.refill()
        self.add_log("Manual maintenance: All ingredients refilled to full capacity.")

    def get_state(self):
        return {
            "menu": [item.to_dict() for item in self.menu],
            "ingredients": {k: v.to_dict() for k, v in self.ingredients.items()},
            "total_earnings": round(self.total_earnings, 2),
            "total_cups_served": self.total_cups_served,
            "logs": self.logs[-15:]
        }


# ==========================================
# Interactive Terminal CLI Simulator
# ==========================================

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    print("=" * 60)
    print("      ☕  COFFEE VENDING MACHINE SIMULATOR  ☕      ")
    print("=" * 60)

def display_menu(machine: CoffeeMachine):
    print("\n----------------- 📋 COFFEE MENU -----------------")
    print(f"{'No.':<4} {'Drink':<18} {'Price':<8} {'Description'}")
    print("-" * 60)
    for idx, item in enumerate(machine.menu, 1):
        print(f"[{idx}]  {item.name:<18} ${item.price:<6.2f} {item.description[:32]}...")
    print(f"[R]  Refill Status & Machine Telemetry")
    print(f"[Q]  Quit Simulator")
    print("-" * 60)

def display_ingredients(machine: CoffeeMachine):
    print("\n----------------- 📊 INGREDIENTS STATUS -----------------")
    for key, ing in machine.ingredients.items():
        pct = (ing.current_level / ing.capacity) * 100
        bars = int(pct / 5)
        bar_str = "[" + "#" * bars + "-" * (20 - bars) + "]"
        print(f"{ing.name:<15}: {ing.current_level:>7.1f} / {ing.capacity:<6.1f} {ing.unit:<3} {bar_str} ({pct:>5.1f}%)")
    print(f"Total Served: {machine.total_cups_served} cups | Total Earnings: ${machine.total_earnings:.2f}")
    print("-" * 60)

def run_cli_simulator():
    machine = CoffeeMachine()
    
    while True:
        clear_screen()
        print_banner()
        display_ingredients(machine)
        display_menu(machine)
        
        choice = input("\nEnter your choice (1-6, R, Q): ").strip()
        
        if choice.lower() == 'q':
            print("\nThank you for using the Coffee Vending Machine Simulator. Have a wonderful day!\n")
            break

        if choice.lower() == 'r':
            clear_screen()
            print_banner()
            display_ingredients(machine)
            refill_choice = input("\nWould you like to manually refill all ingredients to 100%? (y/n): ").strip().lower()
            if refill_choice == 'y':
                machine.manual_refill_all()
                print("\n✅ All ingredients have been successfully refilled!")
            input("\nPress [Enter] to return to Main Menu...")
            continue

        # Validate menu selection
        if not choice.isdigit() or int(choice) < 1 or int(choice) > len(machine.menu):
            print("\n❌ Invalid choice! Please select a valid option from the menu.")
            time.sleep(1.8)
            continue

        selected_recipe = machine.menu[int(choice) - 1]
        
        # Start Transaction Process
        clear_screen()
        print_banner()
        print(f"\n👉 You selected: {selected_recipe.icon} {selected_recipe.name}")
        print(f"💵 Price: ${selected_recipe.price:.2f}")
        print(f"📝 Description: {selected_recipe.description}")
        print("-" * 60)
        
        # Payment Loop
        current_inserted = 0.0
        transaction_cancelled = False
        
        while current_inserted < selected_recipe.price:
            remaining = selected_recipe.price - current_inserted
            print(f"\nTotal Price:       ${selected_recipe.price:.2f}")
            print(f"Amount Inserted:   ${current_inserted:.2f}")
            print(f"Remaining Balance: ${remaining:.2f}")
            print("\nOptions:")
            print(" - Enter money to insert (e.g. 1, 2, 5, 10, or exact decimals)")
            print(" - Enter 'C' to CANCEL transaction and refund your money")
            
            user_input = input("\nInsert money or [C]ancel: ").strip()
            
            if user_input.upper() == 'C':
                transaction_cancelled = True
                break
                
            try:
                amount = float(user_input)
                if amount <= 0:
                    print("⚠️ Please enter a positive monetary amount.")
                    continue
                current_inserted += amount
                print(f"✅ Accepted: ${amount:.2f}")
            except ValueError:
                print("❌ Invalid input! Please enter a valid number or 'C' to cancel.")
        
        # Handle Cancellation
        if transaction_cancelled:
            print("\n🚫 Transaction Cancelled by user.")
            if current_inserted > 0:
                print(f"💸 REFUND PROCESSED: Returning ${current_inserted:.2f} back to you.")
            else:
                print("No money was inserted.")
            input("\nPress [Enter] to return to Main Menu...")
            continue
            
        # Payment Successful - Check Change
        change = current_inserted - selected_recipe.price
        print("\n" + "=" * 60)
        print("💳 PAYMENT ACCEPTED!")
        print(f"Total Paid: ${current_inserted:.2f} | Price: ${selected_recipe.price:.2f}")
        if change > 0:
            print(f"💰 CHANGE DISPENSED: ${change:.2f}")
        else:
            print("🎯 Exact amount received. No change required.")
        print("=" * 60)
        
        # Ingredient Check and Auto-Refill
        print("\n🔍 Checking ingredient levels...")
        refills = machine.check_and_auto_refill(selected_recipe)
        if refills:
            print("\n⚠️ [AUTOMATIC REFILL SYSTEM TRIGGERED]")
            for r in refills:
                print(f"  ➜ {r['message']}")
            time.sleep(1.5)
        else:
            print("✅ All required ingredients are available in sufficient quantities.")
            
        # Preparation / Brewing Animation
        print(f"\n⚙️ Brewing your fresh {selected_recipe.name}...")
        stages = [
            "1. Grinding premium coffee beans...",
            "2. Heating fresh purified water to 92°C...",
            "3. Extracting rich espresso under 9 bar pressure...",
            "4. Frothing & blending ingredients...",
            "5. Pouring into cup and finishing..."
        ]
        for stage in stages:
            print(f"   {stage}")
            time.sleep(0.5)
            
        # Deduct Ingredients
        machine.deduct_ingredients(selected_recipe)
        
        print("\n" + "*" * 60)
        print(f"✨ 🎉 YOUR {selected_recipe.name.upper()} IS READY! ☕ 🎉 ✨")
        print("Please take your cup and enjoy your freshly brewed coffee!")
        print("*" * 60)
        
        input("\nPress [Enter] to return to Main Menu for the next order...")

if __name__ == "__main__":
    run_cli_simulator()
