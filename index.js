// 修改版 index.js，使用 OpenRouter 免費 GPT 模型（修正 openai 套件不支援 Configuration）
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

app.get('/', (_req, res) => {
  res.send('Line GPT bot is running');
});

app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;

        const completion = await openai.chat.completions.create({
          model: 'openrouter/openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一位健談、機智幽默、溫柔鼓勵的 AI 女友，說話方式像 Z 世代，像女友一樣跟使用者聊天。'
            },
            { role: 'user', content: userMessage }
          ]
        });

        const replyMessage = completion.choices[0].message.content;

        // 這裡可以加上 LINE 回傳訊息的程式碼
        console.log(`Reply to user: ${replyMessage}`);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Reply error:', err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Bot is live on port ${port}`);
});
