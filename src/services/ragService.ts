import { OpenAI } from "openai";
import ChromaService from "../helpers/ChromaDb";
import fs from "fs";
import pdfParse from "pdf-parse";
// New storeDocument function supporting all file types and Tika
export async function storeDocument(
  id: string,
  text: string,
  userId: string
): Promise<void> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  if (!ChromaService.isReady() || !ChromaService.collection) {
    throw new Error("ChromaDB is not ready");
  }

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  const embedding = embeddingResponse.data[0].embedding;

  await ChromaService.collection.add({
    ids: [id],
    embeddings: [embedding],
    metadatas: [{ text, userId }],
  });

  console.log(`Stored document: ${id}`);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * ChromaDB connection is now managed by the singleton in src/helpers/ChromaDb.ts.
 * Use ChromaService.collection, ChromaService.initChroma(), and ChromaService.isReady() as needed.
 */
export async function initChroma() {
  await ChromaService.initChroma();
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}


export async function getRelevantDocs(query: string, userId: string): Promise<string[]> {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;
  const userIdFilter = {
    userId: userId
  };
  if (!ChromaService.isReady() || !ChromaService.collection) {
    throw new Error("ChromaDB is not ready");
  }
  const results = await ChromaService.collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3,
    where: userIdFilter
  });

  return results.metadatas.flat().map((doc: any) => String(doc?.text ?? ""));
}

export async function generateResponse(query: string, userId: string): Promise<string> {
  const docs = await getRelevantDocs(query, userId);
  const context = docs.join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an intelligent assistant." },
      { role: "user", content: `Context: ${context}` },
      { role: "user", content: `Query: ${query}` },
    ],
  });

  return response.choices[0].message.content ?? "No response generated";
}
