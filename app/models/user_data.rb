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
      user_data = JSON.parse(user_data)
    end

    user_data
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

    response.items.first
  end

  def self.update_user(user)
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

    response.attributes
  end

  def self.cache_user(user)
    user.delete("password")
    $redis.set("user:#{user["id"]}", user.to_json, ex: 1.hour)
  end

  def self.get_dymamo_db_client
    Aws::DynamoDB::Client.new(
      region: "eu-west-2",
      endpoint: "http://localhost:8000"
    )
  end
end
