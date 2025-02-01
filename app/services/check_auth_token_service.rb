class CheckAuthTokenService
  def initialize(token)
    @token = token
    @invalid_message = "This link has expired or is invalid."
  end

  def check_and_reassign_token
    return { valid: false, message: @invalid_message } if @token.nil?

    user_data = $redis.get("auth_token:set_password_link:#{@token}")

    return { valid: false, message: @invalid_message } if user_data.nil?

    user = JSON.parse(user_data)

    $redis.del("auth_token:set_password_link:#{@token}")
    $redis.set("auth_token:set_password_auth:#{@token}", user_data, ex: 5.minutes)

    { valid: true }
  end
end
