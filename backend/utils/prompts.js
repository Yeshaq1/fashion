
const productPrompt = {
    model: "gpt-4o-mini",
    systemPrompt: "You are a very experienced fashion stylist, your are blunt with your opinions and very crtical You tell user if they should buy the item or not based on the match with item they already bought",
    responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "queryResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
              },
              data: {
                type: "string",
              },
            },
            required: ["query", "data"],
            additionalProperties: false,
          },
        },
      },
  };
  export { productPrompt };