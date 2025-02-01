require 'rails_helper'

RSpec.describe Rack::Attack do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  let(:limit_period) { 1.minute }

  describe "throttling" do
    before do
      # Clear any throttle data before each test
      Rack::Attack.cache.store.clear
    end

    describe "POST /log_in" do
      it "allows requests under the limit" do
        29.times do
          post "/log_in"
          expect(last_response.status).not_to eq(429)
        end
      end

      it "throttles requests over the limit" do
        31.times do |i|
          post "/log_in"

          if i >= 30
            expect(last_response.status).to eq(429)
            expect(last_response.headers["Content-Type"]).to eq("application/json")
            expect(last_response.headers).to include("Retry-After")

            response_body = JSON.parse(last_response.body)
            expect(response_body["outcome"]).to eq("failed")
            expect(response_body["errors"]).to include("Too many login attempts. You'd better give it a minute.")
          end
        end
      end
    end

    describe "POST /set_password" do
      it "allows requests under the limit" do
        9.times do
          post "/set_password"
          expect(last_response.status).not_to eq(429)
        end
      end

      it "throttles requests over the limit" do
        11.times do |i|
          post "/set_password"

          if i >= 10
            expect(last_response.status).to eq(429)
            expect(last_response.headers["Content-Type"]).to eq("application/json")
            expect(last_response.headers).to include("Retry-After")

            response_body = JSON.parse(last_response.body)
            expect(response_body["outcome"]).to eq("failed")
            expect(response_body["errors"]).to include("For security reasons, please wait a minute before trying again.")
          end
        end
      end
    end

    describe "throttle expiration" do
      it "allows requests again after the throttle period" do
        31.times { post "/log_in" }
        expect(last_response.status).to eq(429)

        Timecop.travel(limit_period + 1.second) do
          post "/log_in"
          expect(last_response.status).not_to eq(429)
        end
      end
    end
  end
end
