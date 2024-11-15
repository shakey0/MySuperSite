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

  def m_data
    secret = params[:secret]
    user_data = MUserData.load(secret)
    if user_data.present?
      render json: { outcome: "success", data: user_data }
    else
      render json: { outcome: "failed" }
    end
  end

  def update
    secret = params[:secret]
    user_data = MUserData.load(secret)
    if user_data.present?
      result = MUserData.save(secret, user_data, params[:message])
      render json: { outcome: result ? "success" : "error" }
    else
      render json: { outcome: "failed" }
    end
  end

  def admin_update
    secret = params[:secret]
    user_data = MUserData.load(secret)
    if user_data.present?
      result = MUserData.save(secret, user_data, params[:message], direction="to")
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
      cookies[:m_admin_password] = { value: correct_password, expires: 1.year.from_now }
      redirect_to session.delete(:return_to) || admin_index_path
    else
      flash[:alert] = "Incorrect password. Please try again."
      render :password_form
    end
  end

  private

  def require_password
    correct_password = ENV["M_ADMIN_PASSWORD"]
    return true if cookies[:m_admin_password] == correct_password

    # Store the target path and redirect to password form
    session[:return_to] = request.fullpath
    redirect_to m_password_form_path
  end
end
