
import { GoogleGenAI } from "@google/genai";
import { IntelligenceData, Mission, Team } from '../types.ts';

const getApiKey = () => {
  const key = import.meta.env.VITE_API_KEY;
  if (!key) {
    console.warn("VITE_API_KEY environment variable not set. AI features will not work.");
    return null;
  }
  return key;
};

const apiKey = getApiKey();
// FIX: Correctly initialize GoogleGenAI with a named apiKey parameter.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface BattleWinner {
    battle: string; // e.g., 'battle1_leadership'
    winner: 'alpha' | 'beta' | 'tie';
    reasoning: string;
}

export interface AIScoreResult {
  team_alpha_score: {
    accuracy_score: number;
    sources_score: number;
    presentation_score: number;
    speed_score: number;
    reasoning: string;
  };
  team_beta_score: {
    accuracy_score: number;
    sources_score: number;
    presentation_score: number;
    speed_score: number;
    reasoning: string;
  };
  winning_team_reasoning: string;
  battle_winners: BattleWinner[];
}

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

  const prompt = `You are an expert market intelligence analyst. You are given two competing intelligence reports on the company "${companyName}". Your task is to score both reports, determine an overall winner, and also determine a winner for each of the 5 battle sections.

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
1.  **Data Accuracy, Completeness, and Insight (60 points):** Evaluate the likely accuracy and the completeness of the data provided. Penalize for empty fields, vague entries, or nonsensical data. Importantly, a significant portion of this score should come from the quality of the \`notes\` fields. Reward insightful, relevant notes that provide context, analysis, or strategic observations, as this demonstrates a deeper level of intelligence gathering beyond simple data entry.
2.  **Source Links (15 points):** Award points based on the number of non-empty \`sourceLink\` fields.
3.  **Teamwork & Presentation (15 points):** Evaluate the overall structure, coherence, and the quality of the 'companyBrief'.
4.  **Speed Score (10 points):** Based on the submission times provided, award points for speed. The faster a team submits relative to the time limit, the more points they should get. A team submitting at the last second should get 0 points, while a team submitting instantly would get 10.

**Battle-Specific Winners:**
For each of the 5 battle sections ('battle1_leadership', 'battle2_products', 'battle3_funding', 'battle4_customers', 'battle5_alliances'), declare a winning team ('alpha' or 'beta') and provide a one-sentence justification.

Please provide your evaluation and scores in a strict JSON format. Do not add any commentary outside of the JSON object. The JSON object should look like this:

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
Fill in the numeric scores and string reasoning based on your expert analysis. The scores for each category must be within their maximum point value (60, 15, 15, 10).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // FIX: Use the .text property to get the response text directly.
    const jsonString = response.text?.trim() || '';
    const cleanedJson = jsonString.replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(cleanedJson) as AIScoreResult;
  } catch (error) {
    console.error("Error scoring reports with Gemini API:", error);
    return null;
  }
};

// FIX: Export 'fetchAiAssistedData' function to be used for the AI Assist feature in the War Room.
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

    // FIX: Use the .text property to get the response text directly.
    return response.text?.trim() || null;
  } catch (error) {
    console.error(`Error fetching AI-assisted data for ${fieldLabel}:`, error);
    return null;
  }
};
