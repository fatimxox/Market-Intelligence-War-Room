import { GoogleGenAI } from "@google/genai";
import { IntelligenceData, Mission, Team, AIScoreResult } from '../types';

const getApiKey = () => {
  // FIX: Use process.env.API_KEY as required by the guidelines. This also resolves the TypeScript error with import.meta.env.
  const key = process.env.API_KEY;
  if (!key) {
    // FIX: Updated warning message to refer to the correct environment variable.
    console.warn("API_KEY environment variable not set. AI features will not work.");
    return null;
  }
  return key;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const scoreReports = async (
  companyName: string,
  reportAlpha: IntelligenceData,
  reportBeta: IntelligenceData,
  mission: Mission,
  teamAlpha: Team,
  teamBeta: Team
): Promise<AIScoreResult | null> => {
  if (!ai) {
    console.error("AI service is not configured.");
    return null;
  }

  const reportAlphaStr = JSON.stringify(reportAlpha, null, 2);
  const reportBetaStr = JSON.stringify(reportBeta, null, 2);

  const missionStartTime = mission.mission_start_time ? new Date(mission.mission_start_time).getTime() : 0;
  const totalDuration = mission.time_limit_minutes * 60 * 1000;

  const alphaTimeTakenMs = teamAlpha.submission_timestamp ? new Date(teamAlpha.submission_timestamp).getTime() - missionStartTime : totalDuration;
  const betaTimeTakenMs = teamBeta.submission_timestamp ? new Date(teamBeta.submission_timestamp).getTime() - missionStartTime : totalDuration;

  const formatDuration = (ms: number) => {
      if (ms <= 0) return "0 minutes";
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes} minutes and ${seconds} seconds`;
  };

  const alphaTimeTakenFormatted = formatDuration(alphaTimeTakenMs);
  const betaTimeTakenFormatted = formatDuration(betaTimeTakenMs);

  const prompt = `You are 'The Analyst', a legendary figure in corporate espionage, known for your meticulous and unbiased evaluation of intelligence reports. Your task is to critically assess two competing reports on the company "${companyName}". You will score both reports based on the provided criteria, declare an overall winner with a conclusive final verdict, and determine a winner for each of the 5 distinct battle sections.

**Mission Context:**
The mission had a time limit of ${mission.time_limit_minutes} minutes.
- Team Alpha submitted their report in ${alphaTimeTakenFormatted}.
- Team Beta submitted their report in ${betaTimeTakenFormatted}.

**Report for Team Alpha:**
\`\`\`json
${reportAlphaStr}
\`\`\`

**Report for Team Beta:**
\`\`\`json
${reportBetaStr}
\`\`\`

**Scoring Criteria (Total 100 points):**
1.  **Data Accuracy, Completeness, and Insight (60 points):** Scrutinize the accuracy and depth of the data. Penalize for empty fields, vagueness, or unverified claims. A significant portion of this score must come from the quality of the \`notes\` fields. High-value notes provide context, strategic analysis, or actionable insights, demonstrating intelligence beyond simple data entry.
2.  **Source Links (15 points):** Award points for the quantity and quality of verifiable \`sourceLink\` fields. More credible sources (e.g., official filings, reputable news) are better than blogs.
3.  **Teamwork & Presentation (15 points):** Evaluate the report's coherence, structure, and the quality of the 'companyBrief'. A well-synthesized brief that tells a clear story is a sign of good teamwork.
4.  **Speed Score (10 points):** Based on submission times, award points for swiftness. A team submitting at the last second gets 0 points. A team submitting instantly gets 10. Distribute points linearly based on time saved.

**Battle-Specific Winners:**
For EACH of the 5 battle sections ('battle1_leadership', 'battle2_products', 'battle3_funding', 'battle4_customers', 'battle5_alliances'), declare a winning team ('alpha', 'beta', or 'tie') and provide a concise one-sentence justification for your choice.

Please provide your evaluation in a strict JSON format. Do not add any commentary outside of the JSON object. The root of the response must be a valid JSON object.

\`\`\`json
{
  "team_alpha_score": {
    "accuracy_score": 0,
    "sources_score": 0,
    "presentation_score": 0,
    "speed_score": 0,
    "reasoning": ""
  },
  "team_beta_score": {
    "accuracy_score": 0,
    "sources_score": 0,
    "presentation_score": 0,
    "speed_score": 0,
    "reasoning": ""
  },
  "winning_team_reasoning": "",
  "battle_winners": [
    { "battle": "battle1_leadership", "winner": "alpha", "reasoning": "" },
    { "battle": "battle2_products", "winner": "beta", "reasoning": "" },
    { "battle": "battle3_funding", "winner": "alpha", "reasoning": "" },
    { "battle": "battle4_customers", "winner": "tie", "reasoning": "" },
    { "battle": "battle5_alliances", "winner": "beta", "reasoning": "" }
  ]
}
\`\`\`
Fill in the numeric scores and string reasoning based on your expert analysis. The total score for each team is the sum of the four categories. The \`winning_team_reasoning\` should be your final verdict on the overall winner.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonString = response.text.trim();
    const cleanedJson = jsonString.replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(cleanedJson) as AIScoreResult;
  } catch (error) {
    console.error("Error scoring reports with Gemini API:", error);
    return null;
  }
};

export const fetchAiAssistedData = async (
  companyName: string,
  fieldLabel: string
): Promise<string | null> => {
  if (!ai) {
    console.error("AI service is not configured.");
    return null;
  }

  const prompt = `You are a market intelligence research assistant. Your goal is to find specific pieces of public information about companies.
  
  Company: "${companyName}"
  Information Requested: "${fieldLabel}"

  Provide a concise answer containing only the requested information. If the information is not publicly available or cannot be found, respond with "Not publicly available". Do not add any extra commentary or explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error(`Error fetching AI-assisted data for ${fieldLabel}:`, error);
    return null;
  }
};