class CatTranslationService
  include HTTParty
  base_uri "https://api.openai.com/v1"

  def initialize(api_key)
    @api_key = api_key
  end

  def translate(json)
    response = self.class.post(
      "/chat/completions",
      headers: {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{@api_key}"
      },
      body: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a translator that converts English text into Chinese and responds ONLY with JSON. Do not include any additional text or explanations."
          },
          {
            role: "user",
            content: "Translate the following JSON strings from English to Chinese: #{json.to_json}"
          }
        ],
        temperature: 0.3
      }.to_json
    )

    if response.success?
      JSON.parse(response.parsed_response["choices"][0]["message"]["content"])
    else
      "Error: #{response}"
    end
  end
end
