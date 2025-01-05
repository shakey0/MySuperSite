class CatsController < ApplicationController
  def index
  end

  def show
    # Check if the cookies are already set
    cookies_set = cookies[:CloudFront_Signature] && cookies[:CloudFront_Key_Pair_Id] && cookies[:CloudFront_Policy]
    unless cookies_set
      cloud_front_cookie_service = CloudFrontCookieService.new(key_pair_id: "CATS_MEDIA_ID", private_key_path: "CATS_MEDIA_KEY")
      signed_cookies = cloud_front_cookie_service.generate_signed_cookies("https://cats.shakey0.co.uk/*")

      signed_cookies.each do |cookie_string|
        name, value = cookie_string.split("=", 2)
        cookies[name] = value
      end
    end
  end

  def data
    slug = params[:slug]
    lang = params[:lang] || "en"

    cat_data = CatData.load_all(slug, lang)
    render json: cat_data
  end

  def photo
    slug = params[:slug] || "default"
    filename = params[:filename] || "default.webp"

    unless slug.match?(/\A[a-z_]+\z/) && filename.match?(/\A[a-zA-Z0-9_-]+\.(webp)\z/)
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
      response.headers["Cache-Control"] = "public, max-age=#{1.year.to_i}, immutable"

      send_file file_path,
                disposition: "inline",
                type: "image/webp",
                cache_control: nil
    else
      render plain: "File not found", status: :not_found
    end
  end

  def video
    slug = params[:slug] || "default"
    filename = params[:filename] || "default.mp4"

    unless slug.match?(/\A[a-z_]+\z/) && filename.match?(/\A[a-zA-Z0-9_-]+\.(mp4)\z/)
      render plain: "Invalid slug or filename", status: :bad_request
      return
    end

    folders = registered_cat_list
    folder = folders.find { |f| f == slug }
    unless folder
      render plain: "Cat not found", status: :not_found
      return
    end

    videos = videos_list_for_cat(folder)
    video = videos.find { |v| v == filename }
    unless video
      render plain: "Video not found", status: :not_found
      return
    end

    file_path = Rails.root.join("persistent_disk", "cats", folder, "videos", video)

    if File.exist?(file_path)
      response.headers["Cache-Control"] = "public, max-age=#{1.year.to_i}, immutable"

      send_file file_path,
                disposition: "inline",
                type: "video/mp4",
                cache_control: nil
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
      entry.match?(/\A[a-zA-Z0-9_-]+\.(webp)\z/)
    end

    $redis.setex("photos_list_#{cat}", 10.minutes, photos_list.to_json)
    photos_list
  end

  def videos_list_for_cat(cat)
    videos_list = $redis.get("videos_list_#{cat}")
    if videos_list
      return JSON.parse(videos_list)
    end

    base_path = Rails.root.join("persistent_disk", "cats", cat, "videos")
    videos_list = Dir.entries(base_path).select do |entry|
      entry.match?(/\A[a-zA-Z0-9_-]+\.(mp4)\z/)
    end

    $redis.setex("videos_list_#{cat}", 10.minutes, videos_list.to_json)
    videos_list
  end
end
