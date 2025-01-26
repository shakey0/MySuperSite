class UserData
  def self.get_user_by_id(id)
    user_data = $redis.get("user:#{id}")
    if user_data.nil?
      params = {
        table_name: "users",
        key: {
          "id" => id
        }
      }
      response = get_dymamo_db_client.get_item(params)
      user_data = response.item

      cache_user(user_data)
    else
      JSON.parse(user_data)
    end
  end

  # Query the users table using the GSI
  def self.get_user_by_email(email)
    params = {
      table_name: "users",
      index_name: "EmailIndex",
      key_condition_expression: "email = :email",
      expression_attribute_values: {
        ":email" => email
      }
    }
    response = get_dymamo_db_client.query(params)

    response.items.first # Return the first user (with the password included (only in this case))
  end

  def self.update_user_sessions(user)
    params = {
      table_name: "users",
      key: {
        "id" => user["id"]  # The primary key
      },
      update_expression: "SET active_sessions = :sessions",
      expression_attribute_values: {
        ":sessions" => user["active_sessions"]
      },
      return_values: "ALL_NEW"  # This will return the updated item
    }
    response = get_dymamo_db_client.update_item(params)

    cache_user(response.attributes)
  end

  def self.cache_user(user)
    user.delete("password")
    $redis.set("user:#{user["id"]}", user.to_json, ex: 1.hour)
    user
  end

  def self.get_dymamo_db_client
    Aws::DynamoDB::Client.new(
      region: "eu-west-2",
      endpoint: "http://localhost:8000"
    )
  end

  def self.create_user(name, email, password)
    user = {
      "id" => SecureRandom.alphanumeric(9),
      "name" => name,
      "email" => email,
      "password" => BCrypt::Password.create(password),
      "active_sessions" => [],
      "preferences" => {},
      "permissions" => {}
    }

    params = {
      table_name: "users",
      item: user
    }
    get_dymamo_db_client.put_item(params)

    true
  end
end
