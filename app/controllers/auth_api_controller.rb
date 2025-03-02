class AuthApiController < ApplicationController
  before_action :authenticate_user!, only: [ :log_out ]
  before_action :require_no_user!, only: [ :log_in, :sign_up, :forgot_password ]

  def log_in
    permitted_params = params.require(:auth_api).permit(:email, :password)
    email = permitted_params[:email].strip.downcase.gsub(/[[:cntrl:]]/, "")
    password = permitted_params[:password].strip.gsub(/[[:cntrl:]]/, "")

    user = UserData.get_user_by_email(email)

    if user && BCrypt::Password.new(user["password"]) == password
      set_user_session_cookie(user, true)

      render json: { outcome: "success_and_redirect_to_root" }
    else
      render json: { outcome: "failed", errors: [ "Invalid email or password" ] }
    end
  end

  def log_out
    session_data = JSON.parse(cookies.signed[:user_session])
    user_id = session_data["user_id"]
    session_token = session_data["session_token"]

    user = UserData.get_user_by_id(user_id)
    user["active_sessions"].reject! { |session| BCrypt::Password.new(session["key"]) == session_token }

    UserData.update_user_sessions(user)

    $redis.del("user:#{user_id}")

    cookies.delete(:user_session)

    render json: { outcome: "success_and_redirect_to_auth" }
  end

  def sign_up
    permitted_params = params.require(:auth_api).permit(:name, :email, :from_section)
    name = permitted_params[:name].strip.gsub(/[[:cntrl:]]/, "")
    email = permitted_params[:email].strip.downcase.gsub(/[[:cntrl:]]/, "")
    from_section = permitted_params[:from_section]

    unless email.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
      render json: { outcome: "failed", errors: [ "Invalid email address." ] }
      return
    end

    user = UserData.get_user_by_email(email)

    if user
      render json: { outcome: "failed", errors: [ "This email is already taken." ] }
    else
      # Cache the email as a key for 30 seconds to prevent multiple sign up requests while checking if it's cached
      unless $redis.set("set_password_link_sent:#{email}", "1", nx: true, ex: 30)
        render json: { outcome: "failed", errors: [ "Check your inbox for the invitation email." ] }
        return
      end

      temp_user = { "name" => name, "email" => email }

      set_auth_token_and_send_email(temp_user, from_section, true)

      render json: { outcome: "success", message: "An invitation email has been sent to your email address. It will be valid for 10 minutes and can only be clicked once." }
    end
  end

  def set_password
    permitted_params = params.require(:auth_api).permit(:auth_token, :password)
    auth_token = permitted_params[:auth_token]
    password = permitted_params[:password].strip.gsub(/[[:cntrl:]]/, "")

    if password.length < 8
      render json: { outcome: "failed", errors: [ "Password must be at least 8 characters." ] }
      return
    end

    user_data = $redis.get("auth_token:set_password_auth:#{auth_token}")

    if user_data.nil?
      render json: { outcome: "failed_and_redirect_to_auth", message: "This link has timed out. Please request a new one." }
    else
      user = JSON.parse(user_data)

      # Check if email is cached in redis
      if $redis.get("auth_action_completed:#{user["email"]}")
        render json: {
          outcome: "failed_and_redirect_to_auth",
          message: "Your password reset has failed as this action has already been performed within the last 10 minutes. If you didn't set or reset your password, please contact me. Otherwise, please wait a bit before trying again."
        }
        return
      end

      if user["id"]
        # The user already exists, so update the password
        UserData.update_user_password(user, password)
      else
        UserData.create_user(user["name"], user["email"], password)
      end

      $redis.del("auth_token:set_password_auth:#{auth_token}")

      # Cache the email in redis for 10 minutes to prevent multiple password set requests
      $redis.set("auth_action_completed:#{user["email"]}", "1", ex: 10 * 60)

      render json: {
        outcome: "success_and_redirect_to_auth",
        message: "Your password has been set and your account is ready! Please log in."
      }
    end
  end

  def forgot_password
    permitted_params = params.require(:auth_api).permit(:email, :from_section)
    email = permitted_params[:email].strip.downcase.gsub(/[[:cntrl:]]/, "")
    from_section = permitted_params[:from_section]

    # Check if email is cached in redis
    if $redis.get("auth_action_completed:#{email}")
      render json: {
        outcome: "failed",
        errors: [ "You have already set or reset your password within the last 10 minutes. If you didn't do this, please contact me. Otherwise, please wait a bit before trying again." ]
      }
      return
    end

    unless $redis.set("set_password_link_sent:#{email}", "1", nx: true, ex: 30)
      render json: { outcome: "failed", errors: [ "Check your inbox for the password reset email." ] }
      return
    end

    universal_message = "A password reset link has been emailed to you (if you have an account). It will be valid for 10 minutes and can only be clicked once."

    user = UserData.get_user_by_email(email)

    if user
      user.delete("password") # Incredibly important as the set_auth_token_and_send_email method will store the user in Redis
      set_auth_token_and_send_email(user, from_section)

      render json: { outcome: "success", message: universal_message }
    else
      render json: { outcome: "success", message: universal_message }
    end
  end

  private

  def set_auth_token_and_send_email(user, from_section, is_sign_up = false)
    auth_token = SecureRandom.alphanumeric(64)

    $redis.set("auth_token:set_password_link:#{auth_token}", user.to_json, ex: 10.minutes)

    # Send the auth_token to the user's email
    domain = Rails.env.production? ? "https://shakey0.co.uk" : "http://localhost:5100"
    link = "#{domain}/#{from_section}/auth?auth_token=#{auth_token}"
    if is_sign_up
      UserMailer.welcome_email(user, link).deliver_now
    else
      UserMailer.forgot_password_email(user, link).deliver_now
    end
  end
end
