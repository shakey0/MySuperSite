class CatData
  def self.load_all(cat, lang = "en")
    file_path = data_path(cat, lang)
    return nil unless File.exist?(file_path)

    begin
      file_data = FileLockService.read_file_with_lock(file_path)
    rescue => e
      puts "Error occurred: #{e.class} - #{e.message}"
      return nil
    end

    if file_data.nil?
      if lang != "en"
        return load_all(cat, "en")
      else
        return nil
      end
    end

    born_on = file_data["born_on"]
    born_on_dates = born_on.split(",")
    parsed_born_on_dates = born_on_dates.map do |date|
      Time.parse(date)
    end

    passed_in = file_data["passed_in"]
    if passed_in
      ages_in_human_years = parsed_born_on_dates.map do |born_on_date|
        (Time.parse(passed_in) - born_on_date) / 60 / 60 / 24 / 365
      end

      passed_in_dates = passed_in.split(",")
      parsed_passed_in_dates = passed_in_dates.map do |date|
        Time.parse(date)
      end
      formatted_passed_in_dates = parsed_passed_in_dates.map do |date|
        lang == "cn" ? date.strftime("%Y年%m月") : date.strftime("%B %Y")
      end
      file_data["passed_in"] = formatted_passed_in_dates.join(" & ")
    else
      ages_in_human_years = parsed_born_on_dates.map do |born_on_date|
        (Time.now - born_on_date) / 60 / 60 / 24 / 365
      end

      file_data.delete("passed_in")
    end

    ages_in_cat_years = ages_in_human_years.map do |age_in_human_years|
      human_to_cat_years(age_in_human_years).to_i
    end
    file_data["age_in_cat_years"] = ages_in_cat_years.join(" & ")

    formatted_born_on_dates = parsed_born_on_dates.map do |date|
      lang == "cn" ? date.strftime("%Y年%m月%d日") : date.strftime("%e#{date.day.ordinal} %B %Y")
    end
    file_data["born_on"] = formatted_born_on_dates.join(" & ")

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
