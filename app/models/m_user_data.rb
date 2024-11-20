class MUserData
  def self.load(secret)
    return {} unless secret =~ /\A[a-zA-Z0-9]+\z/

    redis_key = "convo:#{secret}"
    convo = $redis.get(redis_key)
    if convo.nil?
      convo = load_from_json(secret)
      return nil if convo.nil?
      $redis.setex(redis_key, 10.seconds, convo.to_json)
    else
      $redis.expire(redis_key, 10.seconds)
    end

    convo = JSON.parse(convo) if convo.is_a?(String)
    convo || {}
  end

  def self.load_from_json(secret)
    user_data = load_all(secret)
    return nil if user_data.nil?
    current_convo = user_data["convos"].find do |convo|
      Time.parse(convo["start_time"]) > 1.hour.ago || !convo["seen"]
    end

    current_convo || {}
  end

  def self.load_all(secret)
    file_path = path(secret)
    return nil unless File.exist?(file_path)

    JSON.parse(File.read(file_path))
  end

  def self.save(secret, message, direction = "from")
    return {} unless secret =~ /\A[a-zA-Z0-9]+\z/

    begin
      user_data = load_all(secret)
      convos = user_data["convos"]
      convo = convos.find { |c| Time.parse(c["start_time"]) > 1.hour.ago || !c["seen"] }
      if convo
        convo["messages"] << { "message" => message, "direction" => direction }
        if direction == "to" && !convo["seen"]
          convo["start_time"] = Time.now.utc.strftime("%Y-%m-%d %H:%M:%S.%6N")
          convo["seen"] = true
        end
      else
        convo = {
          "messages" => [ { "message" => message, "direction" => direction } ],
          "start_time" => Time.now.utc.strftime("%Y-%m-%d %H:%M:%S.%6N"),
          "seen" => (direction == "to")
        }
        convos << convo
      end

      $redis.setex("convo:#{secret}", 10.seconds, convo.to_json)

      file_path = path(secret)
      File.write(file_path, user_data.to_json)

      true
    rescue StandardError => e
      Rails.logger.error("Failed to save user data: #{e.message}")

      false
    end
  end

  def self.collect_filenames
    Dir.glob(Rails.root.join("persistent_disk", "m", "*.json")).map { |f| File.basename(f, ".json") }
  end

  def self.path(secret)
    Rails.root.join("persistent_disk", "m", "#{secret}.json")
  end
end
