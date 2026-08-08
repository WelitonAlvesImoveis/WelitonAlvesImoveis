import dns from "node:dns/promises";
import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);
console.log("Servidores DNS em uso:", await dns.getServers());

const diagnoseDns = async () => {
  try {
    const addresses = await dns.resolve("google.com");
    console.log("[DNS diag] resolve('google.com') OK:", addresses);
  } catch (error) {
    console.error("[DNS diag] resolve('google.com') FALHOU:", error.code || error.message);
  }

  const mongoUri = process.env.MONGO_URI;
  if (mongoUri?.startsWith("mongodb+srv://")) {
    const srvHost = new URL(mongoUri).hostname;
    try {
      const records = await dns.resolveSrv(`_mongodb._tcp.${srvHost}`);
      console.log(`[DNS diag] resolveSrv('_mongodb._tcp.${srvHost}') OK:`, records);
    } catch (error) {
      console.error(
        `[DNS diag] resolveSrv('_mongodb._tcp.${srvHost}') FALHOU:`,
        error.code || error.message
      );
    }
  }
};

await diagnoseDns();

await connectDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
