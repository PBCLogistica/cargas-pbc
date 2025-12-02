import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Load } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only if the key exists, handled in the component
const getClient = () => new GoogleGenAI({ apiKey });

export const analyzeLoads = async (loads: Load[], userQuery: string): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API não configurada (process.env.API_KEY ausente).";
  }

  const ai = getClient();
  const dataContext = JSON.stringify(loads);
  
  const prompt = `
    Você é um assistente de logística especialista do sistema "Cargas PBC".
    Aqui estão os dados atuais das cargas em formato JSON:
    ${dataContext}

    Responda à seguinte pergunta do usuário com base nesses dados.
    Seja conciso, profissional e use formatação markdown para deixar a resposta legível.
    
    Pergunta do usuário: "${userQuery}"
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao consultar a IA. Tente novamente mais tarde.";
  }
};

export const chatWithGemini = async (history: string[], message: string): Promise<string> => {
    if (!apiKey) {
        return "Erro: Chave de API não configurada.";
    }

    const ai = getClient();
    // Simple stateless chat for this demo, keeping context minimal
    const prompt = `
      Histórico da conversa:
      ${history.join('\n')}
      
      Nova mensagem: ${message}
      
      Atue como um assistente útil e amigável da Cargas PBC.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Sem resposta.";
    } catch (error) {
        return "Erro de comunicação com a IA.";
    }
}