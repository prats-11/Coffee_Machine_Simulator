"""
Coffee Vending Machine Simulator - Web App Server
Provides REST API endpoints and static file serving using Python standard library.
Run with: python3 app.py
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import webbrowser
import threading
import sys
from coffee_machine import CoffeeMachine

machine = CoffeeMachine()
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CoffeeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == "/api/state":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            state = machine.get_state()
            self.wfile.write(json.dumps(state).encode("utf-8"))
        elif parsed_url.path == "/" or parsed_url.path == "":
            self.path = "/index.html"
            return super().do_GET()
        else:
            return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        data = {}
        if post_data:
            try:
                data = json.loads(post_data)
            except Exception:
                data = {}

        if parsed_url.path == "/api/order":
            recipe_id = data.get("recipe_id")
            amount_paid = float(data.get("amount_paid", 0.0))
            recipe = machine.get_recipe_by_id(recipe_id)

            if not recipe:
                self.send_json_response({"success": False, "error": "Invalid coffee selection."}, 400)
                return

            if amount_paid < recipe.price:
                remaining = round(recipe.price - amount_paid, 2)
                self.send_json_response({
                    "success": False, 
                    "error": f"Insufficient amount. Remaining needed: ${remaining:.2f}",
                    "remaining": remaining,
                    "price": recipe.price,
                    "paid": amount_paid
                }, 400)
                return

            change = round(amount_paid - recipe.price, 2)

            # Check and auto refill if needed
            refills = machine.check_and_auto_refill(recipe)

            # Deduct ingredients
            machine.deduct_ingredients(recipe)

            self.send_json_response({
                "success": True,
                "message": f"Brewed {recipe.name} successfully!",
                "recipe": recipe.to_dict(),
                "price": recipe.price,
                "paid": amount_paid,
                "change": change,
                "refills": refills,
                "state": machine.get_state()
            }, 200)

        elif parsed_url.path == "/api/refill":
            machine.manual_refill_all()
            self.send_json_response({
                "success": True,
                "message": "All ingredients refilled to full capacity.",
                "state": machine.get_state()
            }, 200)

        elif parsed_url.path == "/api/cancel":
            refund_amount = float(data.get("amount_paid", 0.0))
            machine.add_log(f"Transaction cancelled. Refunded ${refund_amount:.2f}")
            self.send_json_response({
                "success": True,
                "message": f"Transaction cancelled. Refund of ${refund_amount:.2f} processed.",
                "refund": refund_amount,
                "state": machine.get_state()
            }, 200)

        else:
            self.send_json_response({"error": "Endpoint not found"}, 404)

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, format, *args):
        # Suppress standard noisy logging to keep terminal clean
        pass

def open_browser():
    import time
    time.sleep(1.0)
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == "__main__":
    server_address = ("", PORT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, CoffeeHandler) as httpd:
        print("=" * 65)
        print(f"☕ COFFEE VENDING MACHINE SIMULATOR WEB SERVER RUNNING")
        print(f"👉 Local URL: http://localhost:{PORT}")
        print("=" * 65)
        print("Press Ctrl+C to stop server\n")
        
        # Open in default browser automatically
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully. Goodbye!")
            httpd.server_close()
