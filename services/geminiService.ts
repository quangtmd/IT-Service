
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Chat, GenerateContentResponse } from "@google/generative-ai";
import { SiteSettings } from "../types"; // Assuming types are in a parent directory

const MODEL_NAME = "gemini-1.5-pro-latest";
const GENERATION_CONFIG = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// A singleton class to manage the Gemini AI instance
class GeminiService {
  private static instance: GoogleGenerativeAI | null = null;

  private constructor() {}

  public static async getInstance(): Promise<GoogleGenerativeAI> {
    if (this.instance) return this.instance;
    
    try {
      const response = await fetch('/api/gemini-key');
      if (!response.ok) {
        throw new Error('Network response was not ok when fetching Gemini API key.');
      }
      const { apiKey } = await response.json();

      if (!apiKey) {
        throw new Error('API key is missing from server response.');
      }
      
      this.instance = new GoogleGenerativeAI(apiKey);
      return this.instance;
    } catch (error) {
      console.error("Fatal Error: Could not initialize Gemini AI. Chat and AI features will be disabled.", error);
      throw new Error("Could not initialize Gemini AI service.");
    }
  }

  public static async startChat(settings: SiteSettings): Promise<Chat> {
    const genAI = await this.getInstance();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: GENERATION_CONFIG, safetySettings: SAFETY_SETTINGS });

    const history = [
        {
            role: "user",
            parts: [{ text: `System instruction: You are a helpful and friendly AI assistant for a company named ${settings.companyName}. Your goal is to assist users with their inquiries about the company's products and services. You should be professional, courteous, and provide accurate information based on the context provided. Do not invent information. If you don't know the answer, politely say that you don't have that information. The company website is ${settings.websiteUrl}, phone number is ${settings.phoneNumber}, and email is ${settings.email}.`}],
        },
        {
            role: "model",
            parts: [{ text: `Thank you for the instructions. I am ready to assist users as the AI assistant for ${settings.companyName}. I will provide helpful and accurate information based on the provided context, maintain a professional and courteous tone, and will not invent information. I will direct users to the company's official channels if I cannot answer their questions. I am ready to begin.` }]
        }
    ];

    return model.startChat({ history });
  }

  public static async sendMessageToChatStream(message: string, chatSession: Chat): Promise<AsyncIterable<GenerateContentResponse>> {
      const result = await chatSession.sendMessageStream(message);
      return result.stream;
  }

  public static async fetchLatestTechNews(): Promise<any[]> {
    const genAI = await this.getInstance();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const parts = [
        {
            text: `Please generate a list of 5 recent and interesting technology news articles. For each article, provide the following information in a valid, minified JSON array format. Do NOT include any markdown or commentary outside of the JSON structure. The structure for each object in the array should be: { "title": "...", "summary": "...", "content": "...", "category": "...", "imageSearchQuery": "..." }. The content should be a full article of at least 4-5 paragraphs. The category should be specific (e.g., 'Artificial Intelligence', 'Smartphones', 'Cybersecurity'). The imageSearchQuery should be a concise, effective search term for finding a relevant image for the article.`
        },
    ];

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/\`\`\`json|\`\`\`/g, '').trim();

    try {
        return JSON.parse(cleanedJson);
    } catch(e) {
        console.error("Failed to parse JSON from Gemini response:", cleanedJson);
        throw new Error("Could not parse news articles from AI response.");
    }
  }
}

// Export methods that other parts of the application will use.
export const getGeminiInstance = GeminiService.getInstance;
export const startChat = GeminiService.startChat;
export const sendMessageToChatStream = GeminiService.sendMessageToChatStream;
export const fetchLatestTechNews = GeminiService.fetchLatestTechNews;
