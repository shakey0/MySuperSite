class MController < ApplicationController
  before_action :require_password, only: [ :admin_index, :admin_show, :admin_update ]

  def show
  end

  def admin_index
    @filenames = MUserData.collect_filenames
  end

  def admin_show
    @admin = "admin"
  end

  def data
    secret = params[:secret]
    convo = MUserData.load(secret)
    if !convo.nil?
      render json: { outcome: "success", convo: convo }
    else
      render json: { outcome: "failed" }
    end
  end

  def update
    secret = params[:secret]
    convo = MUserData.load(secret)
    if !convo.nil?
      result = MUserData.save(secret, params[:message])
      render json: { outcome: result ? "success" : "error" }
    else
      render json: { outcome: "failed" }
    end
  end

  def admin_update
    secret = params[:secret]
    convo = MUserData.load(secret)
    if !convo.nil?
      result = MUserData.save(secret, params[:message], direction="to")
      render json: { outcome: result ? "success" : "error" }
    else
      render json: { outcome: "failed" }
    end
  end

  def password_form
  end

  def password_auth
    correct_password = ENV["M_ADMIN_PASSWORD"]

    if params[:password] == correct_password
      file_data = get_all_auth_data
      file_content = file_data["file_content"]
      file_path = file_data["file_path"]

      secure_string = SecureRandom.alphanumeric(32)
      file_content["m_admin_cookie"] = secure_string
      File.write(file_path, file_content.to_json)

      cookies[:m_admin] = { value: secure_string, expires: 1.year.from_now }
      redirect_to session.delete(:return_to) || admin_index_path
    else
      flash[:alert] = "Incorrect password. Please try again."
      render :password_form
    end
  end

  private

  def require_password
    m_admin_cookie = cookies[:m_admin]
    file_content = get_all_auth_data["file_content"]
    return true if m_admin_cookie == file_content["m_admin_cookie"]

    # Store the target path and redirect to password form
    session[:return_to] = request.fullpath
    redirect_to m_password_form_path
  end

  def get_all_auth_data
    all_auth_data = ENV["ALL_AUTH_DATA"]
    file_path = Rails.root.join("persistent_disk", "#{all_auth_data}.json")
    file_content = File.read(file_path)
    { "file_content" => JSON.parse(file_content), "file_path" => file_path }
  end
end
