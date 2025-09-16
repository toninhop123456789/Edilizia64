const TOKEN_FALLBACK = "7643757060:AAEbgqaLueeGxwlY9MrNJiITa-vhhhKHuZM";
const CHAT_FALLBACK  = "-1002784891442";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: {
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type"
    }};
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: {
      "Access-Control-Allow-Origin":"*","Allow":"POST, OPTIONS"
    }, body: "Method Not Allowed" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const envelope = body.envelope;
    const filename = body.filename || "ore.ed64.txt";
    if (!envelope) {
      return { statusCode: 400, headers:{"Access-Control-Allow-Origin":"*"}, body:"envelope mancante" };
    }
    const token  = process.env.TELEGRAM_BOT_TOKEN || TOKEN_FALLBACK;
    const chatId = process.env.TELEGRAM_CHAT_ID   || CHAT_FALLBACK;

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("document", new Blob([envelope], { type:"text/plain" }), filename);

    const resp = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method:"POST", body: form
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 502, headers:{"Access-Control-Allow-Origin":"*"}, body:"Telegram error: " + txt };
    }
    return { statusCode: 200, headers:{"Access-Control-Allow-Origin":"*"}, body:"OK" };
  } catch (e) {
    return { statusCode: 500, headers:{"Access-Control-Allow-Origin":"*"}, body: e.message || "Errore sconosciuto" };
  }
};
