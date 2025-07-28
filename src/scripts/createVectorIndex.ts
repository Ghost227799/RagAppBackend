import "dotenv/config";
import mongoose from "mongoose";
import MongoService from "../helpers/MongoDb";

async function createVectorIndex() {
  try {
    // Connect to MongoDB
    await MongoService.connect(process.env.MONGO_CONN_STRING!);
    console.log("Connected to MongoDB");

    // Get the MongoDB database instance
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Failed to get database instance");
    }

    // Check if the collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(
      (collection) => collection.name === "documents"
    );

    if (!collectionExists) {
      console.log("Documents collection does not exist yet. Create some documents first.");
      process.exit(0);
    }

    // Create the vector search index
    const indexName = "embedding_index";
    
    // Check if index already exists
    const indexes = await db.collection("documents").indexes();
    const indexExists = indexes.some((index) => index.name === indexName);
    
    if (indexExists) {
      console.log(`Index '${indexName}' already exists.`);
    } else {
      // Create the vector search index using MongoDB Atlas syntax
      // Note: This requires MongoDB Atlas with vector search capability
      await db.command({
        createIndexes: "documents",
        indexes: [
          {
            name: indexName,
            key: { embedding: "vector" },
            vectorOptions: {
              dimension: 768, // Gemini embedding-001 dimension
              similarity: "cosine"
            }
          }
        ]
      });
      console.log(`Vector search index '${indexName}' created successfully.`);
    }
  } catch (error) {
    console.error("Error creating vector index:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
}

// Run the function
createVectorIndex();
