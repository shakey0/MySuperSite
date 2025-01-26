class CheckAuthTokenService
  def initialize(token)
    @token = token
    @invalid_message = "This link has expired or is invalid."
  end

  def check_and_reassign_token
    return { valid: false, message: @invalid_message } if @token.nil?

    user_data = $redis.get("auth_token:#{@token}")

    return { valid: false, message: @invalid_message } if user_data.nil?

    user = JSON.parse(user_data)

    $redis.del("auth_token:#{@token}")
    $redis.set("auth_token_b:#{@token}", user_data, ex: 5.minutes)

    { valid: true }
  end
end
