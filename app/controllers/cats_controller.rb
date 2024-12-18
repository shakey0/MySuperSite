class CatsController < ApplicationController
  def index
  end

  def show
  end

  def data
    slug = params[:slug]
    lang = params[:lang] || "en"

    cat_data = CatData.load_all(slug, lang)

    # ----------------------------
    # TRANSLATIONS EXPERIMENT

    # strings_to_translate = {
    #   known_as: cat_data["known_as"],
    #   likes_eating: cat_data["likes_eating"],
    #   likes_to: cat_data["likes_to"],
    #   story: cat_data["story"]
    # }

    # service = CatTranslationService.new(ENV['OPENAI_API_KEY'])
    # translated_json = service.translate(strings_to_translate)

    # custom_logger = Logger.new(Rails.root.join('log', 'custom.log'))
    # custom_logger.info("Translated JSON: #{translated_json}")
    # ----------------------------

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
