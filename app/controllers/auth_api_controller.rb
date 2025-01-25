class AuthApiController < ApplicationController
  before_action :authenticate_user!, only: [ :log_out ]
  before_action :require_no_user!, only: [ :log_in, :sign_up ]

  def log_in
    email = params.permit(:email)[:email]
    password = params.permit(:password)[:password]

    user = UserData.get_user_by_email(email)

    # if user && BCrypt::Password.new(user["password"]) == password # THIS IS FOR WHEN BCRYPT IS IMPLEMENTED
    if user && user["password"] == password
      session_token = SecureRandom.alphanumeric(64)
      set_user_session_cookie(user["id"], session_token)
      user["active_sessions"] << {
        "key" => session_token,
        "created_at" => Time.now.iso8601
      }

      # Clean up expired sessions that are older than 1 year
      user["active_sessions"].select! { |session| Time.parse(session["created_at"]) > 1.year.ago }

      UserData.update_user(user)

      render json: { outcome: "success" }
    else
      render json: { outcome: "failed", errors: [ "Invalid email or password" ] }
    end
  end

  def log_out
    session_data = JSON.parse(cookies.signed[:user_session])
    user_id = session_data["user_id"]
    session_token = session_data["session_token"]

    user = UserData.get_user_by_id(user_id)
    user["active_sessions"].reject! { |session| session["key"] == session_token }

    UserData.update_user(user)

    $redis.del("user:#{user_id}")

    cookies.delete(:user_session)

    render json: { outcome: "success" }
  end

  def sign_up
    # Create a new user with the provided secrets and encypt them all with bcrypt
    # Remember to downcase and gsub the secrets to remove any punctuation, whitespace, or control characters
    # Remember to gsub the name to remove any punctuation or control characters
    # Remember to set the active_sessions to an empty array
    # Remember to set the id to a SecureRandom.alphanumeric(9)
  end

  private

  def set_user_session_cookie(user_id, session_token)
    session_data = {
      user_id: user_id,
      session_token: session_token
    }
    cookies.signed[:user_session] = {
      value: session_data.to_json,
      expires: 1.year.from_now,
      httponly: true,
      secure: Rails.env.production?,
      domain: Rails.env.production? ? ".shakey0.co.uk" : nil
    }
  end
end
