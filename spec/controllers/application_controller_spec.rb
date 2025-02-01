require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  before do
    class_double("UserData").as_stubbed_const
    allow(UserData).to receive(:get_user_by_id)
    allow(UserData).to receive(:update_user_sessions)
  end

  let(:valid_user) do
    {
      "id" => "123",
      "email" => "test@example.com",
      "active_sessions" => [],
      "last_login" => Time.now.utc.to_s
    }
  end

  describe '#authenticate_user!' do
    controller do
      before_action :authenticate_user!

      def index
        render plain: 'authenticated'
      end
    end

    context 'when user is not authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(nil)
      end

      it 'redirects to brain_auth_path for HTML requests' do # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
        get :index
        expect(response).to redirect_to(brain_auth_path) # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
      end

      it 'returns unauthorized for JSON requests' do
        request.accept = 'application/json'
        request.headers['CONTENT_TYPE'] = 'application/json'
        get :index
        expect(response.status).to eq(401)
        expect(JSON.parse(response.body)).to include('error' => 'Unauthorized access')
      end
    end

    context 'when user is authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(valid_user)
      end

      it 'allows access to the action' do
        get :index
        expect(response.body).to eq('authenticated')
      end
    end
  end

  describe '#require_no_user!' do
    controller do
      before_action :require_no_user!

      def index
        render plain: 'no user required'
      end
    end

    context 'when user is authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(valid_user)
      end

      it 'redirects to brain_index_path for HTML requests' do # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
        get :index
        expect(response).to redirect_to(brain_index_path) # !!!!! This will need to direct dynamically to the correct path in the future !!!!!
      end

      it 'returns forbidden for JSON requests' do
        request.accept = 'application/json'
        request.headers['CONTENT_TYPE'] = 'application/json'
        get :index
        expect(response.status).to eq(403)
        expect(JSON.parse(response.body)).to include('error' => 'Access not permitted for authenticated users')
      end
    end

    context 'when user is not authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(nil)
      end

      it 'allows access to the action' do
        get :index
        expect(response.body).to eq('no user required')
      end
    end
  end

  describe '#current_user' do
    let(:session_token) { SecureRandom.alphanumeric(64) }
    let(:hashed_token) { BCrypt::Password.create(session_token) }

    let(:user_with_session) do
      valid_user.merge(
        "active_sessions" => [
          {
            "key" => hashed_token,
            "created_at" => Time.now.iso8601
          }
        ]
      )
    end

    before do
      allow(UserData).to receive(:get_user_by_id).with("123").and_return(user_with_session)
      allow(UserData).to receive(:update_user_sessions).and_return(true)
    end

    context 'with valid session cookie' do
      before do
        session_data = {
          user_id: "123",
          session_token: session_token
        }

        controller.send(:cookies).signed[:user_session] = {
          value: session_data.to_json,
          expires: 14.days.from_now,
          httponly: true
        }
      end

      it 'returns the user' do
        result = controller.send(:current_user)
        expect(result).to eq(user_with_session)
      end

      context 'when session is older than 12 hours' do
        let(:user_with_old_session) do
          valid_user.merge(
            "active_sessions" => [
              {
                "key" => hashed_token,
                "created_at" => 13.hours.ago.iso8601
              }
            ]
          )
        end

        before do
          allow(UserData).to receive(:get_user_by_id).with("123").and_return(user_with_old_session)
        end

        it 'refreshes the session token' do
          expect(UserData).to receive(:update_user_sessions)
          controller.send(:current_user)
          expect(controller.send(:cookies).signed[:user_session]).to be_present
        end
      end
    end

    context 'with invalid session cookie' do
      before do
        controller.send(:cookies).signed[:user_session] = "invalid json"
      end

      it 'returns nil' do
        expect(controller.send(:current_user)).to be_nil
      end
    end

    context 'with expired session' do
      let(:user_with_expired_session) do
        valid_user.merge(
          "active_sessions" => [
            {
              "key" => hashed_token,
              "created_at" => 15.days.ago.iso8601
            }
          ]
        )
      end

      before do
        allow(UserData).to receive(:get_user_by_id).with("123").and_return(user_with_expired_session)
        session_data = {
          user_id: "123",
          session_token: session_token
        }
        controller.send(:cookies).signed[:user_session] = {
          value: session_data.to_json,
          expires: 14.days.from_now
        }
      end

      it 'returns nil and cleans up expired sessions' do
        expect(UserData).to receive(:update_user_sessions)
        expect(controller.send(:current_user)).to be_nil
      end
    end
  end

  describe '#set_user_session_cookie' do
    before do
      allow(SecureRandom).to receive(:alphanumeric).and_return('fake_token')
      allow(BCrypt::Password).to receive(:create).and_return('hashed_fake_token')
    end

    it 'sets a signed cookie with the correct options' do
      controller.send(:set_user_session_cookie, valid_user)

      cookie = controller.send(:cookies).signed[:user_session]
      cookie_data = JSON.parse(cookie)

      expect(cookie_data['user_id']).to eq('123')
      expect(cookie_data['session_token']).to eq('fake_token')
    end

    it 'updates user sessions in the database' do
      expect(UserData).to receive(:update_user_sessions).with(kind_of(Hash))
      controller.send(:set_user_session_cookie, valid_user)
    end

    context 'when user has logged in' do
      it 'updates last_login timestamp' do
        expect(UserData).to receive(:update_user_sessions) do |user|
          expect(Time.parse(user['last_login'])).to be_within(1.second).of(Time.now.utc)
        end

        controller.send(:set_user_session_cookie, valid_user, true)
      end
    end
  end
end
