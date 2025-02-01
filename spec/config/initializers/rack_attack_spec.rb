require 'rails_helper'

RSpec.describe Rack::Attack do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  let(:limit_period) { 1.minute }

  let(:headers) do
    {
      "CONTENT_TYPE" => "application/json",
      "ACCEPT" => "application/json",
      "HTTP_USER_AGENT" => "Mozilla/5.0",
      "REMOTE_ADDR" => "127.0.0.1"
    }
  end

  let(:login_params) do
    {
      auth_api: {
        email: "test@example.com",
        password: "password123"
      }
    }.to_json
  end

  let(:set_password_params) do
    {
      auth_api: {
        auth_token: "valid_token",
        password: "newpassword123"
      }
    }.to_json
  end

  describe "throttling" do
    before do
      puts "Redis URL: #{ENV['REDIS_URL']}"
      puts "Cache Store: #{Rack::Attack.cache.store.class}"
      Rack::Attack.cache.store.clear
    end

    describe "POST /log_in" do
      it "allows requests under the limit" do
        29.times do
          post "/log_in", login_params, headers
          puts "Response Status: #{last_response.status}" if last_response.status == 429
          expect(last_response.status).not_to eq(429)
        end
      end

      it "throttles requests over the limit" do
        40.times do |i|
          post "/log_in", login_params, headers

          if i >= 35
            puts "Response Status: #{last_response.status}"
            puts "Response Body: #{last_response.body}"
            puts "Response Headers: #{last_response.headers}"
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
      # Mock Redis for set_password endpoint
      before do
        allow($redis).to receive(:get).with(/auth_token:set_password_auth:.+/).and_return({ 
          "email" => "test@example.com", 
          "name" => "Test User" 
        }.to_json)
        allow($redis).to receive(:get).with(/auth_action_completed:.+/).and_return(nil)
        allow($redis).to receive(:del).with(/auth_token:set_password_auth:.+/).and_return(nil)
        allow($redis).to receive(:set).with(/auth_action_completed:.+/, "1", ex: 10 * 60).and_return(true)
      end

      it "allows requests under the limit" do
        9.times do |i|
          post "/set_password", set_password_params, headers
          puts "Response #{i} Status: #{last_response.status}" if last_response.status == 429
          expect(last_response.status).not_to eq(429)
        end
      end

      it "throttles requests over the limit" do
        20.times do |i|
          post "/set_password", set_password_params, headers

          if i >= 15
            puts "Response Status: #{last_response.status}"
            puts "Response Body: #{last_response.body}"
            expect(last_response.status).to eq(429), 
              "Expected 429, got #{last_response.status}. Response body: #{last_response.body}"
            expect(last_response.headers["Content-Type"]).to eq("application/json")
            expect(last_response.headers).to include("Retry-After")

            response_body = JSON.parse(last_response.body)
            expect(response_body["outcome"]).to eq("failed")
            expect(response_body["errors"]).to include(
              "For security reasons, please wait a minute before trying again."
            )
          end
        end
      end
    end

    describe "throttle expiration" do
      it "allows requests again after the throttle period" do
        31.times { post "/log_in", login_params, headers }
        expect(last_response.status).to eq(429)

        Timecop.travel(limit_period + 1.second) do
          post "/log_in", login_params, headers
          expect(last_response.status).not_to eq(429)
        end
      end
    end
  end
end
