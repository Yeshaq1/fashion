//TO DO: add logic for the AI analysis here
import { getAnswerFromOpenAI } from "../utils/openai.js";
import { productPrompt } from "../utils/prompts.js";
import asyncHandler from "express-async-handler";



const getProductAnalysis = asyncHandler(async (req, res) => {
    
    const product = req.body.product;
    console.log(product);

    const query = createQuery(product);

    const analysis = await getAnswerFromOpenAI(productPrompt, query);
    console.log(analysis);

    res.status(200).json(analysis);
});


const createQuery = (product) => {
    const content = [
      {
        type: "text",
        text: `Analyze these fashion products:

1. The first image is a product the user previously purchased.
2. The subsequent images are of a new product the user is considering.

Your task:
1. Determine if the products are suitable for comparison (same gender category and compatible product types).
2. If the products are not suitable for comparison, respond only with: "Unable to provide a meaningful comparison for these products."
3. If the products are suitable for comparison, analyze if the new product will complement the user's original purchase based on current fashion industry standards.

For suitable comparisons, in your analysis:
- Start with a clear Yes/No on whether the new product is a good fit with the original.
- Provide a concise explanation (aim for about 50 words) justifying your answer.
- Consider factors like style compatibility, color coordination, occasion appropriateness, and current fashion trends.

Remember:
- Be direct and honest in your assessment.
- Maintain a professional tone while being straightforward with your opinion.
- Focus on providing practical, fashion-forward advice.
- Do not mention or explain any mismatches if products are not suitable for comparison.`
      },
      {
        type: "image_url",
        image_url: {
          url: "https://static.zara.net/assets/public/bab7/675b/70d24aacbb14/7cb189e88a35/03152533435-e1/03152533435-e1.jpg?ts=1727363544789&w=850&f=auto"
        }
      }
    ];
  
    // Add product images to the content array
    product.images.forEach(imageUrl => {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    });
  
    return content;
  };

export { getProductAnalysis };
