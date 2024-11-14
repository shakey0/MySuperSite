class MUserData
  def self.load(secret)
    # Check if the secret contains only alphanumeric characters
    return {} unless secret =~ /\A[a-zA-Z0-9]+\z/

    file_path = Rails.root.join("persistent_disk", "m", "#{secret}.json")
    if File.exist?(file_path)
      file_content = File.read(file_path)
      JSON.parse(file_content)
    else
      {}
    end
  end

  def self.save(secret, user_data, message)
    begin
      # Get the convo within the last hour
      convos = user_data["convos"] || []
      convo = convos.find { |c| Time.parse(c["start_time"]) > 1.hour.ago || !c["seen"] } || {}
      if convo.present?
        convo["messages"] << { "message" => message, "direction" => "from" }
      else
        convos << { "messages" => [ { "message" => message, "direction" => "from" } ], "start_time" => Time.now.strftime("%Y-%m-%d %H:%M:%S.%6N"), "seen" => false }
      end
      user_data["convos"] = convos

      file_path = Rails.root.join("persistent_disk", "m", "#{secret}.json")
      File.write(file_path, user_data.to_json)

      true
    rescue StandardError => e
      Rails.logger.error("Failed to save user data: #{e.message}")

      false
    end
  end
end
