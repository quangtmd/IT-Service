// Fix: Import correct types from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content, Type, FunctionDeclaration } from "@google/genai"; // Added Part, Content, Type, FunctionDeclaration
import * as Constants from '../constants.tsx';
// Fix: Added SiteSettings, Article, Product
import { AIBuildResponse, ChatMessage, GroundingChunk, SiteSettings, Article, Product, AIBuildSuggestionsResponse } from "../types"; 
import { MOCK_SERVICES } from '../data/mockData';
// FIX: Import PRODUCT_CATEGORIES_HIERARCHY from constants
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

const getOrderStatusFunctionDeclaration: FunctionDeclaration = {
  name: 'getOrderStatus',
  parameters: {
    type: Type.OBJECT,
    description: 'Lấy thông tin và trạng thái của một đơn hàng cụ thể bằng mã đơn hàng. Chức năng này cho phép tra cứu bất kỳ đơn hàng nào, không giới hạn cho người dùng đang đăng nhập.',
    properties: {
      orderId: {
        type: Type.STRING,
        description: 'Mã của đơn hàng cần kiểm tra. Ví dụ: T280649, 280649, order-123456, hoặc bất kỳ chuỗi nào người dùng cung cấp như là mã đơn hàng.',
      },
    },
    required: ['orderId'],
  },
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


  const defaultSystemInstruction = `Bạn là một trợ lý AI bán hàng và hỗ trợ khách hàng toàn diện cho cửa hàng ${siteSettings.companyName}. Vai trò của bạn là tư vấn chung về các dòng sản phẩm, dịch vụ và tra cứu đơn hàng.

**QUYỀN HẠN VÀ GIỚI HẠN:**
1.  **Về Sản Phẩm:** Bạn **KHÔNG** có quyền truy cập vào giá cả, tồn kho của từng sản phẩm cụ thể. Hãy hướng dẫn khách xem trên website.
2.  **Về Đơn Hàng:** Bạn **CÓ QUYỀN** và **PHẢI** sử dụng công cụ để tra cứu trạng thái đơn hàng khi khách yêu cầu.

**HƯỚNG DẪN TRA CỨU ĐƠN HÀNG (QUAN TRỌNG):**
- Nếu người dùng hỏi về trạng thái đơn hàng, vận chuyển, hoặc giao hàng và cung cấp bất kỳ chuỗi ký tự/số nào giống mã đơn hàng (ví dụ: "đơn hàng 123", "check T456", "order-789"), hãy **NGAY LẬP TỨC** gọi công cụ \`getOrderStatus\`.
- Truyền toàn bộ chuỗi mã mà người dùng cung cấp vào tham số \`orderId\`. Đừng cố gắng tự đoán hay thay đổi định dạng mã.
- Nếu người dùng hỏi "đơn hàng của tôi đâu" mà chưa đưa mã, hãy hỏi lại: "Vui lòng cho tôi biết mã đơn hàng bạn muốn kiểm tra."
- **Phản hồi:**
  - Nếu tìm thấy: Tóm tắt trạng thái, tổng tiền và thông tin vận chuyển nếu có.
  - Nếu không tìm thấy (kết quả trả về 'not_found'): Hãy báo lịch sự "Tôi không tìm thấy đơn hàng với mã [MÃ_VỪA_NHẬP]. Bạn vui lòng kiểm tra lại mã xem có chính xác không nhé."

**Danh mục sản phẩm chúng tôi bán:**
${productCategoriesInfo}

**Dịch vụ IT chúng tôi cung cấp:**
${serviceInfo}

**Quy tắc trả lời chung:**
- Luôn thân thiện, chuyên nghiệp và dùng tiếng Việt.
- Nếu khách hàng hỏi về sản phẩm cụ thể, hãy nói: "Để có thông tin chính xác nhất về giá và cấu hình, mời bạn xem trực tiếp trên website nhé."
- Khi cung cấp link, sử dụng định dạng Markdown: [Tên Link](URL).

**Thông tin liên hệ:**
- Tên công ty: ${siteSettings.companyName}
- Hotline: ${siteSettings.companyPhone}
- Email: ${siteSettings.companyEmail}
- Địa chỉ: ${siteSettings.companyAddress}`;

  chatSessionInstance = client.chats.create({
    model: CHAT_MODEL_NAME,
    history: history || [],
    config: {
      systemInstruction: systemInstructionOverride || defaultSystemInstruction,
      tools: [{functionDeclarations: [getOrderStatusFunctionDeclaration]}],
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
    // FIX: Import and use ARTICLE_CATEGORIES from constants
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
        
        return JSON.parse(jsonStr) as Partial<Article>[];

    } catch (error) {
        console.error("Error fetching latest tech news:", error);
        throw new Error("Không thể lấy tin tức mới nhất từ AI. Vui lòng kiểm tra lại API Key và thử lại.");
    }
};

export const sendMessageWithImage = async (
  message: string,
  base64Data: string,
  mimeType: string,
  currentChatInstance?: Chat
): Promise<AsyncIterable<GenerateContentResponse>> => {
    const chatToUse = currentChatInstance || chatSessionInstance;
    if (!chatToUse) {
        throw new Error("Chat not initialized. Call startChat first.");
    }

    const imagePart: Part = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType
        }
    };

    const textPart: Part = {
        text: message
    };
    
    try {
        const result = await chatToUse.sendMessageStream({
            // FIX: Ensure 'message' property holds an object with a 'parts' array when sending multi-modal content.
            // This corrects the type error where a string was being assigned to a property expecting a complex object.
            message: { parts: [textPart, imagePart] }
        });
        return result;
    } catch (error) {
        console.error("Error sending message with image to Gemini:", error);
        throw error;
    }
};

const geminiService = {
    startChat,
    sendMessageToChatStream,
    sendMessageWithImage,
    generatePCBuildRecommendation,
    generateTextWithGoogleSearch,
    fetchLatestTechNews,
    generatePCBuildSuggestions,
};

export default geminiService;