module ApplicationHelper
  def section_favicon
    case controller_name
    when "cats"
      "/favicons/cat_favicon"
    else
      "/favicons/default_favicon"
    end
  end
end
