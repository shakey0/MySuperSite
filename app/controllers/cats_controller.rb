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

    unless slug.match?(/\A[a-z_]+\z/) && filename.match?(/\A[a-zA-Z0-9_-]+\.(jpg|webp)\z/)
      render plain: "Invalid slug or filename", status: :bad_request
      return
    end

    safe_slug = Pathname.new(slug).cleanpath.to_s
    safe_filename = Pathname.new(filename).cleanpath.to_s

    file_path = Rails.root.join("persistent_disk", "cats", safe_slug, "photos", safe_filename)

    unless file_path.realpath.to_s.start_with?(Rails.root.join("persistent_disk", "cats").to_s)
      render plain: "Invalid file path", status: :bad_request
      return
    end

    if File.exist?(file_path)
      send_file file_path, disposition: "inline"
    else
      render plain: "File not found", status: :not_found
    end
  end
end
