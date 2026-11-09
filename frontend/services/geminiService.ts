import { GoogleGenAI } from '@google/genai';

export async function generateCustomReferralMessage(
  occasion: string,
  memberFirstName: string,
  agencyName: string,
  tone: 'friendly' | 'professional' | 'concise' = 'friendly'
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
    const prompt = `Write an authentic, casual referral SMS and email snippet for a client named ${memberFirstName} recommending their insurance agency, ${agencyName}.
Occasion/Context: ${occasion}.
Tone: ${tone}.
Strict compliance rules:
1. Do not make misleading promises or guarantee specific coverage prices.
2. Clearly explain that the agent helped review options with no pressure.
3. Include the merge tag [REFERRAL_LINK] where the link should go.
4. Keep the SMS version under 260 characters and provide an optional short email subject + body.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        systemInstruction: 'You are an insurance referral marketing assistant specialized in high-conversion, compliant word-of-mouth templates.'
      }
    });

    return response.text || 'Hey! If you ever need help navigating your health insurance, my team at ' + agencyName + ' took amazing care of me. Check them out here: [REFERRAL_LINK]';
  } catch (error) {
    console.error('Error generating AI message:', error);
    return `Hey! I wanted to share my insurance specialist at ${agencyName}. They made looking through options super straightforward and stress-free! You can connect with them here: [REFERRAL_LINK]`;
  }
}

export async function generateLeadFollowupTips(
  referredName: string,
  notes: string
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
    const prompt = `You are a licensed insurance producer coach. Give 3 quick tactical talking points for reaching out to a referred lead named ${referredName}. Context/Notes: "${notes}".
Keep it short, compliant, and focused on genuine consultation rather than hard selling.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });
    return response.text || '1. Mention who referred them right away. 2. Ask what prompted them to look at plans now. 3. Offer a 10-minute checkup.';
  } catch (err) {
    return '1. Acknowledge their mutual friend who referred them. 2. Verify their current timeline (Open Enrollment or qualifying life event). 3. Keep first conversation friendly and low pressure.';
  }
}
