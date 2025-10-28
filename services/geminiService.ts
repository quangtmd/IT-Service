
import { GoogleGenerativeAI } from "@google/generative-ai";

// A singleton class to manage the Gemini AI instance
class GeminiService {
  private static instance: GoogleGenerativeAI | null = null;

  private constructor() {}

  public static async getInstance(): Promise<GoogleGenerativeAI> {
    if (!this.instance) {
      try {
        // Fetch the API key from the backend endpoint
        const response = await fetch('/api/gemini-key');
        if (!response.ok) {
          throw new Error('Failed to fetch Gemini API key');
        }
        const { apiKey } = await response.json();

        if (!apiKey) {
            throw new Error('Gemini API key is missing from server response.');
        }

        this.instance = new GoogleGenerativeAI(apiKey);

      } catch (error) {
        console.error("Error initializing Gemini AI:", error);
        // Return a dummy object or handle the error as appropriate
        // so the app doesn't crash.
        return {
            getGenerativeModel: () => {
                console.error("Gemini AI not initialized.");
                // Return a mock model that does nothing or informs the user
                return {
                    startChat: () => ({
                        sendMessage: () => Promise.reject(new Error('Chat not available')),
                        sendMessageStream: () => Promise.reject(new Error('Chat not available')),
                        getHistory: () => [],
                    })
                } as any; // Cast to any to satisfy the typechecker for this mock
            }
        } as any;
      }
    }
    return this.instance;
  }
}

/**
 * Initializes and returns a singleton instance of the GoogleGenerativeAI client.
 * Fetches the API key from a secure backend endpoint.
 * 
 * @returns {Promise<GoogleGenerativeAI>} A promise that resolves to the GoogleGenerativeAI instance.
 */
export const getGeminiInstance = async (): Promise<GoogleGenerativeAI> => {
  return GeminiService.getInstance();
};
