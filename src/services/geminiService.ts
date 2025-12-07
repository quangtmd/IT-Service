import { GoogleGenAI, Type } from "@google/genai"; 
import * as Constants from '../constants';
import { AIBuildResponse, SiteSettings, Article, AIBuildSuggestionsResponse, User, GroundingChunk } from "../types"; 
import { PRODUCT_CATEGORIES_HIERARCHY } from '../constants';

const CHAT_MODEL_NAME = 'gemini-2.5-flash';
const BUILDER_MODEL_NAME = 'gemini-2.5-flash';

let aiInstance: any | null = null;
let chatSessionInstance: any | null = null; 

const getAiClient = (): any | null => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiInstance;
};

const getOrderStatusFunctionDeclaration: any = {
  name: 'getOrderStatus',
  parameters: {
    type: Type.OBJECT,
    description: 'Tìm kiếm trạng thái đơn hàng theo mã cụ thể (VD: T123456).',
    properties: {
      orderId: { type: Type.STRING, description: 'Mã đơn hàng.' },
    },
    required: ['orderId'],
  },
};

const lookupCustomerOrdersFunctionDeclaration: any = {
  name: 'lookupCustomerOrders',
  parameters: {
    type: Type.OBJECT,
    description: 'Tra cứu danh sách đơn hàng của khách hàng dựa trên số điện thoại hoặc email được cung cấp hoặc từ ngữ cảnh.',
    properties: {
      identifier: { type: Type.STRING, description: 'Số điện thoại hoặc Email của khách hàng.' },
    },
    required: ['identifier'],
  },
};

export const startChat = (
  siteSettings: SiteSettings, 
  currentUser?: User | null, 
  history?: any[], 
  systemInstructionOverride?: string
): any => {
  const client = getAiClient();
  if (!client) throw new Error(Constants.API_KEY_ERROR_MESSAGE);

  const productCategoriesInfo = PRODUCT_CATEGORIES_HIERARCHY.map(cat => `- ${cat.name}`).join('\n');
  
  let userContext = "";
  if (currentUser) {
    userContext = `
**THÔNG TIN KHÁCH HÀNG ĐANG CHAT:**
- Tên: ${currentUser.username}
- Email: ${currentUser.email}
- SĐT: ${currentUser.phone || 'Chưa có'}
- Địa chỉ: ${currentUser.address || 'Chưa có'}
=> Hãy chào khách bằng tên và sử dụng thông tin này để tra cứu đơn hàng (dùng tool lookupCustomerOrders với SĐT hoặc Email của họ) nếu họ hỏi "đơn hàng của tôi".
`;
  }

  const defaultSystemInstruction = `Bạn là "Trợ lý ảo IQ Tech" - nhân viên tư vấn công nghệ của ${siteSettings.companyName}.

**QUY TẮC BẤT DI BẤT DỊCH:**
1. **NGÔN NGỮ:** CHỈ được phép dùng **Tiếng Việt**.
2. **PHONG CÁCH:** Thân thiện, nhiệt tình, chuyên nghiệp, dùng emoji (😊, 🚀, 💻) để tạo cảm giác gần gũi.
3. **XƯNG HÔ:** Xưng "em" hoặc "mình", gọi khách là "anh/chị" hoặc "bạn".
4. **NHẬN DIỆN:** Tuyệt đối KHÔNG nói "tôi là mô hình ngôn ngữ của Google". Hãy nói "Em là trợ lý ảo của IQ Tech".

${userContext}

**NHIỆM VỤ CỦA BẠN:**
- Tư vấn cấu hình PC, Laptop, linh kiện máy tính.
- Giải đáp dịch vụ IT doanh nghiệp.
- Hỗ trợ tra cứu đơn hàng (sử dụng tool).

**DANH MỤC SẢN PHẨM CHÍNH:**
${productCategoriesInfo}

**LIÊN HỆ:** Hotline: ${siteSettings.companyPhone}, Địa chỉ: ${siteSettings.companyAddress}.

Nếu khách hỏi về đơn hàng của họ, hãy ưu tiên dùng tool 'lookupCustomerOrders' nếu đã biết SĐT/Email, hoặc hỏi họ thông tin để tra cứu.
`;

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
  currentChatInstance?: any
): Promise<AsyncIterable<any>> => {
  const chatToUse = currentChatInstance || chatSessionInstance;
  if (!chatToUse) throw new Error("Chat not initialized.");
  return await chatToUse.sendMessageStream({ message });
};

export const sendMessageWithImage = async (
  message: string,
  base64Data: string,
  mimeType: string,
  currentChatInstance?: any
): Promise<AsyncIterable<any>> => {
    const chatToUse = currentChatInstance || chatSessionInstance;
    if (!chatToUse) throw new Error("Chat not initialized.");

    const imagePart: any = { inlineData: { data: base64Data, mimeType: mimeType } };
    const textPart: any = { text: message };
    
    return await chatToUse.sendMessageStream({ message: { parts: [textPart, imagePart] } });
};

export const generatePCBuildRecommendation = async (useCase: string, budget: string, currentComponents?: Record<string, string>): Promise<AIBuildResponse> => {
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
Cung cấp phản hồi dưới dạng một đối tượng JSON với các khóa: 'cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'psu', 'case'. Mỗi khóa này nên là một đối tượng chứa hai khóa con: 'name' (tên linh kiện cụ thể) và 'reasoning' (lý do ngắn gọn chọn linh kiện đó bằng Tiếng Việt).
Ví dụ: { "cpu": { "name": "AMD Ryzen 5 5600X", "reasoning": "Hiệu năng tốt cho gaming tầm trung." }, ... }.
Nếu ngân sách quá thấp cho nhu cầu sử dụng, hãy trả về JSON có dạng { "error": "Ngân sách quá thấp cho nhu cầu này." }.`;
  
  try {
    const response: any = await client.models.generateContent({
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

export const generatePCBuildSuggestions = async (useCase: 'PC Gaming' | 'PC Văn phòng', budget: string, additionalRequirements: string): Promise<AIBuildSuggestionsResponse> => {
  const client = getAiClient();
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  const prompt = `Bạn là một chuyên gia xây dựng PC tại cửa hàng Việt Nam có tên "IQ Technology". Dựa trên nhu cầu của người dùng, hãy đề xuất 2-3 cấu hình PC riêng biệt (ví dụ: một cấu hình tối ưu giá, một cấu hình hiệu năng cao, hoặc một dùng Intel và một dùng AMD).

Nhu cầu của người dùng:
- Mục đích: ${useCase}
- Ngân sách: ${budget} VNĐ
- Yêu cầu thêm: ${additionalRequirements || 'Không có'}

Đối với mỗi cấu hình, hãy cung cấp một tên gọi tiếng Việt (ví dụ: "Cấu hình Gaming Tầm trung"), một tổng giá tiền ước tính (dạng số), một lý do ngắn gọn tiếng Việt tại sao cấu hình này phù hợp, và danh sách các linh kiện cụ thể bao gồm: CPU, GPU, RAM, Motherboard, SSD, PSU, và Case.
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
            reasoning: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao cấu hình này phù hợp (Tiếng Việt)." },
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
    const response: any = await client.models.generateContent({
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

export const generateTextWithGoogleSearch = async (prompt: string): Promise<{ text: string; groundingChunks?: any[] }> => {
  const client = getAiClient(); 
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }
  try {
    const response: any = await client.models.generateContent({
      model: CHAT_MODEL_NAME, 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    return {
      text: response.text,
      groundingChunks: groundingMetadata?.groundingChunks as any[] || undefined
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
    const prompt = `Làm một biên tập viên tin tức công nghệ tại Việt Nam. Sử dụng Google Search để tìm 3 tin tức công nghệ mới và thú vị nhất trong vài ngày qua (ưu tiên tin liên quan đến PC, phần cứng, AI). 
    Đối với mỗi tin tức, hãy cung cấp một tiêu đề tiếng Việt hấp dẫn, một bản tóm tắt (summary) tiếng Việt khoảng 2-3 câu, một nội dung chi tiết (content) tiếng Việt được định dạng bằng Markdown, một danh mục (category) từ danh sách sau: [${Constants.ARTICLE_CATEGORIES.join(', ')}], và một cụm từ khóa tìm kiếm hình ảnh bằng tiếng Anh (imageSearchQuery) ngắn gọn, phù hợp với nội dung.
    Trả về kết quả dưới dạng một mảng JSON.`;

    try {
        const response: any = await client.models.generateContent({
            model: CHAT_MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let jsonStr = response.text.trim();
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
