class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def authenticate_user!
    unless current_user
      if request.xhr? || request.content_type == "application/json"
        render json: { error: "Unauthorized access", status: :unauthorized }, status: :unauthorized
      else
        redirect_to brain_auth_path # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
      end
    end
  end

  def require_no_user!
    if current_user
      if request.xhr? || request.content_type == "application/json"
        render json: { error: "Access not permitted for authenticated users", status: :forbidden }, status: :forbidden
      else
        redirect_to brain_index_path # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
      end
    end
  end

  def current_user
    return @current_user if defined?(@current_user)

    return nil unless cookies.signed[:user_session]

    begin
      session_data = JSON.parse(cookies.signed[:user_session])
      user_id = session_data["user_id"]
      session_token = session_data["session_token"]

      user = UserData.get_user_by_id(user_id)
      return nil unless user

      user["active_sessions"] ||= []

      hashed_session_token = user["active_sessions"].find { |session| BCrypt::Password.new(session["key"]) == session_token }

      last_login_less_than_30_days_ago = Time.parse(user["last_login"]) > 30.days.ago

      is_valid_session = hashed_session_token.present? && Time.parse(hashed_session_token["created_at"]) > 14.days.ago && last_login_less_than_30_days_ago

      unless is_valid_session
        if last_login_less_than_30_days_ago
          user["active_sessions"].reject! { |session| BCrypt::Password.new(session["key"]) == session_token }
        else
          user["active_sessions"] = []
        end
        UserData.update_user_sessions(user)
        hashed_session_token = nil
      end

      # If the session is older than 12 hours, refresh the session token
      if hashed_session_token.present? && Time.parse(hashed_session_token["created_at"]) < 12.hours.ago
        user["active_sessions"].reject! { |session| BCrypt::Password.new(session["key"]) == session_token }
        set_user_session_cookie(user)
      end

      @current_user = is_valid_session ? user : nil
    rescue JSON::ParserError
      nil
    end
  end

  def current_user=(user)
    @current_user = user
  end

  def set_user_session_cookie(user, has_logged_in = false)
    session_token = SecureRandom.alphanumeric(64)

    session_data = {
      user_id: user["id"],
      session_token: session_token
    }
    cookies.signed[:user_session] = {
      value: session_data.to_json,
      expires: 14.days.from_now,
      httponly: true,
      secure: Rails.env.production?,
      domain: Rails.env.production? ? ".shakey0.co.uk" : nil,
      same_site: Rails.env.production? ? :strict : nil
    }

    hashed_session_token = BCrypt::Password.create(session_token)
    user["active_sessions"] << {
      "key" => hashed_session_token,
      "created_at" => Time.now.iso8601
    }

    # Clean up expired sessions that are older than 14 days
    user["active_sessions"].select! { |session| Time.parse(session["created_at"]) > 14.days.ago }

    user["last_login"] = Time.now.utc.to_s if has_logged_in

    UserData.update_user_sessions(user)
  end
end
