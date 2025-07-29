import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import DocumentModel from "../models/Document";
import fs from "fs";
import pdfParse from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function storeDocument(
  id: string,
  text: string,
  userId: string
): Promise<void> {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  const embedding = result.embedding.values;

  const document = new DocumentModel({
    id,
    text,
    userId,
    embedding,
  });

  await document.save();
  console.log(`Stored document: ${id}`);
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

export async function getRelevantDocs(
  query: string,
  userId: string
): Promise<string[]> {
  try {
    // Generate embedding for the query using Gemini
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // First approach: Try using $vectorSearch if the index exists
    try {
      const documents = await DocumentModel.aggregate([
        {
          $vectorSearch: {
            index: "embedding_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 5,
          },
        },
        {
          $match: {
            userId: userId,
          },
        },
        {
          $project: {
            text: 1,
            score: { $meta: "vectorSearchScore" },
            _id: 0,
          },
        },
      ]);

      if (documents && documents.length > 0) {
        console.log(`Found ${documents.length} documents using $vectorSearch`);
        return documents.map((doc) => doc.text);
      }
    } catch (error: any) {
      console.warn("Vector search failed, falling back to alternative method:", error.message || "Unknown error");
    }

    // Fallback approach: If $vectorSearch fails or returns no results, use a simpler query
    // This is less efficient but more reliable if vector search isn't properly set up
    const allUserDocs = await DocumentModel.find({ userId }).limit(20).lean();
    
    if (!allUserDocs || allUserDocs.length === 0) {
      console.log("No documents found for user");
      return [];
    }
    
    console.log(`Found ${allUserDocs.length} documents using fallback method`);
    
    // Simple relevance sorting based on text content (not as good as vector search)
    // In a production app, you might want to implement a more sophisticated fallback
    const scoredDocs = allUserDocs.map(doc => ({
      text: doc.text,
      // Simple text matching score (very basic)
      score: (doc.text.toLowerCase().includes(query.toLowerCase())) ? 1 : 0
    }));
    
    // Sort by our basic score and take top 5
    const sortedDocs = scoredDocs.sort((a, b) => b.score - a.score).slice(0, 5);
    
    return sortedDocs.map(doc => doc.text);
  } catch (error) {
    console.error("Error in getRelevantDocs:", error);
    return [];
  }
}

export async function generateResponse(
  query: string,
  userId: string
): Promise<string> {
  const docs = await getRelevantDocs(query, userId);
  const context = docs.join("\n\n");

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  });

  const prompt = `Context: ${context}\n\nQuery: ${query}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
