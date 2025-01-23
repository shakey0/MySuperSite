class AuthApiController < ApplicationController
  before_action :authenticate_user!, only: [ :log_out ]
  before_action :require_no_user!, only: [ :log_in, :sign_up ]

  def log_in
    secret_1 = params["primary-school"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")
    secret_2 = params["second-grade-teacher"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")
    secret_3 = params["first-company"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")

    # Search all users with the first secret in dynamodb
    users_by_first_secret = UserData.query_users_by_secret(secret_1)
    users_by_second_secret = users_by_first_secret.select { |u| u["secret_2"] == secret_2 }
    user = users_by_second_secret.find { |u| u["secret_3"] == secret_3 }
    if user
      session_token = SecureRandom.alphanumeric(64)
      set_user_session_cookie(user["id"], session_token)
      user["active_sessions"] << {
        "key" => session_token,
        "created_at" => Time.now.iso8601
      }

      # Clean up expired sessions that are older than 1 year
      user["active_sessions"].select! { |session| Time.parse(session["created_at"]) > 1.year.ago }

      UserData.update_user(user)
    end

    render json: { outcome: user ? "success" : "failure" }
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
