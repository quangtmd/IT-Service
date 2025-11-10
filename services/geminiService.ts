// Fix: Import correct types from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content, Type } from "@google/genai"; // Added Part, Content, Type
import * as Constants from '../constants';
// Fix: Added SiteSettings, Article, Product and correct import path
import { AIBuildResponse, ChatMessage, GroundingChunk, SiteSettings, Article, Product, AIBuildSuggestionsResponse } from "../types"; 
import { MOCK_SERVICES } from '../data/mockData';
import { PRODUCT_CATEGORIES_HIERARCHY } from '../constants';


const CHAT_MODEL_NAME = 'gemini-2.5-flash';
const BUILDER_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'imagen-4.0-generate-001';

let aiInstance: GoogleGenAI | null = null;
let chatSessionInstance: Chat | null = null; // Renamed to avoid conflict with 'Chat' type

const getAiClient = (): GoogleGenAI | null => {
  // Fix: Use process.env.API_KEY as per guidelines to resolve TypeScript error.
  const apiKey = process.env.API_KEY;
  // This robust check handles both missing keys and the 'undefined' string issue from some build tools.
  if (!apiKey || apiKey === 'undefined') {
    if (!aiInstance) { // Log this warning only once to avoid spamming the console
        // Fix: Update warning message to reflect the correct environment variable.
        console.warn("Gemini Service: API_KEY is not configured. AI features will be disabled.");
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

  const serviceInfo = MOCK_SERVICES.map(service => 
    `- Dịch vụ: ${service.name}\n  Mô tả: ${service.description}\n  Link chi tiết: ${window.location.origin}${window.location.pathname}#/service/${service.slug || service.id}`
  ).join('\n\n');

  const productCategoriesInfo = PRODUCT_CATEGORIES_HIERARCHY
    .map(cat => `- ${cat.name}`)
    .join('\n');


  const defaultSystemInstruction = `Bạn là một trợ lý AI bán hàng và hỗ trợ khách hàng toàn diện cho cửa hàng ${siteSettings.companyName}. Cửa hàng của chúng ta kinh doanh hai mảng chính: bán sản phẩm công nghệ và cung cấp dịch vụ IT.

**Kiến thức về Sản phẩm của Cửa hàng:**
Chúng tôi bán đa dạng các sản phẩm. Khi được hỏi, hãy xác nhận rằng chúng ta có bán các mặt hàng này và khuyến khích khách hàng khám phá thêm. Các danh mục chính bao gồm:
${productCategoriesInfo}

**Kiến thức về Dịch vụ của Cửa hàng:**
Dưới đây là danh sách các dịch vụ IT mà cửa hàng cung cấp. Hãy sử dụng thông tin này để tư vấn chi tiết cho khách hàng.
${serviceInfo}

**Quy tắc trả lời:**
1.  **Sử dụng Bối cảnh (Context):** Nếu tin nhắn của người dùng bắt đầu bằng '[Bối cảnh: ...]', hãy sử dụng thông tin đó để ưu tiên trả lời. Ví dụ, nếu bối cảnh là 'đang xem dịch vụ bảo trì', và người dùng hỏi 'giá bao nhiêu?', hãy trả lời về giá của dịch vụ bảo trì đó.
2.  **Khi người dùng hỏi về sản phẩm (ví dụ: "có bán laptop không?"):** Hãy xác nhận rằng cửa hàng có bán danh mục sản phẩm đó (dựa vào "Kiến thức về Sản phẩm") và khuyến khích họ truy cập trang sản phẩm chung ([${siteSettings.companyName} Shop](${window.location.origin}${window.location.pathname}#/shop)) hoặc hỏi chi tiết hơn để bạn có thể tư vấn.
3.  **Khi người dùng hỏi về dịch vụ IT:** Hãy dựa vào phần "Kiến thức về Dịch vụ" để trả lời. Cung cấp mô tả chi tiết và luôn kèm theo link chi tiết của dịch vụ đó.
4.  **Tránh mặc định từ chối:** TUYỆT ĐỐT KHÔNG trả lời rằng bạn "không thể" cung cấp thông tin sản phẩm. Vai trò của bạn là một nhân viên bán hàng, hãy thể hiện rằng cửa hàng có đa dạng sản phẩm.
5.  **Thông tin liên hệ:** Chỉ cung cấp thông tin liên hệ chung khi người dùng trực tiếp yêu cầu hoặc khi bạn không thể trả lời câu hỏi sau khi đã sử dụng hết kiến thức được cung cấp.

**Thông tin liên hệ chung (chỉ dùng khi thật sự cần thiết):**
- Tên công ty: ${siteSettings.companyName}
- Số điện thoại: ${siteSettings.companyPhone}, Email: ${siteSettings.companyEmail}, Địa chỉ: ${siteSettings.companyAddress}.
${socialLinksInfo ? `- Mạng xã hội:${socialLinksInfo}` : ''}

Hãy luôn thân thiện, chuyên nghiệp và trả lời bằng tiếng Việt.
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
    const messageContent = { message };
    return await chatToUse.sendMessageStream(messageContent);
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

export const generatePCBuildSuggestions = async (
  useCase: 'PC Gaming' | 'PC Văn phòng',
  budget: string,
  additionalRequirements: string
): Promise<AIBuildSuggestionsResponse> => {
  const client = getAiClient();
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  const prompt = `Bạn là một chuyên gia xây dựng PC tại cửa hàng Việt Nam có tên "IQ Technology". Dựa trên nhu cầu của người dùng, hãy đề xuất 2-3 cấu hình PC riêng biệt (ví dụ: một cấu hình tối ưu giá, một cấu hình hiệu năng cao, hoặc một dùng Intel và một dùng AMD).

Nhu cầu của người dùng:
- Mục đích: ${useCase}
- Ngân sách: ${budget} VNĐ
- Yêu cầu thêm: ${additionalRequirements || 'Không có'}

Đối với mỗi cấu hình, hãy cung cấp một tên gọi (ví dụ: "Cấu hình Gaming Tầm trung"), một tổng giá tiền ước tính (dạng số), một lý do ngắn gọn tại sao cấu hình này phù hợp, và danh sách các linh kiện cụ thể bao gồm: CPU, GPU, RAM, Motherboard, SSD, PSU, và Case.
Phản hồi của bạn PHẢI tuân thủ nghiêm ngặt theo JSON schema đã được cung cấp.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        description: "Một danh sách các cấu hình PC được đề xuất.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Tên của cấu hình, ví dụ: Cấu hình Gaming Tầm Trung." },
            total_price: { type: Type.NUMBER, description: "Tổng chi phí ước tính bằng VNĐ." },
            reasoning: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao cấu hình này phù hợp." },
            components: {
              type: Type.OBJECT,
              properties: {
                CPU: { type: Type.STRING },
                GPU: { type: Type.STRING },
                RAM: { type: Type.STRING },
                Motherboard: { type: Type.STRING },
                SSD: { type: Type.STRING },
                PSU: { type: Type.STRING },
                Case: { type: Type.STRING },
              },
              required: ["CPU", "GPU", "RAM", "Motherboard", "SSD", "PSU", "Case"]
            },
          },
          required: ["name", "total_price", "reasoning", "components"]
        },
      },
    },
    required: ["suggestions"],
  };

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: BUILDER_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AIBuildSuggestionsResponse;

  } catch (error) {
    console.error("Lỗi khi tạo gợi ý cấu hình PC:", error);
    throw new Error("Không thể nhận gợi ý từ AI. Vui lòng thử lại sau.");
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
                responseMimeType: 'application/json'
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
    // Fix: Changed 'parts' to 'message' to match the SendMessageParameters type for chat sessions.
    const messageContent = { message: [textPart, imagePart] };
    return await chatToUse.sendMessageStream(messageContent);
  } catch (error) {
    console.error("Error sending message with image to Gemini (stream):", error);
    throw error;
  }
};

export default {
  startChat,
  sendMessageToChatStream,
  generatePCBuildRecommendation,
  generatePCBuildSuggestions,
  generateTextWithGoogleSearch,
  generateImage,
  sendMessageWithImage,
  fetchLatestTechNews,
};
