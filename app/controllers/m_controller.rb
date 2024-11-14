class MController < ApplicationController
  def show
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
end
