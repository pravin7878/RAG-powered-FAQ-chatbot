// setup.js
// Script to process documents, chunk them, get OpenAI embeddings, and store in a local JSON file

const fs = require('fs');
const path = require('path');
// const pdfParse = require('pdf-parse'); 
// const { encode } = require('gpt-3-encoder'); // For token counting/chunking
const axios = require('axios');
require('dotenv').config();

const DOCUMENTS_DIR = path.join(__dirname, '../data/sample-documents');
const OUTPUT_FILE = path.join(__dirname, '../data/embeddings.json');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 1. Read all files from DOCUMENTS_DIR
// 2. For each file, detect type (pdf, txt, md)
// 3. Extract text content
// 4. Chunk text into 500-1000 token chunks
// 5. For each chunk, get embedding from OpenAI
// 6. Store {chunk, embedding, source, chunk_index} in OUTPUT_FILE

(async () => {
  // 1. Read all files from DOCUMENTS_DIR
  const files = fs.readdirSync(DOCUMENTS_DIR);
  const supportedExtensions = ['.txt', '.md'];
  const documents = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (supportedExtensions.includes(ext)) {
      const filePath = path.join(DOCUMENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      documents.push({
        filename: file,
        content,
      });
      console.log(`Loaded ${file} (${content.length} chars)`);
    } else {
      console.log(`Skipping unsupported file: ${file}`);
    }
  }

  // Chunking function: split text into ~500 word chunks
  function chunkText(text, chunkSize = 500) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }
    return chunks;
  }

  // For each document, create chunks
  const allChunks = [];
  documents.forEach(doc => {
    const chunks = chunkText(doc.content, 500);
    chunks.forEach((chunk, idx) => {
      allChunks.push({
        filename: doc.filename,
        chunk_index: idx,
        chunk_text: chunk,
      });
    });
    console.log(`Chunked ${doc.filename}: ${chunks.length} chunks`);
  });

  // OpenAI Embedding API call
  async function getEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: 'text-embedding-ada-002',
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error.response?.data || error.message);
      return null;
    }
  }

  // For each chunk, get embedding and store results
  const results = [];
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    console.log(`Embedding chunk ${i + 1} / ${allChunks.length} (${chunk.filename} [${chunk.chunk_index}])`);
    const embedding = await getEmbedding(chunk.chunk_text);
    results.push({
      filename: chunk.filename,
      chunk_index: chunk.chunk_index,
      chunk_text: chunk.chunk_text,
      embedding,
    });
    // Delay to avoid rate limits
    await new Promise(res => setTimeout(res, 200));
  }

  // Save results to OUTPUT_FILE
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Embeddings saved to ${OUTPUT_FILE}`);
})(); 