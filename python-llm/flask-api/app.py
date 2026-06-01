import json
from pathlib import Path

from flask import Flask, abort, jsonify

DATA_PATH = Path(__file__).parent / "data.json"

app = Flask(__name__)


def load_dishes() -> list[dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/dishes")
def list_dishes():
    return jsonify(load_dishes())


@app.get("/api/dishes/<int:dish_id>")
def get_dish(dish_id: int):
    for dish in load_dishes():
        if dish["id"] == dish_id:
            return jsonify(dish)
    abort(404, description=f"Dish with id={dish_id} not found")


@app.get("/api/allergens")
def list_allergens():
    dishes = load_dishes()
    allergens = sorted({a for dish in dishes for a in dish["allergens"]})
    return jsonify(allergens)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
