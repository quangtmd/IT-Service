
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Chat, GenerateContentResponse } from "@google/generative-ai";
import { SiteSettings, AIBuildResponse } from "../types";

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

class GeminiService {
  private static instance: GoogleGenerativeAI | null = null;

  private static async getInstance(): Promise<GoogleGenerativeAI> {
    if (this.instance) return this.instance;
    try {
      const response = await fetch('/api/gemini-key');
      if (!response.ok) throw new Error('Failed to fetch API key.');
      const { apiKey } = await response.json();
      if (!apiKey) throw new Error('API key is missing.');
      this.instance = new GoogleGenerativeAI(apiKey);
      return this.instance;
    } catch (error) {
      console.error("Fatal: Could not initialize Gemini AI.", error);
      throw new Error("Initialization failed.");
    }
  }

  public static async startChat(settings: SiteSettings): Promise<Chat> {
    const genAI = await this.getInstance();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: GENERATION_CONFIG, safetySettings: SAFETY_SETTINGS });
    const history = [
        {
            role: "user",
            parts: [{ text: `System instruction: You are an AI assistant for ${settings.companyName}. Your goal is to help users. The company website is ${settings.websiteUrl}, phone is ${settings.phoneNumber}, and email is ${settings.email}.`}],
        },
        {
            role: "model",
            parts: [{ text: `I am ready to assist users as the AI assistant for ${settings.companyName}.` }]
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
    const prompt = `Generate 5 recent tech news articles in a minified JSON array. Each object: { "title": "...", "summary": "...", "content": "...", "category": "...", "imageSearchQuery": "..." }. Content must be 4-5 paragraphs.`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/\`\`\`json|\`\`\`/g, '').trim();
    try {
        return JSON.parse(cleanedJson);
    } catch(e) {
        console.error("Failed to parse news JSON:", cleanedJson);
        throw new Error("Could not parse news from AI.");
    }
  }

  public static async generatePCBuildRecommendation(useCase: string, budget: string, currentComponents: Record<string, string>): Promise<AIBuildResponse> {
    const genAI = await this.getInstance();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const currentComponentsString = Object.entries(currentComponents).map(([key, value]) => `${key}: ${value}`).join(', ');

    const prompt = `Based on the following user requirements, suggest a PC build. User need: "${useCase}", Budget: "${budget} VND". Currently selected components: ${currentComponentsString || 'None'}. Provide your response as a single, minified JSON object with the following keys: cpu, motherboard, ram, gpu, ssd, psu, case. For each key, the value should be an object with "name" and "reasoning". If you cannot provide a recommendation, return a JSON object with an "error" key. Example: {"cpu":{"name":"Intel Core i5-12400F","reasoning":"Good budget CPU for gaming."}}`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/\`\`\`json|\`\`\`/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Error generating PC build:", error);
        return { error: "Failed to get recommendation from AI." };
    }
  }
}

export const { startChat, sendMessageToChatStream, fetchLatestTechNews, generatePCBuildRecommendation } = GeminiService;
