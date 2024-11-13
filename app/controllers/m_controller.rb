class MController < ApplicationController
  def show
  end

  def m_data
    secret = params[:secret]
    user_data = load_user_data(secret)
    if user_data.present?
      render json: { status: "success", data: user_data }
    else
      render json: { status: "failed" }
    end
  end

  private

  def load_user_data(secret)
    # Check if the secret contains only alphanumeric characters
    if secret =~ /[^a-zA-Z0-9]/
      return {}
    end
  
    file_path = Rails.root.join("persistent_disk", "m", "#{secret}.json")
    if File.exist?(file_path)
      file_content = File.read(file_path)
      user_data = JSON.parse(file_content)
    else
      user_data = {}
    end
  end  
end
