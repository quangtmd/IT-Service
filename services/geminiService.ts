

// Fix: Import correct types from @google/genai
// Fix: Removed invalid non-English import.
import { GoogleGenAI, Chat, GenerateContentResponse, GenerateContentParameters, Part, Content, Type } from "@google/genai"; // Added Part, Content, Type
import * as Constants from '../constants.tsx';
import { AIBuildResponse, ChatMessage, GroundingChunk, SiteSettings, Article } from "../types"; // Added SiteSettings, Article

const CHAT_MODEL_NAME = 'gemini-2.5-flash';
const BUILDER_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'imagen-4.0-generate-001';

let aiInstance: GoogleGenAI | null = null;
let chatSessionInstance: Chat | null = null; // Renamed to avoid conflict with 'Chat' type

const getAiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.API_KEY;
  // This robust check handles both missing keys and the 'undefined' string issue from some build tools.
  if (!apiKey || apiKey === 'undefined') {
    if (!aiInstance) { // Log this warning only once to avoid spamming the console
        console.warn("Gemini Service: VITE_API_KEY is not configured. AI features will be disabled.");
    }
    return null;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiInstance;
};


// Fix: Change history type from GenerateContentParameters[] to Content[]
export const startChat = (
  siteSettings: SiteSettings, // Added siteSettings
  history?: Content[], 
  systemInstructionOverride?: string
): Chat => {
  const client = getAiClient();
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  let socialLinksInfo = "";
  if (siteSettings.socialFacebookUrl) socialLinksInfo += `\n- Facebook: ${siteSettings.socialFacebookUrl}`;
  if (siteSettings.socialZaloUrl) socialLinksInfo += `\n- Zalo: ${siteSettings.socialZaloUrl}`;
  if (siteSettings.socialYoutubeUrl) socialLinksInfo += `\n- YouTube: ${siteSettings.socialYoutubeUrl}`;


  const defaultSystemInstruction = `Bạn là một trợ lý AI bán hàng và hỗ trợ khách hàng toàn diện cho cửa hàng ${siteSettings.companyName}.
Khi người dùng hỏi về sản phẩm hoặc dịch vụ, hãy ưu tiên sử dụng thông tin và các đường link được cung cấp trong "[Sản phẩm liên quan từ cửa hàng]" hoặc "[Dịch vụ liên quan từ cửa hàng]" (nếu có) để trả lời trực tiếp và cung cấp link cho người dùng.
Ví dụ, nếu được cung cấp: "[Sản phẩm liên quan từ cửa hàng]: - Tên: Laptop ABC, Giá: 15.000.000₫. Xem chi tiết: [Link sản phẩm](http://localhost:3000/#/product/lap001)", và người dùng hỏi "có laptop ABC không?", bạn nên trả lời "Có bạn nhé, Laptop ABC giá 15.000.000₫, bạn xem chi tiết tại đây: [Link sản phẩm](http://localhost:3000/#/product/lap001)".
Nếu không có thông tin sản phẩm/dịch vụ cụ thể được cung cấp trong ngữ cảnh, hãy trả lời chung và hướng dẫn người dùng cách tìm kiếm trên trang web hoặc liên hệ bộ phận bán hàng.
Thông tin liên hệ chung của cửa hàng:
- Tên công ty: ${siteSettings.companyName}
- Số điện thoại: ${siteSettings.companyPhone}, Email: ${siteSettings.companyEmail}, Địa chỉ: ${siteSettings.companyAddress}.
${socialLinksInfo ? `- Mạng xã hội:${socialLinksInfo}` : ''}
Hãy luôn thân thiện, chuyên nghiệp và trả lời bằng tiếng Việt.
Cố gắng hiểu rõ ý định của người dùng. Nếu câu hỏi không rõ ràng, hãy hỏi thêm để làm rõ trước khi trả lời.
Lưu ý: Bạn không thể tự 'nhớ' các cuộc trò chuyện trước đó trừ khi lịch sử được cung cấp lại trong mỗi lượt.
Khi cung cấp link, hãy đảm bảo link đó đầy đủ và có thể nhấp được (sử dụng định dạng Markdown cho link, ví dụ: [Tên Link](URL)).`;

  chatSessionInstance = client.chats.create({
    model: CHAT_MODEL_NAME,
    history: history || [],
    config: {
      systemInstruction: systemInstructionOverride || defaultSystemInstruction,
    },
  });
  return chatSessionInstance;
};

export const sendMessageToChatStream = async (
  message: string,
  currentChatInstance?: Chat
// Fix: Change GenerateContentStreamResult to AsyncIterable<GenerateContentResponse>
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chatToUse = currentChatInstance || chatSessionInstance;
  if (!chatToUse) {
    throw new Error("Chat not initialized. Call startChat first.");
  }
  
  const client = getAiClient();
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  try {
    return await chatToUse.sendMessageStream({ message });
  } catch (error) {
    console.error("Error sending message to Gemini (stream):", error);
    throw error;
  }
};

export const generatePCBuildRecommendation = async (
  useCase: string,
  budget: string,
  currentComponents?: Record<string, string>
): Promise<AIBuildResponse> => {
  const client = getAiClient(); 
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  let prompt = `Tôi cần xây dựng một cấu hình PC.
Nhu cầu sử dụng: ${useCase}.
Ngân sách: ${budget}.`;

  if (currentComponents && Object.keys(currentComponents).length > 0) {
    prompt += "\nCác linh kiện đã có hoặc ưu tiên:";
    for (const [key, value] of Object.entries(currentComponents)) {
      if (value) prompt += `\n- ${key}: ${value}`;
    }
  }

  prompt += `\nHãy đề xuất một cấu hình PC tương thích bao gồm CPU, Bo mạch chủ (Motherboard), RAM (ghi rõ dung lượng và tốc độ), GPU (Card đồ họa), SSD (ghi rõ dung lượng), PSU (Nguồn - ghi rõ công suất), và Vỏ máy (Case).
Cung cấp phản hồi dưới dạng một đối tượng JSON với các khóa: 'cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'psu', 'case'. Mỗi khóa này nên là một đối tượng chứa hai khóa con: 'name' (tên linh kiện cụ thể) và 'reasoning' (lý do ngắn gọn chọn linh kiện đó).
Ví dụ: { "cpu": { "name": "AMD Ryzen 5 5600X", "reasoning": "Hiệu năng tốt cho gaming tầm trung." }, ... }.
Nếu ngân sách quá thấp cho nhu cầu sử dụng, hãy trả về JSON có dạng { "error": "Ngân sách quá thấp cho nhu cầu này." }.`;
  
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: BUILDER_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    return JSON.parse(jsonStr) as AIBuildResponse;

  } catch (error) {
    console.error("Error generating PC build recommendation:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
         return { error: "AI đã trả về định dạng không hợp lệ. Vui lòng thử lại." };
    }
    return { error: "Đã xảy ra lỗi khi nhận đề xuất từ AI. Vui lòng thử lại." };
  }
};

export const generateTextWithGoogleSearch = async (
  prompt: string
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  const client = getAiClient(); 
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: CHAT_MODEL_NAME, 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    return {
      text: response.text,
      groundingChunks: groundingMetadata?.groundingChunks as GroundingChunk[] || undefined
    };
  } catch (error) {
    console.error("Error generating text with Google Search:", error);
    throw error;
  }
};

export const fetchLatestTechNews = async (): Promise<Partial<Article>[]> => {
    const client = getAiClient();
    if (!client) {
        throw new Error(Constants.API_KEY_ERROR_MESSAGE);
    }
    const prompt = `Làm một biên tập viên tin tức công nghệ. Sử dụng Google Search để tìm 3 tin tức công nghệ mới và thú vị nhất trong vài ngày qua. 
    Đối với mỗi tin tức, hãy cung cấp một tiêu đề hấp dẫn, một bản tóm tắt (summary) khoảng 2-3 câu, một nội dung chi tiết (content) được định dạng bằng Markdown, một danh mục (category) từ danh sách sau: [${Constants.ARTICLE_CATEGORIES.join(', ')}], và một cụm từ khóa tìm kiếm hình ảnh bằng tiếng Anh (imageSearchQuery) ngắn gọn, phù hợp với nội dung.
    Trả về kết quả dưới dạng một mảng JSON.`;

    try {
        const response = await client.models.generateContent({
            model: CHAT_MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let jsonStr = response.text.trim();
        // Clean up markdown fences if they exist
        const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const articles = JSON.parse(jsonStr) as Partial<Article>[];
        return articles;

    } catch (error) {
        console.error("Error fetching latest tech news from Gemini:", error);
        throw new Error("Không thể lấy tin tức mới nhất từ AI. Vui lòng thử lại sau.");
    }
};


export const generateImage = async (prompt: string): Promise<string> => {
  const client = getAiClient(); 
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }
  try {
    const response = await client.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const sendMessageWithImage = async (
  textPrompt: string,
  base64ImageData: string,
  mimeType: string,
  currentChatInstance?: Chat
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chatToUse = currentChatInstance || chatSessionInstance;
  if (!chatToUse) {
     throw new Error("Chat not initialized for image message. Call startChat first.");
  }
  
  const client = getAiClient();
  if (!client) {
    throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  const imagePart: Part = {
    inlineData: {
      mimeType: mimeType,
      data: base64ImageData,
    },
  };
  const textPart: Part = { text: textPrompt };

  try {
    // Fix: Corrected typo from `finalChatToUse` to `chatToUse`.
    return await chatToUse.sendMessageStream({ message: [textPart, imagePart] });
  } catch (error) {
    console.error("Error sending message with image to Gemini (stream):", error);
    throw error;
  }
};

export default {
  startChat,
  sendMessageToChatStream,
  generatePCBuildRecommendation,
  generateTextWithGoogleSearch,
  generateImage,
  sendMessageWithImage,
  fetchLatestTechNews,
};
