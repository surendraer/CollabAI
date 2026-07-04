import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import logger from "../utils/logger";

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI | null {
    if (!this.genAI && config.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    return this.genAI;
  }

  /**
   * AI Task Breakdown: Breakdown a task description into subtasks
   */
  public static async breakdownTask(description: string): Promise<string[]> {
    const client = this.getClient();
    if (!client) {
      logger.info("🤖 AI Service: Using mock data for task breakdown.");
      return [
        "Initialize project base configurations and setup git repository",
        "Define schema models and migration configurations",
        "Build secure middleware validation schemas for request bodies",
        "Write comprehensive unit test suites for edge cases",
        "Deploy application module to staging environment for manual testing",
      ];
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Break down the following task description into a list of 4-6 specific, actionable subtask titles. Return ONLY a JSON string containing an array of strings, without markdown formatting or code blocks:
      
      Task Description: "${description}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse JSON array safely
      const cleanJson = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson) as string[];
    } catch (error) {
      logger.error("❌ AI Service Error in breakdownTask:", error);
      return ["Implement task base logic", "Write unit tests", "Perform review and merge"];
    }
  }

  /**
   * AI Sprint Summary: Summarizes team progress
   */
  public static async summarizeSprint(tasksSummary: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      logger.info("🤖 AI Service: Using mock data for sprint summary.");
      return `### 📊 Sprint Velocity Summary
- **Tasks Complete**: 8 tasks closed this week.
- **Key Milestones**: Finished base JWT session storage and fixed critical database index constraints.
- **Current Blocks**: 2 tasks are delayed in review due to CORS issues.
- **Productivity Rating**: High. The team moved 30% faster due to memory-DB test configurations.`;
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Based on the following JSON listing of tasks for this sprint, generate a high-level weekly velocity sprint summary in markdown. Mention completed items, items in progress, potential delays/risks, and next steps:
      
      Tasks Data: ${tasksSummary}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error("❌ AI Service Error in summarizeSprint:", error);
      return "Unable to generate sprint summary at this time. Please check your Gemini connection.";
    }
  }

  /**
   * AI Bug Explanation: Explains errors and suggests fixes
   */
  public static async explainError(errorLog: string): Promise<{ explanation: string; suggestions: string[] }> {
    const client = this.getClient();
    if (!client) {
      logger.info("🤖 AI Service: Using mock data for bug explanation.");
      return {
        explanation: "The database connection failed because Mongoose tried to connect before the local in-memory Mongo server binary finished downloading and extracting.",
        suggestions: [
          "Increase the 'launchTimeout' in mongodb-memory-server to 120000ms inside database config.",
          "Check local internet connection to verify that download of MongoDB binary is not blocked.",
          "Ensure that your local anti-virus or firewall is not blocking node.exe from binding to local ports.",
        ],
      };
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Analyze this error log or error message. Provide a concise explanation of what the bug is, and a JSON array of 3 actionable suggestions to resolve it. Return your response in this exact format:
      
      Explanation: [Your concise explanation here]
      Suggestions: ["suggestion 1", "suggestion 2", "suggestion 3"]

      Error Log: "${errorLog}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const explanationMatch = text.match(/Explanation:\s*(.*)/i);
      const suggestionsMatch = text.match(/Suggestions:\s*(\[.*\])/is);

      const explanation = explanationMatch ? explanationMatch[1].trim() : "Failed to analyze error context.";
      let suggestions: string[] = ["Review standard exception stack trace", "Check system environment configurations"];

      if (suggestionsMatch) {
        try {
          suggestions = JSON.parse(suggestionsMatch[1].trim());
        } catch {
          // Fallback if parsing fails
        }
      }

      return { explanation, suggestions };
    } catch (error) {
      logger.error("❌ AI Service Error in explainError:", error);
      return {
        explanation: "Failed to perform AI analysis due to service error.",
        suggestions: ["Check the backend logs", "Verify API key limits"],
      };
    }
  }

  /**
   * AI Meeting Notes: Turn notes into tasks
   */
  public static async parseMeetingNotes(notes: string): Promise<{ title: string; assigneeName?: string; description?: string }[]> {
    const client = this.getClient();
    if (!client) {
      logger.info("🤖 AI Service: Using mock data for meeting notes parser.");
      return [
        {
          title: "Implement Workspace selector sidebar UI",
          assigneeName: "Developer",
          description: "Build Notion switch selector matching layout designs.",
        },
        {
          title: "Setup WebSocket connections in client routes",
          assigneeName: "Lead",
          description: "Initialize client Socket.IO client state updates.",
        },
        {
          title: "Configure Atlas DB credentials on Render",
          assigneeName: "Admin",
          description: "Add environment production secrets to render console.",
        },
      ];
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Analyze the meeting notes below and extract actionable tasks that need to be completed. For each task, capture the title, the name of the assigned person (if mentioned, else null), and a brief description. 
      Return ONLY a JSON string containing an array of objects with the fields "title", "assigneeName", and "description". Do not include markdown code block formatting:
      
      Meeting Notes:
      "${notes}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const cleanJson = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      logger.error("❌ AI Service Error in parseMeetingNotes:", error);
      return [];
    }
  }
}

export default AIService;
