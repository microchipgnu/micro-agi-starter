/** @jsxImportSource ai-jsx */
import * as AI from "ai-jsx";
import ModelSelector from "micro-agi/core/models/model-selector";

import {
  ChatCompletion,
  SystemMessage,
  UserMessage,
} from "ai-jsx/core/completion";

import { TextLoader } from "langchain/document_loaders/fs/text";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 4000,
  chunkOverlap: 30,
});

const embeddings = new OllamaEmbeddings({
  model: "openhermes",
  baseUrl: "http://localhost:11434",
});

console.log("Indexing docs...");
const loader = new TextLoader("docs.md");
const rawDocuments = await loader.load();
const docs = await textSplitter.splitDocuments(rawDocuments);
const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
console.log("✨ Ready! ✨\n");

const Question = async ({ question }: { question: string }) => {
  const result = await vectorStore.similaritySearch(question, 5);

  return (
    <ModelSelector provider="ollama" model="openhermes">
      <ChatCompletion>
        <SystemMessage>
          You are a knowledge base agent who answers questions based on these
          docs: {JSON.stringify(result)}
        </SystemMessage>
        <UserMessage>{question}</UserMessage>
      </ChatCompletion>
    </ModelSelector>
  );
};

const askQuestion = () => {
  rl.question("User: ", async (question) => {
    if (question.toLowerCase() === "exit") {
      rl.close();
      console.log("Exiting...");
    } else {
      const renderContext = AI.createRenderContext();
      console.log("Loading...\n");
      const result = await renderContext.render(
        <Question question={question} />
      );
      console.log(`Assistant: ${result}\n`);
      askQuestion();
    }
  });
};

askQuestion();
