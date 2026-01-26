
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content, Type, FunctionDeclaration } from "@google/genai"; 
import * as Constants from '../constants.tsx';
import { AIBuildResponse, SiteSettings, Article, Product, AIBuildSuggestionsResponse, User } from "../types"; 
import { MOCK_SERVICES } from '../data/mockData';
import { PRODUCT_CATEGORIES_HIERARCHY } from '../constants.tsx';


const CHAT_MODEL_NAME = 'gemini-2.5-flash';
const BUILDER_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'imagen-4.0-generate-001';

let aiInstance: GoogleGenAI | null = null;
let chatSessionInstance: Chat | null = null; 

const getAiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiInstance;
};

// Tool 1: Get Order Status by ID (Specific)
const getOrderStatusFunctionDeclaration: FunctionDeclaration = {
  name: 'getOrderStatus',
  parameters: {
    type: Type.OBJECT,
    description: 'Tìm kiếm trạng thái đơn hàng theo mã đơn hàng cụ thể (VD: T123456 hoặc 123456).',
    properties: {
      orderId: { type: Type.STRING, description: 'Mã đơn hàng cần tìm.' },
    },
    required: ['orderId'],
  },
};

// Tool 2: Lookup Orders by Customer Info (Phone/Email)
const lookupCustomerOrdersFunctionDeclaration: FunctionDeclaration = {
  name: 'lookupCustomerOrders',
  parameters: {
    type: Type.OBJECT,
    description: 'Tra cứu danh sách đơn hàng dựa trên số điện thoại hoặc email của khách hàng.',
    properties: {
      identifier: { type: Type.STRING, description: 'Số điện thoại hoặc Email dùng để đặt hàng.' },
    },
    required: ['identifier'],
  },
};


export const startChat = (
  siteSettings: SiteSettings, 
  currentUser?: User | null, 
  history?: Content[], 
  systemInstructionOverride?: string
): Chat => {
  const client = getAiClient();
  if (!client) throw new Error(Constants.API_KEY_ERROR_MESSAGE);

  const productCategoriesInfo = PRODUCT_CATEGORIES_HIERARCHY.map(cat => `- ${cat.name}`).join('\n');
  
  let userContext = "";
  if (currentUser) {
    userContext = `
**THÔNG TIN KHÁCH HÀNG ĐANG CHAT (Đã đăng nhập):**
- Tên: ${currentUser.username}
- Email: ${currentUser.email}
- SĐT: ${currentUser.phone || 'Chưa có'}
=> Nếu khách hỏi "đơn hàng của tôi", hãy tự động dùng SĐT hoặc Email trên để tra cứu (dùng tool lookupCustomerOrders) mà không cần hỏi lại.
`;
  }

  const defaultSystemInstruction = `Bạn là "Trợ lý ảo IQ Tech" - nhân viên tư vấn công nghệ chuyên nghiệp của ${siteSettings.companyName}.

**QUY TẮC CỐT LÕI:**
1. **NGÔN NGỮ:** Chỉ sử dụng Tiếng Việt.
2. **PHONG CÁCH:** Thân thiện, nhiệt tình, dùng emoji phù hợp.
3. **TRA CỨU ĐƠN HÀNG:** 
   - Nếu khách cung cấp **Mã đơn hàng** (VD: "đơn T832910 thế nào rồi", "check bill 123456"), hãy dùng tool \`getOrderStatus\`.
   - Nếu khách cung cấp **Số điện thoại** hoặc **Email** (VD: "kiểm tra đơn sđt 0905123456"), hãy dùng tool \`lookupCustomerOrders\`.
   - Nếu khách hỏi chung chung "kiểm tra đơn hàng", hãy hỏi xin Mã đơn hàng HOẶC Số điện thoại đặt hàng.
   - Khi có kết quả từ tool, hãy tóm tắt lại: Trạng thái, Tổng tiền, và Danh sách sản phẩm (nếu có).

${userContext}

**KIẾN THỨC SẢN PHẨM:**
${productCategoriesInfo}

**DỊCH VỤ:**
Cung cấp dịch vụ IT, lắp đặt camera, sửa chữa máy tính, thi công mạng văn phòng.

**LIÊN HỆ:** 
Hotline: ${siteSettings.companyPhone}
Địa chỉ: ${siteSettings.companyAddress}`;

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
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chatToUse = currentChatInstance || chatSessionInstance;
  if (!chatToUse) throw new Error("Chat not initialized.");
  return await chatToUse.sendMessageStream({ message });
};

export const sendMessageWithImage = async (
  message: string,
  base64Data: string,
  mimeType: string,
  currentChatInstance?: Chat
): Promise<AsyncIterable<GenerateContentResponse>> => {
    const chatToUse = currentChatInstance || chatSessionInstance;
    if (!chatToUse) throw new Error("Chat not initialized.");

    const imagePart: Part = { inlineData: { data: base64Data, mimeType: mimeType } };
    const textPart: Part = { text: message };
    
    // Config needs to be passed if we want tools to work with images too, but usually text logic handles tools.
    return await chatToUse.sendMessageStream({ message: [textPart, imagePart] });
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

  prompt += `\nHãy đề xuất một cấu hình PC tương thích. Cung cấp phản hồi JSON với các khóa: 'cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'psu', 'case'. Mỗi khóa chứa { "name": "...", "reasoning": "..." }.`;
  
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
    return { error: "Đã xảy ra lỗi khi nhận đề xuất từ AI." };
  }
};

export const generatePCBuildSuggestions = async (useCase: 'PC Gaming' | 'PC Văn phòng', budget: string, additionalRequirements: string): Promise<AIBuildSuggestionsResponse> => {
      const client = getAiClient();
  if (!client) {
      throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  }

  const prompt = `Đề xuất 2-3 cấu hình PC tại cửa hàng "IQ Technology".
Nhu cầu: ${useCase}, Ngân sách: ${budget} VNĐ, Yêu cầu thêm: ${additionalRequirements}.
Trả về JSON schema: { suggestions: [{ name, total_price, reasoning, components: { CPU, GPU, RAM, Motherboard, SSD, PSU, Case } }] }`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            total_price: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
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
    throw new Error("Không thể nhận gợi ý từ AI.");
  }
};

export const generateTextWithGoogleSearch = async (prompt: string): Promise<{ text: string; groundingChunks?: any[] }> => {
  const client = getAiClient(); 
  if (!client) throw new Error(Constants.API_KEY_ERROR_MESSAGE);
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: CHAT_MODEL_NAME, 
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[] || undefined
    };
  } catch (error) {
    console.error("Error generating text with Google Search:", error);
    throw error;
  }
};

export const fetchLatestTechNews = async (): Promise<Partial<Article>[]> => {
    const client = getAiClient();
    if (!client) throw new Error(Constants.API_KEY_ERROR_MESSAGE);
    const prompt = `Tìm 3 tin tức công nghệ mới nhất về PC/Hardware tại Việt Nam. Trả về JSON mảng: [{title, summary, content (markdown), category, imageSearchQuery}].`;

    try {
        const response = await client.models.generateContent({
            model: CHAT_MODEL_NAME,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) jsonStr = match[2].trim();
        
        return JSON.parse(jsonStr) as Partial<Article>[];

    } catch (error) {
        console.error("Error fetching news:", error);
        throw new Error("Không thể lấy tin tức.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const client = getAiClient();
    if (!client) throw new Error(Constants.API_KEY_ERROR_MESSAGE);
    try {
        const response = await client.models.generateImages({
            model: IMAGE_MODEL_NAME,
            prompt: prompt,
            config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating image:", error);
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
    generateImage
};

export default geminiService;
