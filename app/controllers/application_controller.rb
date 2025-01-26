class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def authenticate_user!
    unless current_user
      if request.xhr? || request.content_type == "application/json"
        render json: { error: 'Unauthorized access', status: :unauthorized }, status: :unauthorized
      else
        redirect_to brain_auth_path # This will need to direct dynamically to the correct path in the future
      end
    end
  end
  
  def require_no_user!
    if current_user
      if request.xhr? || request.content_type == "application/json"
        render json: { error: 'Access not permitted for authenticated users', status: :forbidden }, status: :forbidden
      else
        redirect_to brain_index_path # This will need to direct dynamically to the correct path in the future
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

      # Check if the session token exists in active_sessions and it's less than 1 year old
      is_valid_session = user["active_sessions"].any? { |session| BCrypt::Password.new(session["key"]) == session_token && Time.parse(session["created_at"]) > 1.year.ago }

      @current_user = is_valid_session ? user : nil
    rescue JSON::ParserError
      nil
    end
  end

  def current_user=(user)
    @current_user = user
  end
end
