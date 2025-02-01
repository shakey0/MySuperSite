require 'rails_helper'

RSpec.describe AuthApiController, type: :controller do
  let(:valid_user) do
    {
      "id" => "123",
      "name" => "Test User",
      "email" => "test@example.com",
      "password" => BCrypt::Password.create("password123"),
      "active_sessions" => [],
      "last_login" => Time.now.utc.to_s
    }
  end

  before do
    class_double("UserData").as_stubbed_const
    allow(UserData).to receive(:get_user_by_email)
    allow(UserData).to receive(:get_user_by_id)
    allow(UserData).to receive(:update_user_sessions)
    allow(UserData).to receive(:update_user_password)
    allow(UserData).to receive(:create_user)

    # Mock Redis
    allow($redis).to receive(:set)
    allow($redis).to receive(:get)
    allow($redis).to receive(:del)

    # Mock ActionMailer
    allow(UserMailer).to receive_message_chain(:welcome_email, :deliver_now)
  end

  describe 'POST #log_in' do
    let(:valid_params) do
      {
        auth_api: {
          email: "test@example.com",
          password: "password123"
        }
      }
    end

    context 'with valid credentials' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("test@example.com").and_return(valid_user)
        allow(BCrypt::Password).to receive(:new).and_return(BCrypt::Password.new(valid_user["password"]))
      end

      it 'returns success and sets session cookie' do
        post :log_in, params: valid_params
        expect(JSON.parse(response.body)["outcome"]).to eq("success_and_redirect_to_root")
        expect(cookies.signed[:user_session]).to be_present
      end
    end

    context 'with invalid credentials' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("test@example.com").and_return(nil)
      end

      it 'returns failure message' do
        post :log_in, params: valid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ "Invalid email or password" ]
        )
      end
    end
  end

  describe 'POST #log_out' do
    let(:session_token) { SecureRandom.alphanumeric(64) }

    before do
      allow(controller).to receive(:authenticate_user!).and_return(true)
      cookies.signed[:user_session] = {
        value: { user_id: "123", session_token: session_token }.to_json
      }
      allow(UserData).to receive(:get_user_by_id).with("123").and_return(valid_user)
    end

    it 'logs out user and clears session' do
      expect($redis).to receive(:del).with("user:123")
      post :log_out
      expect(cookies[:user_session]).to be_nil
      expect(JSON.parse(response.body)["outcome"]).to eq("success_and_redirect_to_auth")
    end
  end

  describe 'POST #sign_up' do
    let(:valid_params) do
      {
        auth_api: {
          name: "New User",
          email: "new@example.com",
          from_section: "brain"
        }
      }
    end

    context 'with valid parameters' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("new@example.com").and_return(nil)
        allow($redis).to receive(:set).with("email:new@example.com", "1", nx: true, ex: 30).and_return(true)
        allow(SecureRandom).to receive(:alphanumeric).and_return("random_token")
      end

      it 'initiates sign up process and sends email' do
        expect(UserMailer).to receive_message_chain(:welcome_email, :deliver_now)
        post :sign_up, params: valid_params
        expect(JSON.parse(response.body)["outcome"]).to eq("success")
      end
    end

    context 'with invalid email format' do
      let(:invalid_params) do
        { auth_api: { name: "New User", email: "invalid-email", from_section: "brain" } }
      end

      it 'returns error message' do
        post :sign_up, params: invalid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ "Invalid email address." ]
        )
      end
    end

    context 'with existing email' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("new@example.com").and_return(valid_user)
      end

      it 'returns error message' do
        post :sign_up, params: valid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ "This email is already taken." ]
        )
      end
    end
  end

  describe 'POST #set_password' do
    let(:valid_params) do
      {
        auth_api: {
          auth_token: "valid_token",
          password: "newpassword123"
        }
      }
    end

    let(:cached_user_data) do
      {
        "name" => "Test User",
        "email" => "test@example.com"
      }.to_json
    end

    context 'with valid auth token' do
      before do
        allow($redis).to receive(:get).with("auth_token_b:valid_token").and_return(cached_user_data)
        allow($redis).to receive(:get).with("email_for_auth:test@example.com").and_return(nil)
      end

      it 'creates new user and sets password' do
        expect(UserData).to receive(:create_user)
        post :set_password, params: valid_params
        expect(JSON.parse(response.body)["outcome"]).to eq("success_and_redirect_to_auth")
      end
    end

    context 'with invalid password length' do
      let(:invalid_params) do
        { auth_api: { auth_token: "valid_token", password: "short" } }
      end

      it 'returns error message' do
        post :set_password, params: invalid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ "Password must be at least 8 characters." ]
        )
      end
    end

    context 'with expired auth token' do
      before do
        allow($redis).to receive(:get).with("auth_token_b:valid_token").and_return(nil)
      end

      it 'returns expired token message' do
        post :set_password, params: valid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed_and_redirect_to_auth",
          "message" => "This link has timed out. Please request a new one."
        )
      end
    end
  end

  describe 'POST #forgot_password' do
    let(:valid_params) do
      {
        auth_api: {
          email: "test@example.com",
          from_section: "brain"
        }
      }
    end

    context 'with existing user' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("test@example.com").and_return(valid_user)
        allow($redis).to receive(:set).with("email:test@example.com", "1", nx: true, ex: 30).and_return(true)
        allow($redis).to receive(:get).with("email_for_auth:test@example.com").and_return(nil)
      end

      it 'sends reset password email' do
        expect(UserMailer).to receive_message_chain(:welcome_email, :deliver_now)
        post :forgot_password, params: valid_params
        expect(JSON.parse(response.body)["outcome"]).to eq("success")
      end
    end

    context 'with non-existent user' do
      before do
        allow(UserData).to receive(:get_user_by_email).with("test@example.com").and_return(nil)
        allow($redis).to receive(:set).with("email:test@example.com", "1", nx: true, ex: 30).and_return(true)
      end

      it 'returns universal message' do
        post :forgot_password, params: valid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ include("A password reset link has been emailed to you") ]
        )
      end
    end

    context 'when email is rate limited' do
      before do
        allow($redis).to receive(:get).with("email_for_auth:test@example.com").and_return("1")
      end

      it 'returns rate limit message' do
        post :forgot_password, params: valid_params
        expect(JSON.parse(response.body)).to include(
          "outcome" => "failed",
          "errors" => [ include("You have already set or reset your password within the last 10 minutes") ]
        )
      end
    end
  end
end
