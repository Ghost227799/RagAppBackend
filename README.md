# 🔙 Backend – RAG Web App (Node.js + TypeScript + MongoDB)

This is the backend for a RAG (Retrieval-Augmented Generation) web application. It handles:

- User authentication via Google OAuth
- Document ingestion and embedding
- Vector storage using MongoDB Atlas Vector Search
- Embeddings and question-answering using Google's Gemini models
- APIs for frontend communication

---

## 🚀 Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB Atlas with Vector Search
- Google Gemini AI
- Docker + Cloud Run

---

## 📋 Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   MONGO_CONN_STRING=your_mongodb_atlas_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. Create the vector search index in MongoDB Atlas:
   ```
   npm run create-vector-index
   ```
   Note: This requires MongoDB Atlas with Vector Search capability.

4. Start the development server:
   ```
   npm run dev
   ```

---

## 📁 Folder Structure
