class LambdaMailerService
  def initialize
    @lambda_client = Aws::Lambda::Client.new(
      region: ENV.fetch("AWS_REGION"),
      credentials: Aws::Credentials.new(
        ENV.fetch("LAMBDA_EMAIL_SENDER_AWS_ACCESS_KEY_ID"),
        ENV.fetch("LAMBDA_EMAIL_SENDER_AWS_SECRET_ACCESS_KEY")
      )
    )
  end

  def send_email(to:, subject:, html:, text:)
    payload = {
      to: to,
      subject: subject,
      html: html,
      text: text
    }

    puts "Sending email to #{to} via Lambda..."

    Thread.new do
      begin
        Timeout.timeout(10) do
          @lambda_client.invoke(
            function_name: ENV.fetch("LAMBDA_EMAIL_SENDER_FUNCTION_NAME"),
            invocation_type: "Event",
            payload: payload.to_json
          )
          puts "Lambda invocation completed successfully"
        end
      rescue Timeout::Error
        puts "Lambda invocation timed out"
      rescue => e
        puts "Failed to invoke Lambda: #{e.message}"
      end
    end
  end
end
