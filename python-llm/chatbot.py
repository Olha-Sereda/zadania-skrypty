from pathlib import Path

import ollama
import requests
import yaml


MODEL_NAME = "llama3.2"
CONFIG_PATH = Path(__file__).parent / "config.yaml"

PROMPT_TEMPLATE = """\
You are a polite assistant for "{name}", a cafe famous for stuffed
croissants and specialty coffee. You speak English, briefly and to the point.
Your job is to recognize the user's intent and respond accordingly.

You recognize exactly 3 intents:

1) GREETING — when the user greets you.
   Example phrasings: "Hi", "Hello", "Hey", "Good morning", "Good evening".
   Response: greet warmly and ask how you can help (e.g. offer to show the
   menu or take an order).

2) MENU — when the user asks to see the offer or asks about a specific dish
   (ingredients, allergens, dietary info).
   Example phrasings: "What's on the menu?", "Show me the card",
   "Does the chicken croissant contain gluten?", "What's in the lemonade?",
   "Is the espresso vegan?".
   Response: list the menu items with prices, OR answer the specific
   ingredient/allergen question using ONLY the data provided below.

3) ORDER — when the user wants to order something, possibly with modifications.
   Example phrasings: "I'd like a chocolate croissant", "A latte please",
   "I'll have a ham & cheese croissant without cheese", "Cappuccino with oat milk",
   "Hot chocolate, but make it sugar-free".
   Response: confirm the order, repeat what was ordered (including any
   modifications the user requested), give the approximate total price,
   AND give the estimated pickup time using the formula in the rules below.
   Modifications do not change the price or prep time.

Opening hours of "{name}":
{hours}

"{name}" menu (loaded from the Flask API at {api_base}):
{menu}

Rules:
- If the user's message does not match any of the 3 intents, politely ask
  for clarification and propose one of the 3 options (greeting, menu, order).
- Never invent dishes that are not on the menu above.
- Always reply in English, even if the user writes in another language.
- If the user asks about opening hours, answer using the hours listed above.
- For allergen / ingredient questions, answer ONLY based on the data above.
  If the data does not list a specific allergen for a dish, say it is not
  listed — do not guess.
- For dish modifications ("without X", "with extra Y", "sugar-free", etc.),
  accept them and include them in the order confirmation.
- PICKUP TIME ESTIMATION (always include in order confirmation):
  Use this exact formula:
      pickup_minutes = max(prep_time of all ordered items)
                     + 2 * (number_of_items - 1)
                     + 5
  Example A: 1x Chicken Caesar croissant (prep 6) + 1x Latte (prep 3)
      n=2 → max(6, 3) + 2*1 + 5 = 6 + 2 + 5 = 13 minutes.
  Example B: same order + 1x Lemonade (prep 2)
      n=3 → max(6, 3, 2) + 2*2 + 5 = 6 + 4 + 5 = 15 minutes.
  Phrase it like: "Your order will be ready for pickup in about X minutes."
- RECOMPUTE the pickup time from scratch EVERY time the order changes
  (item added, item removed). The new estimate replaces the old one.
  Never reuse a previously quoted estimate when the order has changed.
- If the user asks about prep time WITHOUT ordering ("how long for a latte?"),
  quote the prep_time_minutes for that dish from the data above.
- ABSOLUTELY DO NOT discuss, ask about, or mention any of the following
  — these are out of scope and will come later:
  * payment, paying, card, cash, bill, receipt
  * delivery, shipping, takeaway logistics
  * table reservations, seating
  * loyalty programs, discounts, promotions
  If the user brings up any of these, politely say it's not supported yet
  and steer back to greeting / menu / order.
- After an order, only confirm the items (with modifications), the total
  price, and the pickup time. Then stop. Do NOT ask follow-up questions
  about payment, delivery, or anything else.
"""


def load_config(path: Path = CONFIG_PATH) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_dishes(api_base_url: str) -> list[dict]:
    response = requests.get(f"{api_base_url}/api/dishes", timeout=5)
    response.raise_for_status()
    return response.json()


def format_menu(dishes: list[dict], currency: str) -> str:
    by_category: dict[str, list[dict]] = {}
    for dish in dishes:
        by_category.setdefault(dish["category"], []).append(dish)

    lines: list[str] = []
    for category, items in by_category.items():
        lines.append(f"{category}:")
        for item in items:
            allergens = ", ".join(item["allergens"]) if item["allergens"] else "none"
            ingredients = ", ".join(item["ingredients"])
            lines.append(f"- {item['name']} — {item['price']} {currency} "
                         f"(prep: {item['prep_time_minutes']} min)")
            lines.append(f"    ingredients: {ingredients}")
            lines.append(f"    allergens: {allergens}")
    return "\n".join(lines)


def format_hours(hours: dict) -> str:
    return "\n".join(f"- {day.capitalize()}: {time}" for day, time in hours.items())


def build_system_prompt(config: dict, dishes: list[dict]) -> str:
    return PROMPT_TEMPLATE.format(
        name=config["restaurant"]["name"],
        hours=format_hours(config["opening_hours"]),
        menu=format_menu(dishes, config["currency"]),
        api_base=config["api"]["base_url"],
    )


def build_initial_history(system_prompt: str) -> list[dict]:
    return [{"role": "system", "content": system_prompt}]


def ask_model(history: list[dict]) -> str:
    response = ollama.chat(model=MODEL_NAME, messages=history)
    return response["message"]["content"]


def chat_loop() -> None:
    config = load_config()
    restaurant_name = config["restaurant"]["name"]
    api_base_url = config["api"]["base_url"]

    try:
        dishes = fetch_dishes(api_base_url)
    except requests.RequestException as e:
        print(f"[Cannot reach Flask API at {api_base_url}] {e}")
        print("Start it first: `cd flask-api && python app.py`")
        return

    system_prompt = build_system_prompt(config, dishes)

    print("=" * 60)
    print(f"  '{restaurant_name}' chatbot  (model: {MODEL_NAME})")
    print(f"  Loaded {len(dishes)} dishes from {api_base_url}")
    print("  Type 'exit' or press Ctrl+C to quit.")
    print("=" * 60)

    history = build_initial_history(system_prompt)

    while True:
        try:
            user_input = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        history.append({"role": "user", "content": user_input})

        try:
            answer = ask_model(history)
        except Exception as e:
            print(f"\n[Ollama communication error] {e}")
            print("Make sure `ollama serve` is running and the model "
                  f"`{MODEL_NAME}` has been pulled (`ollama pull {MODEL_NAME}`).")
            history.pop()
            continue

        history.append({"role": "assistant", "content": answer})
        print(f"\nBot: {answer}")


if __name__ == "__main__":
    chat_loop()
