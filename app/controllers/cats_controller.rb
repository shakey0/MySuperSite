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

    unless slug.match?(/\A[a-z_]+\z/) && filename.match?(/\A[a-zA-Z0-9_-]+\.(jpg|webp)\z/) # REMOVE jpg LATER
      render plain: "Invalid slug or filename", status: :bad_request
      return
    end

    folders = registered_cat_list
    folder = folders.find { |f| f == slug }
    unless folder
      render plain: "Cat not found", status: :not_found
      return
    end

    photos = photos_list_for_cat(folder)
    photo = photos.find { |p| p == filename }
    unless photo
      render plain: "Photo not found", status: :not_found
      return
    end

    file_path = Rails.root.join("persistent_disk", "cats", folder, "photos", photo)

    if File.exist?(file_path)
      send_file file_path, disposition: "inline"
    else
      render plain: "File not found", status: :not_found
    end
  end

  private

  def registered_cat_list
    folders = $redis.get("registered_cat_folders")
    if folders
      return JSON.parse(folders)
    end

    base_path = Rails.root.join("persistent_disk", "cats")
    folders = Dir.entries(base_path).select do |entry|
      File.directory?(File.join(base_path, entry)) && !(entry == "." || entry == "..")
    end

    $redis.setex("registered_cat_folders", 10.minutes, folders.to_json)
    folders
  end

  def photos_list_for_cat(cat)
    photos_list = $redis.get("photos_list_#{cat}")
    if photos_list
      return JSON.parse(photos_list)
    end

    base_path = Rails.root.join("persistent_disk", "cats", cat, "photos")
    photos_list = Dir.entries(base_path).select do |entry|
      entry.match?(/\A[a-zA-Z0-9_-]+\.(jpg|webp)\z/) # REMOVE jpg LATER
    end

    $redis.setex("photos_list_#{cat}", 10.minutes, photos_list.to_json)
    photos_list
  end
end
