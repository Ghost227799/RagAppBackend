import { ChromaClient, Collection } from "chromadb";

class ChromaService {
    
    collection: Collection | null;
    chroma: ChromaClient;
    isConnected: boolean;

    constructor() {
        this.chroma = new ChromaClient({
            path: process.env.CHROMA_URL || 'http://localhost:8000',
        });
        this.collection = null;
        this.isConnected = false;
        this.initChroma();
    }

    async initChroma() {
        try {
            this.collection = await this.chroma.getOrCreateCollection({ name: "knowledge-base" });
            this.isConnected = true;
        } catch (error: any) {
            console.error("Failed to connect to ChromaDB:", error.message || String(error));
            this.isConnected = false;
            // Don't rethrow the error to prevent server crash
        }
    }

    // Helper method to check connection status
    isReady() {
        return this.isConnected && this.collection !== null;
    }
}

export default new ChromaService();