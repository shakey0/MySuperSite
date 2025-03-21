class FaviconsController < ApplicationController
  FAVICONS = %w[cat_favicon default_favicon].freeze

  def show
    favicon_name = params[:name]

    favicon = FAVICONS.find { |name| name == favicon_name }

    unless favicon
      return render plain: "Favicon not found", status: :not_found
    end

    file_path = Rails.root.join("app", "assets", "favicons", favicon + ".webp")

    if File.exist?(file_path)
      response.headers["Cache-Control"] = "public, max-age=#{1.year.to_i}, immutable"

      send_file file_path,
                disposition: "inline",
                type: "image/webp",
                cache_control: nil
    else
      render plain: "Favicon not found", status: :not_found
    end
  end
end
