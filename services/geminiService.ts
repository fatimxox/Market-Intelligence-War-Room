import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
    return null;
  }
  return key;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const fetchAiAssistedData = async (
  targetCompany: string,
  fieldName: string
): Promise<string> => {
  if (!ai) {
    return "AI service is not configured. Please set API_KEY.";
  }

  const prompt = `For the company "${targetCompany}", what is their "${fieldName}"? Provide only the value, without any extra commentary. If you cannot find a specific value, respond with "Data not publicly available".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    return "An error occurred while fetching AI data.";
  }
};
