import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async function getAnswerFromOpenAI(prompt, query) {
    try {
      const response = await openai.chat.completions.create({
        model: prompt.model,
        messages: [
          {
            role: "system",
            content: prompt.systemPrompt,
          },
          { role: "user", content: query },
        ],
        response_format: prompt.responseFormat,
        max_tokens: 700,
        temperature: 0.1,
      });
      let jsonResponse = response.choices[0].message.content.trim();
  
      const parsedResponse = JSON.parse(jsonResponse);
      return parsedResponse;
    } catch (error) {
      console.error("Error fetching answer from OpenAI:", error.message);
      return "Sorry, I could not generate an answer.";
    }
  }

  export { getAnswerFromOpenAI};