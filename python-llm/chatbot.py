import ollama


MODEL_NAME = "llama3.2"

SYSTEM_PROMPT = """\
You are a polite assistant for "Lviv Croissants", a cafe famous for stuffed
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

"Lviv Croissants" menu (scope 3.0 — data hard-coded in the prompt):
Sweet croissants:
- Chocolate croissant — 15 PLN
- Nutella & banana croissant — 17 PLN
- Apple & cinnamon croissant — 16 PLN
- Raspberry croissant — 16 PLN
Savory croissants:
- Ham & cheese croissant — 19 PLN
- Chicken Caesar croissant — 23 PLN
- Salmon & cream cheese croissant — 25 PLN
- Mushroom & cheese croissant — 21 PLN
Drinks:
- Espresso — 10 PLN
- Cappuccino — 14 PLN
- Latte — 15 PLN
- Hot chocolate — 16 PLN
- Lemonade — 14 PLN

Rules:
- If the user's message does not match any of the 3 intents, politely ask
  for clarification and propose one of the 3 options (greeting, menu, order).
- Never invent dishes that are not on the menu above.
- Always reply in English, even if the user writes in another language.
- IMPORTANT: stay strictly within scope 3.0. Do NOT discuss delivery,
  pickup, table reservations, allergies, opening hours, or anything beyond
  the 3 intents above — those features will come later.
- After an order, only confirm the items and the total. Do not ask about
  delivery, pickup, payment, or anything else.
"""

def build_initial_history() -> list[dict]:
    return [{"role": "system", "content": SYSTEM_PROMPT}]


def ask_model(history: list[dict]) -> str:
    response = ollama.chat(model=MODEL_NAME, messages=history)
    return response["message"]["content"]


def chat_loop() -> None:
    print("=" * 60)
    print("  'Lviv Croissants' chatbot  (model: " + MODEL_NAME + ")")
    print("  Type 'exit' or press Ctrl+C to quit.")
    print("=" * 60)

    history = build_initial_history()

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
