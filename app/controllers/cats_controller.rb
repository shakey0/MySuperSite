class CatsController < ApplicationController
  def index
  end

  def show
  end

  def data
    slug = params[:slug]
    cat_data = CatData.load_all(slug)
    render json: cat_data
  end

  def photo
    slug = params[:slug] || "default"
    filename = params[:filename] || "default.jpg"

    file_path = Rails.root.join("persistent_disk", "cats", slug, "photos", filename)

    if File.exist?(file_path)
      send_file file_path, disposition: "inline"
    else
      render plain: "File not found", status: :not_found
    end
  end
end
