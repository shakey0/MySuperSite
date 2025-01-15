class UserData
  def self.get_user_by_id(id)
    user_data = $redis.get("user:#{id}")
    if user_data.nil?
      params = {
        table_name: 'users',
        key: {
          'id' => id
        }
      }
      response = get_dymamo_db_client.get_item(params)
      user_data = response.item.to_json

      $redis.set("user:#{id}", user_data, ex: 1.hour)
    end

    JSON.parse(user_data)
  end

  # Query the users table using the GSI
  def self.query_users_by_secret(secret_value)
    params = {
      table_name: 'users',
      index_name: 'Secret1Index', # The name of the GSI
      key_condition_expression: 'secret_1 = :secret',
      expression_attribute_values: {
        ':secret' => secret_value
      }
    }
    response = get_dymamo_db_client.query(params)
    response.items
  end

  def self.update_user(user)
    params = {
      table_name: 'users',
      key: {
        'id' => user["id"]  # The primary key
      },
      update_expression: 'SET active_sessions = :sessions',
      expression_attribute_values: {
        ':sessions' => user["active_sessions"]
      },
      return_values: 'ALL_NEW'  # This will return the updated item
    }
    response = get_dymamo_db_client.update_item(params)

    $redis.set("user:#{user["id"]}", user.to_json, ex: 1.hour)

    response.attributes
  end

  def self.get_dymamo_db_client
    Aws::DynamoDB::Client.new(
      region: 'eu-west-2',
      endpoint: 'http://localhost:8000'
    )
  end
end
