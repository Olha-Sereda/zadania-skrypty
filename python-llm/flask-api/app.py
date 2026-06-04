import json
from pathlib import Path

from flask import Flask, abort, jsonify, request

DATA_PATH = Path(__file__).parent / "data.json"

QUEUE_BUFFER_MIN = 5
PER_EXTRA_ITEM_MIN = 2

app = Flask(__name__)


def load_dishes() -> list[dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def estimate_minutes(item_ids: list[int], dishes: list[dict]) -> dict:
    by_id = {d["id"]: d for d in dishes}
    unknown = [i for i in item_ids if i not in by_id]
    if unknown:
        abort(400, description=f"Unknown dish ids: {unknown}")

    prep_times = [by_id[i]["prep_time_minutes"] for i in item_ids]
    n = len(item_ids)
    longest = max(prep_times)
    extras = PER_EXTRA_ITEM_MIN * (n - 1)
    minutes = longest + extras + QUEUE_BUFFER_MIN

    breakdown = (
        f"max prep ({longest} min) + extras for {n - 1} item(s) ({extras} min) "
        f"+ queue buffer ({QUEUE_BUFFER_MIN} min)"
    )
    return {"minutes": minutes, "breakdown": breakdown, "item_count": n}


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


@app.post("/api/estimate")
def estimate():
    body = request.get_json(silent=True) or {}
    item_ids = body.get("item_ids")
    if not isinstance(item_ids, list) or not item_ids:
        abort(400, description="Body must be {'item_ids': [<int>, ...]} (non-empty list).")
    return jsonify(estimate_minutes(item_ids, load_dishes()))


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
