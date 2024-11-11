class MController < ApplicationController
  def show
  end

  def m_data
    secret = params[:secret]
    if secret == "koala888"
      render json: { message: "success" }
    else
      render json: { message: "failure" }
    end
  end
end
