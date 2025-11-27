const { google } = require("googleapis");
const readline = require("readline");
const fs = require("fs");

// Đọc file client_secret JSON anh upload
const credentials = JSON.parse(
  fs.readFileSync(
    "./client_secret_174080966404-46oqc0h3kg62hndklbjgsd07fps31mf6.apps.googleusercontent.com.json"
  )
);

const { client_id, client_secret, redirect_uris } = credentials.installed;

// Tạo OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0] // http://localhost
);

async function main() {
  const scopes = ["https://www.googleapis.com/auth/drive.file"];

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // bắt buộc để Google trả refresh_token
  });

  console.log("\n🔗 MỞ URL NÀY TRÊN TRÌNH DUYỆT:\n");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\n👉 PASTE code Google trả về vào đây: ", async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      console.log("\n=================================");
      console.log("🔥 REFRESH TOKEN của bạn là:\n");
      console.log(tokens.refresh_token);
      console.log("\n👉 Copy vào .env (GOOGLE_REFRESH_TOKEN)");
      console.log("=================================\n");
    } catch (err) {
      console.error("\n❌ LỖI LẤY REFRESH TOKEN:", err);
    }
  });
}

main();
