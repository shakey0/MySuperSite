class RedisTestController < ApplicationController
  def ping
    if $redis.ping == "PONG"
      render plain: "PONG"
    else
      render plain: "FAILED"
    end
  rescue => e
    render plain: "FAILED: #{e.message}"
  end
end
