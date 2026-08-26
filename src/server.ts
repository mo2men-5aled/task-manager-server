import "dotenv/config";
import { createApp } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  await connectDB(MONGODB_URI);

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
