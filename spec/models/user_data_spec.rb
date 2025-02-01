require 'rails_helper'

RSpec.describe UserData do
  let(:dynamodb_client) { instance_double(Aws::DynamoDB::Client) }
  
  let(:user_data) do
    {
      "id" => "123abc",
      "name" => "Test User",
      "email" => "test@example.com",
      "password" => BCrypt::Password.create("password123"),
      "active_sessions" => [],
      "preferences" => {},
      "permissions" => {},
      "last_login" => Time.now.utc.to_s
    }
  end

  before do
    allow(UserData).to receive(:get_dymamo_db_client).and_return(dynamodb_client)
    allow($redis).to receive(:get)
    allow($redis).to receive(:set)
  end

  describe '.get_user_by_id' do
    context 'when user is in Redis cache' do
      before do
        cached_user = user_data.except("password")
        allow($redis).to receive(:get).with("user:123abc").and_return(cached_user.to_json)
        allow(dynamodb_client).to receive(:get_item)
      end

      it 'returns user from cache' do
        result = UserData.get_user_by_id("123abc")
        expect(result).to eq(JSON.parse(user_data.except("password").to_json))
        expect(dynamodb_client).not_to have_received(:get_item)
      end
    end

    context 'when user is not in Redis cache' do
      let(:dynamodb_response) { instance_double(Aws::DynamoDB::Types::GetItemOutput, item: user_data) }

      before do
        allow($redis).to receive(:get).with("user:123abc").and_return(nil)
        allow(dynamodb_client).to receive(:get_item).and_return(dynamodb_response)
      end

      it 'fetches user from DynamoDB and caches it' do
        expect($redis).to receive(:set).with(
          "user:123abc",
          user_data.except("password").to_json,
          ex: 1.hour
        )

        result = UserData.get_user_by_id("123abc")
        expect(result).to eq(user_data.except("password"))
      end
    end
  end

  describe '.get_user_by_email' do
    let(:query_params) do
      {
        table_name: "users",
        index_name: "EmailIndex",
        key_condition_expression: "email = :email",
        expression_attribute_values: {
          ":email" => "test@example.com"
        }
      }
    end

    let(:dynamodb_response) { instance_double(Aws::DynamoDB::Types::QueryOutput, items: [user_data]) }

    before do
      allow(dynamodb_client).to receive(:query).and_return(dynamodb_response)
    end

    it 'queries DynamoDB using email index' do
      result = UserData.get_user_by_email("test@example.com")
      expect(dynamodb_client).to have_received(:query).with(query_params)
      expect(result).to eq(user_data)
    end

    context 'when no user is found' do
      let(:dynamodb_response) { instance_double(Aws::DynamoDB::Types::QueryOutput, items: []) }

      it 'returns nil' do
        result = UserData.get_user_by_email("nonexistent@example.com")
        expect(result).to be_nil
      end
    end
  end

  describe '.update_user_sessions' do
    let(:update_params) do
      {
        table_name: "users",
        key: {
          "id" => "123abc"
        },
        update_expression: "SET active_sessions = :sessions, last_login = :last_login",
        expression_attribute_values: {
          ":sessions" => user_data["active_sessions"],
          ":last_login" => kind_of(String)
        },
        return_values: "ALL_NEW"
      }
    end

    let(:dynamodb_response) do
      instance_double(Aws::DynamoDB::Types::UpdateItemOutput, attributes: user_data)
    end

    before do
      allow(dynamodb_client).to receive(:update_item).and_return(dynamodb_response)
      allow(Time).to receive_message_chain(:now, :utc, :to_s).and_return("2025-02-01 00:00:00 UTC")
    end

    it 'updates user sessions and last login time' do
      result = UserData.update_user_sessions(user_data)
      expect(dynamodb_client).to have_received(:update_item).with(update_params)
      expect(result).to eq(user_data.except("password"))
    end

    it 'caches the updated user data' do
      expect($redis).to receive(:set).with(
        "user:123abc",
        user_data.except("password").to_json,
        ex: 1.hour
      )
      UserData.update_user_sessions(user_data)
    end
  end

  describe '.create_user' do
    before do
      allow(SecureRandom).to receive(:alphanumeric).with(9).and_return("123abc")
      allow(BCrypt::Password).to receive(:create).and_return("hashed_password")
      allow(dynamodb_client).to receive(:put_item)
    end

    let(:expected_params) do
      {
        table_name: "users",
        item: {
          "id" => "123abc",
          "name" => "New User",
          "email" => "new@example.com",
          "password" => "hashed_password",
          "active_sessions" => [],
          "preferences" => {},
          "permissions" => {}
        }
      }
    end

    it 'creates a new user in DynamoDB' do
      result = UserData.create_user("New User", "new@example.com", "password123")
      expect(dynamodb_client).to have_received(:put_item).with(expected_params)
      expect(result).to be true
    end
  end

  describe '.update_user_password' do
    before do
      allow(BCrypt::Password).to receive(:create).and_return("new_hashed_password")
      allow(dynamodb_client).to receive(:update_item)
    end

    let(:expected_params) do
      {
        table_name: "users",
        key: {
          "id" => "123abc"
        },
        update_expression: "SET password = :password",
        expression_attribute_values: {
          ":password" => "new_hashed_password"
        }
      }
    end

    it 'updates user password in DynamoDB' do
      result = UserData.update_user_password(user_data, "newpassword123")
      expect(dynamodb_client).to have_received(:update_item).with(expected_params)
      expect(result).to be true
    end
  end

  describe '.cache_user' do
    it 'caches user data without password' do
      expect($redis).to receive(:set).with(
        "user:123abc",
        user_data.except("password").to_json,
        ex: 1.hour
      )
      
      result = UserData.cache_user(user_data.dup)
      expect(result).to eq(user_data.except("password"))
    end
  end
end
