import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function main() {
  const response = await client.chat.completions.create({

    // ✅ OPCIÓN 1 — Automático (OpenRouter elige el mejor gratis disponible)
    // model: "openrouter/free",

    // ✅ OPCIÓN 2 — Llama 3.3 70B (Meta, muy capaz, gratis)
    // model: "meta-llama/llama-3.3-70b-instruct:free",

    // ✅ OPCIÓN 3 — Mistral Small (rápido, gratis)
    // model: "mistralai/mistral-small-3.1-24b-instruct:free",
    
    // ✅ OPCIÓN 4 — Mistral Small (rápido, gratis)
    // model: "google/gemma-3-12b-it:free",
    
    // ✅ OPCIÓN 5 — Mistral Small (rápido, gratis)
    model: "google/gemma-3-27b-it:free",

    max_tokens: 500,
    messages: [
      { role: "user", content: "Hola, quiero verificar si el modelo funciona." }
    ],
  });

  console.log("Modelo usado:", response.model); // muestra qué modelo respondió
  console.log("Respuesta:", response.choices[0].message.content);
}

main();