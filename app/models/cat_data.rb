class CatData
  def self.load_all(cat, lang = "en")
    file_path = data_path(cat, lang)
    return nil unless File.exist?(file_path)

    begin
      file_data = JSON.parse(File.read(file_path))
    rescue JSON::ParserError => e
      return nil
    end

    born_on = file_data["born_on"]
    born_on_date = Time.parse(born_on)
    born_on_formatted = lang == "cn" ? born_on_date.strftime("%Y年%m月%d日") : born_on_date.strftime("%d#{born_on_date.day.ordinal} %B %Y")
    passed_in = file_data["passed_in"]
    if passed_in
      age_in_human_years = (Time.parse(passed_in) - born_on_date) / 60 / 60 / 24 / 365
      passed_in_date = Time.parse(passed_in)
      file_data["passed_in"] = lang == "cn" ? passed_in_date.strftime("%Y年%m月") : passed_in_date.strftime("%B %Y")
    else
      age_in_human_years = (Time.now - born_on_date) / 60 / 60 / 24 / 365
      file_data.delete("passed_in")
    end

    file_data["born_on"] = born_on_formatted
    age_in_cat_years = human_to_cat_years(age_in_human_years)
    file_data["age_in_cat_years"] = age_in_cat_years.to_i

    file_data
  end

  def self.data_path(cat, lang)
    filename = lang == "cn" ? "#{cat}__cn__.json" : "#{cat}.json"
    Rails.root.join("persistent_disk", "cats", cat, filename)
  end

  def self.human_to_cat_years(human_years)
    return 0 if human_years <= 0

    case human_years
    when 0...1
      # Scale the first year (15 cat years per full year)
      15 * human_years
    when 1...2
      # First year is 15, partial second year scaled from 9
      15 + (human_years - 1) * 9
    else
      # First 2 years are 15 + 9 = 24, remaining years are 4 per year
      24 + (human_years - 2) * 4
    end
  end
end
