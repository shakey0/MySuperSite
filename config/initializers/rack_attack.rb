Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(url: ENV["REDIS_URL"] || "redis://localhost:6379")

class Rack::Attack
  throttle("log_in", limit: 30, period: 1.minute) do |req|
    req.ip if req.path == "/log_in" && req.post?
  end

  throttle("set_password", limit: 10, period: 1.minute) do |req|
    req.ip if req.path == "/set_password" && req.post?
  end

  Rack::Attack.throttled_responder = lambda do |request|
    match_data = request.env["rack.attack.match_data"]
    now = match_data[:epoch_time]
    retry_after = match_data[:period] - (now % match_data[:period])

    throttle_key = request.env["rack.attack.matched"]
    response_message = case throttle_key
    when "log_in"
      "Too many login attempts. You'd better give it a minute."
    when "set_password"
      "For security reasons, please wait a minute before trying again."
    else
      "Too many requests. Please try again later."
    end

    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After" => retry_after.to_s
      },
      [ {
        outcome: "failed",
        errors: [ response_message ]
      }.to_json ]
    ]
  end
end
