# RAG-powered FAQ Chatbot

A Retrieval-Augmented Generation (RAG) FAQ chatbot using Node.js, OpenAI, and a local file-based vector store. Built for the Altibbi Generative AI Developer Intern screening task.

## Features
- Accepts user questions via web form or API (n8n workflow)
- Retrieves relevant context from PDF, text, and markdown documents
- Uses OpenAI for embeddings and answer generation
- All scripts in JavaScript (Node.js only, no Python required)
- Local file-based vector search for simplicity

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Add your documents** to `data/sample-documents/` (PDF, .txt, .md supported)
4. **Set your OpenAI API key**
   - Create a `.env` file in the root directory:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```
5. **Run the setup script** to process documents and generate embeddings:
   ```bash
   node scripts/setup.js
   ```
6. **Import the n8n workflow** from `workflows/rag-chatbot-workflow.json`

## Requirements
- Node.js (v16+ recommended)
- OpenAI API key
- n8n (for workflow orchestration)

---

For more details, see `docs/technical-approach.md`. 