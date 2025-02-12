class LambdaTriviaQuestionsService
  def initialize
    @lambda_client = Aws::Lambda::Client.new(
      region: ENV.fetch("AWS_REGION"),
      credentials: Aws::Credentials.new(
        ENV.fetch("LAMBDA_GENERAL_AWS_ACCESS_KEY_ID"),
        ENV.fetch("LAMBDA_GENERAL_AWS_SECRET_ACCESS_KEY")
      )
    )
  end

  def get_trivia_questions(category:, difficulty:)
    payload = {
      category: category,
      difficulty_level: difficulty
    }

    puts "Getting trivia questions for category #{category} and difficulty #{difficulty} via Lambda..."

    Thread.new do
      retries = 0
      max_retries = 2

      begin
        Timeout.timeout(10) do
          @lambda_client.invoke(
            function_name: ENV.fetch("LAMBDA_TRIVIA_QUESTIONS_FUNCTION_NAME"),
            invocation_type: "Event",
            payload: payload.to_json
          )
          puts "Lambda invocation completed successfully"
        end
      rescue Timeout::Error
        puts "Lambda invocation timed out (attempt #{retries + 1}/#{max_retries + 1})"
        if retries < max_retries
          retries += 1
          sleep(2 ** retries) # Exponential backoff: 2s, then 4s
          retry
        end
      rescue => e
        puts "Failed to invoke Lambda: #{e.message}"
      end
    end
  end
end
