
// Fix: Import correct types from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content, Type, FunctionDeclaration } from "@google/genai"; // Added Part, Content, Type, FunctionDeclaration
import * as Constants from '../constants.tsx';
// Fix: Added SiteSettings, Article, Product
import { AIBuildResponse, ChatMessage, GroundingChunk, SiteSettings, Article, Product, AIBuildSuggestionsResponse, User } from "../types"; 
import { MOCK_SERVICES } from '../data/mockData';
import { PRODUCT_CATEGORIES_HIERARCHY } from '../constants.tsx';


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

// --- TOOL DEFINITIONS ---

// Tool 1: Tra cứu cụ thể bằng Mã đơn hàng
const getOrderStatusFunctionDeclaration: FunctionDeclaration = {
  name: 'getOrderStatus',
  parameters: {
    type: Type.OBJECT,
    description: 'Lấy thông tin chi tiết và trạng thái của một đơn hàng cụ thể bằng mã đơn hàng (Order ID).',
    properties: {
      orderId: {
        type: Type.STRING,
        description: 'Mã của đơn hàng cần kiểm tra. Ví dụ: T280649, 280649, order-171...',
      },
    },
    required: ['orderId'],
  },
};

// Tool 2: Tra cứu danh sách bằng SĐT hoặc Email
const lookupCustomerOrdersFunctionDeclaration: FunctionDeclaration = {
  name: 'lookupCustomerOrders',
  parameters: {
    type: Type.OBJECT,
    description: 'Tìm kiếm danh sách đơn hàng dựa trên Số điện thoại hoặc Email của khách hàng.',
    properties: {
      identifier: {
        type: Type.STRING,
        description: 'Số điện thoại (VD: 0905...) hoặc Email của khách hàng.',
      },
    },
    required: ['identifier'],
  },
};


// Fix: Change history type from GenerateContentParameters[] to Content[]
export const startChat = (
  siteSettings: SiteSettings, // Added siteSettings
  currentUser?: User | null, // Added currentUser for context
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

  let userContext = "";
  if (currentUser) {
    userContext = `
**THÔNG TIN KHÁCH HÀNG ĐANG CHAT:**
- Tên: ${currentUser.username}
- Email: ${currentUser.email}
- SĐT: ${currentUser.phone || 'Chưa cập nhật'}
(Lưu ý: Nếu khách hỏi "đơn hàng của tôi" mà không đưa thông tin, hãy ưu tiên dùng SĐT hoặc Email này để tra cứu bằng tool 'lookupCustomerOrders' trước khi hỏi lại khách).
    `;
  }

  const defaultSystemInstruction = `Bạn là một trợ lý AI bán hàng và hỗ trợ khách hàng toàn diện cho cửa hàng ${siteSettings.companyName}.

**QUY TRÌNH TRA CỨU ĐƠN HÀNG (Quan trọng):**
1.  **Nếu khách cung cấp Mã Đơn Hàng:** (Ví dụ: "đơn T123456 đi tới đâu rồi", "check bill 9999"), hãy sử dụng tool \`getOrderStatus(orderId)\`.
2.  **Nếu khách cung cấp Số Điện Thoại hoặc Email:** (Ví dụ: "kiểm tra đơn sđt 0905123456", "check đơn của a@gmail.com"), hãy sử dụng tool \`lookupCustomerOrders(identifier)\`.
3.  **Nếu khách chỉ hỏi "đơn hàng của tôi đâu?":**
    *   Nếu bạn đã có thông tin SĐT/Email của khách (từ context), hãy tự động gọi \`lookupCustomerOrders\`.
    *   Nếu chưa có, hãy hỏi khách hàng: "Dạ, anh/chị vui lòng cho em xin Mã đơn hàng hoặc Số điện thoại đặt hàng để em kiểm tra ạ."

**Sau khi có kết quả từ Tool:**
- Nếu tìm thấy: Hãy tóm tắt ngắn gọn trạng thái đơn, tổng tiền và các món hàng chính. Nếu có link theo dõi vận chuyển, hãy cung cấp.
- Nếu không tìm thấy: Hãy báo lỗi lịch sự và gợi ý khách kiểm tra lại thông tin.

${userContext}

**Kiến thức về Sản phẩm:**
${productCategoriesInfo}

**Kiến thức về Dịch vụ:**
${serviceInfo}

**Thông tin liên hệ:**
- Hotline: ${siteSettings.companyPhone}
- Địa chỉ: ${siteSettings.companyAddress}
${socialLinksInfo}

Hãy luôn thân thiện, xưng hô là "em" hoặc "mình" và gọi khách là "anh/chị" hoặc "bạn". Trả lời ngắn gọn, đi vào trọng tâm.`;

  chatSessionInstance = client.chats.create({
    model: CHAT_MODEL_NAME,
    history: history || [],
    config: {
      systemInstruction: systemInstructionOverride || defaultSystemInstruction,
      tools: [{functionDeclarations: [getOrderStatusFunctionDeclaration, lookupCustomerOrdersFunctionDeclaration]}],
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
  generatePCBuildSuggestions,
  generateTextWithGoogleSearch,
  generateImage,
  sendMessageWithImage,
  fetchLatestTechNews,
};
