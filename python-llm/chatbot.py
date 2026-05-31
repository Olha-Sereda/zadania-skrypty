from pathlib import Path

import ollama
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

2) MENU — when the user asks to see the offer.
   Example phrasings: "What's on the menu?", "Show me the card",
   "What do you serve?", "What can I order?", "Give me the list of dishes".
   Response: list the menu items as a clean bullet list with prices.

3) ORDER — when the user wants to order something.
   Example phrasings: "I'd like a chocolate croissant", "A latte please",
   "I'll have a ham & cheese croissant", "I'm ordering a cappuccino",
   "Hot chocolate for me".
   Response: confirm the order, repeat what was ordered, and give the
   approximate total price.

Opening hours of "{name}":
{hours}

"{name}" menu (loaded from config.yaml):
{menu}

Rules:
- If the user's message does not match any of the 3 intents, politely ask
  for clarification and propose one of the 3 options (greeting, menu, order).
- Never invent dishes that are not on the menu above.
- Always reply in English, even if the user writes in another language.
- If the user asks about opening hours, answer using the hours listed above.
- IMPORTANT: do NOT discuss delivery, pickup, table reservations, allergies,
  or anything beyond the 3 intents and opening hours — those features will
  come later.
- After an order, only confirm the items and the total. Do not ask about
  delivery, pickup, payment, or anything else.
"""


def load_config(path: Path = CONFIG_PATH) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def format_menu(menu: list[dict], currency: str) -> str:
    lines: list[str] = []
    for category in menu:
        lines.append(f"{category['category']}:")
        for item in category["items"]:
            lines.append(f"- {item['name']} — {item['price']} {currency}")
    return "\n".join(lines)


def format_hours(hours: dict) -> str:
    return "\n".join(f"- {day.capitalize()}: {time}" for day, time in hours.items())


def build_system_prompt(config: dict) -> str:
    return PROMPT_TEMPLATE.format(
        name=config["restaurant"]["name"],
        hours=format_hours(config["opening_hours"]),
        menu=format_menu(config["menu"], config["currency"]),
    )


def build_initial_history(system_prompt: str) -> list[dict]:
    return [{"role": "system", "content": system_prompt}]


def ask_model(history: list[dict]) -> str:
    response = ollama.chat(model=MODEL_NAME, messages=history)
    return response["message"]["content"]


def chat_loop() -> None:
    config = load_config()
    restaurant_name = config["restaurant"]["name"]
    system_prompt = build_system_prompt(config)

    print("=" * 60)
    print(f"  '{restaurant_name}' chatbot  (model: {MODEL_NAME})")
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
