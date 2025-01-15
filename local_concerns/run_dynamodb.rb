require 'open3'
require 'json'

def run_command(command)
  puts "Running: #{command}"
  stdout, stderr, status = Open3.capture3(command)
  if status.success?
    puts "Success: #{stdout}" unless stdout.strip.empty?
  else
    puts "Error: #{stderr}"
    exit(1)
  end
end

# Step 1: Start DynamoDB Local in a Docker container
run_command("docker run -d -p 8000:8000 amazon/dynamodb-local")
sleep 3

# Step 2: Create the `users` table with a GSI on `secret_1`
create_table_command = <<~CMD
  aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=secret_1,AttributeType=S \
    --key-schema \
      AttributeName=id,KeyType=HASH \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --global-secondary-indexes \
      '[{
        "IndexName": "Secret1Index",
        "KeySchema": [
          {"AttributeName": "secret_1", "KeyType": "HASH"}
        ],
        "Projection": {
          "ProjectionType": "ALL"
        },
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        }
      }]' \
    --endpoint-url http://localhost:8000
CMD
run_command(create_table_command)

# Step 3: Seed the `users` table with a sample user
user_data = {
  "id" => { "S" => "rJ3P02N1d" },
  "name" => { "S" => "Johnny Boy" },
  "secret_1" => { "S" => "blackwell" },
  "secret_2" => { "S" => "missgreen" },
  "secret_3" => { "S" => "tulleysfarm" },
  "active_sessions" => { "L" => [] }
}
seed_command = <<~CMD
  aws dynamodb put-item \
    --table-name users \
    --item '#{JSON.dump(user_data)}' \
    --endpoint-url http://localhost:8000
CMD
run_command(seed_command)

puts "DynamoDB Local setup and seeding complete!"
