// 引入需要的模組
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const corsOptions = {
  origin: "*",  // 允許所有網域
  methods: "GET, POST, OPTIONS",  // 允許的 HTTP 請求方法
  allowedHeaders: "Content-Type",  // 允許的標頭
};

// 啟用 CORS，並傳入配置
app.use(cors(corsOptions));

// 處理 OPTIONS 預檢請求
app.options("*", cors(corsOptions));


// 啟用 CORS，這樣可以讓不同網域的請求能夠進來
// app.use(cors({
//   origin: "https://yiming2718.github.io",  // 允許來自這個網址的請求
//   methods: "GET,POST", // 允許的請求方式
//   allowedHeaders: "Content-Type"  // 允許的標頭
// }));

// app.use(express.json());

// 初始化 Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 📨 提交留言
app.post("/messages", async (req, res) => {
  const { name, content } = req.body;
  console.log("Received message:", { name, content });

  if (!content) return res.status(400).json({ error: "留言內容不能為空" });

  try {
    await db.collection("messages").add({
      name: name || "匿名",
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Message saved successfully!");

    res.status(200).json({
      success: true,
      message: "留言成功",
      data: { name, content },
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "留言存儲失敗" });
  }
});


app.get("/", (req, res) => {
  res.send("🐾 嗷嗷～匿名留言板伺服器跑起來了！🚀");
});


// 📜 讀取留言
app.get("/messages", async (req, res) => {
    try {
        const snapshot = await db.collection("messages").orderBy("timestamp", "desc").get();
        const messages = snapshot.docs.map((doc) => doc.data());
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "無法獲取留言" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
