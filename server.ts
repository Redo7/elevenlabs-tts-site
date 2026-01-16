import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { Readable } from 'stream';
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const app = express();
app.use(express.static('dist'));
const PORT = 3001;

const elevenlabs = new ElevenLabsClient();
const voice_id = process.env.VOICE_ID;
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 10,
	standardHeaders: true, 
	legacyHeaders: false,
	message: { error: 'Too many requests, please try again later.' },
});
const PASSWORD = process.env.PASSWORD;
const DEV = process.env.DEV;

app.use(cors({
    origin: true,
    credentials: true,
}))
app.use(express.json());
app.use(limiter);
app.use(cookieParser());

if(voice_id === undefined) throw new Error("voice_id is not set");

app.get("/api/", async (req, res) => {
    const { password } = req.query;
    if (password === PASSWORD) {
        res.cookie("password", PASSWORD, {
          httpOnly: true,
          secure: DEV === "1" ? false : true,
          sameSite: DEV === "1" ? "lax" : "none",
          maxAge: 1000 * 60 * 60 * 24 * 7, 
        });
        res.status(200).send();
    } else {
        res.send();
    }
});

app.post("/api/play-test-sample/", async (req, res) => {
    try {
        const { stability, originalMessage } = req.body;

        let input = req.cookies.password === PASSWORD && originalMessage != "" ? originalMessage : '[sad] This is a test. [confused] or is it?';

        const webStream = await elevenlabs.textToSpeech.stream(voice_id, {
            text: input,
            modelId: process.env.MODEL_ID,
            voiceSettings: {                      // Range              | Default Value
                stability: stability              // 0.0 || 0.5 || 1.0  | 0.5
            },
        });

        const nodeStream = Readable.fromWeb(webStream as any);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
        });

        nodeStream.pipe(res);
    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});