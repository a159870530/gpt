import express from 'express';
import { middleware, Client } from '@line/bot-sdk';
import dotenv from 'dotenv';
import cron from 'node-cron';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Client(lineConfig);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/webhook', (_req, res) => res.status(200).send('OK'));

app.post('/webhook', middleware(lineConfig), async (req, res) => {
  res.status(200).end();

  const events = req.body?.events || [];
  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是使用者的女朋友，語氣要溫柔、可愛、甜。' },
          { role: 'user', content: userMessage },
        ],
      });

      const aiReply = chatCompletion.choices[0]?.message?.content || '我不知道怎麼回答你 >_<';
      await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: aiReply,
      });
    } catch (err) {
      console.error('Reply error:', err);
    }
  }
});

app.get('/health', (_req, res) => res.status(200).send('OK'));

app.listen(PORT, () => {
  console.log(`Bot is live on port ${PORT}`);
});
