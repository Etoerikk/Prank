require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Конфигурация Multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
  }
});

const upload = multer({ storage: storage });

// Отправка фото в Telegram
async function sendPhotoToTelegram(chatId, photoPath) {
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', fs.createReadStream(photoPath));
  
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    console.log('Photo sent to Telegram:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending photo to Telegram:', error.response?.data || error.message);
    return false;
  }
}

// Маршрут для получения фото с фронтенда
app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const chatId = process.env.TELEGRAM_CHAT_ID;
    const photoPath = req.file.path;

    const success = await sendPhotoToTelegram(chatId, photoPath);
    
    if (success) {
      res.json({ success: true, message: 'Photo sent to Telegram' });
    } else {
      res.status(500).json({ error: 'Failed to send photo' });
    }
  } catch (error) {
    console.error('Error processing photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Удаляем временный файл после отправки
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
  }
});

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});