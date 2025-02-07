const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

const corsOptions = {
  origin: ["https://yiming2718.github.io"], // 允許 GitHub Pages 來訪問
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔥 初始化 Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bulletin-board-f2c1c-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// 📨 提交留言
app.post("/messages", async (req, res) => {
  const { name, content } = req.body;
  if (!content) return res.status(400).json({ error: "留言內容不能為空" });

  try {
    const newMessageRef = db.ref("messages").push();
    await newMessageRef.set({
      name: name || "匿名",
      content,
      timestamp: Date.now(),
    });

    res.status(200).json({ success: true, message: "留言成功" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "留言儲存失敗" });
  }
});

// 📜 讀取留言
app.get("/messages", async (req, res) => {
  try {
    const snapshot = await db.ref("messages").orderByChild("timestamp").once("value");
    const messages = snapshot.val();
    res.json(messages ? Object.values(messages).reverse() : []);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "無法獲取留言" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
