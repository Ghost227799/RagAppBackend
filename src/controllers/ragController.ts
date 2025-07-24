import { Request, Response } from "express";
import fs from "fs";
import {
  extractTextFromPDF,
  storeDocument,
  generateResponse,
} from "../services/ragService";

export async function uploadPdfController(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const pdfText = await extractTextFromPDF(req.file.path);
    await storeDocument(req.file.filename, pdfText, (req as any)?.user);

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    return res.json({ message: "PDF uploaded and processed successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}

export async function ragQueryController(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const response = await generateResponse(query, (req as any)?.user);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
}
