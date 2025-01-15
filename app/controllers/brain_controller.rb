class BrainController < ApplicationController
  # index route must require the user to be logged in
  before_action :authenticate_user!, only: [:index]
  before_action :require_no_user!, only: [:auth, :log_in, :sign_up]

  def index
  end

  def auth
  end

  def log_in
    custom_logger = Logger.new(Rails.root.join('log', 'custom.log'))
    # Temp fake data
    fake_user = {
      id: "rJ3P02N1d",
      name: "Johnny Boy",
      secret_1: "blackwell",
      secret_2: "missgreen",
      secret_3: "tulleysfarm",
      active_sessions: [
        {
          key: SecureRandom.alphanumeric(64),
          created_at: Time.now.iso8601,
        },
        {
          key: SecureRandom.alphanumeric(64),
          created_at: (Time.now - 6.months).iso8601,
        },
        {
          key: SecureRandom.alphanumeric(64),
          created_at: (Time.now - 2.years).iso8601,
        }
      ]
    }

    fake_users = [ fake_user ]

    secret_1 = params["primary-school"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")
    secret_2 = params["second-grade-teacher"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")
    secret_3 = params["first-company"].downcase.gsub(/\p{Punct}|\s|[[:cntrl:]]/, "")

    users_by_first_secret = fake_users.select { |u| u[:secret_1] == secret_1 } # THIS WILL BECOME A DATABASE QUERY
    users_by_second_secret = users_by_first_secret.select { |u| u[:secret_2] == secret_2 }
    user = users_by_second_secret.find { |u| u[:secret_3] == secret_3 }
    if user
      session_token = SecureRandom.alphanumeric(64)
      set_user_session_cookie(user[:id], session_token)
      user[:active_sessions] << {
        key: session_token,
        created_at: Time.now.iso8601
      }

      # Clean up expired sessions that are older than 1 year
      user[:active_sessions].select! { |session| Time.parse(session[:created_at]) > 1.year.ago }

      $redis.set("user:#{user[:id]}", user.to_json, ex: 1.hour)

      # PUT THE UPDATED USER BACK INTO THE DATABASE
    end

    custom_logger.info("User: #{user}")

    render json: { outcome: user ? "success" : "failure" }
  end

  def log_out
  end

  def sign_up
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
