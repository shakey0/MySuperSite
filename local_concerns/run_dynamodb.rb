require 'json'
require 'bcrypt'

# Force immediate output flushing
$stdout.sync = true
$stderr.sync = true

DYNAMO_CONTAINER_NAME = "dynamodb_local"

def ensure_cleanup
  # Create a detached cleanup script that will run even if this process is killed
  cleanup_script = "/tmp/dynamodb_cleanup.rb"
  File.write(cleanup_script, <<~RUBY)
    #!/usr/bin/env ruby
    system("docker stop #{DYNAMO_CONTAINER_NAME} 2>/dev/null")
    system("docker rm #{DYNAMO_CONTAINER_NAME} 2>/dev/null")
  RUBY
  
  File.chmod(0755, cleanup_script)
  # Run detached process that won't be killed by Foreman
  system("nohup #{cleanup_script} > /dev/null 2>&1 &")
end

# For immediate cleanup within this process
def cleanup
  puts "Starting cleanup..."
  system("docker stop #{DYNAMO_CONTAINER_NAME} 2>/dev/null")
  system("docker rm #{DYNAMO_CONTAINER_NAME} 2>/dev/null")
  puts "Cleanup complete."
end

# Register cleanup handlers
at_exit { cleanup }
Signal.trap("INT") { ensure_cleanup; exit }
Signal.trap("TERM") { ensure_cleanup; exit }

# Remove any existing container
system("docker rm -f #{DYNAMO_CONTAINER_NAME} 2>/dev/null")

puts "Starting DynamoDB Local..."

# Start DynamoDB container
unless system("docker run --name #{DYNAMO_CONTAINER_NAME} -d -p 8000:8000 amazon/dynamodb-local")
  puts "Failed to start DynamoDB container."
  exit(1)
end

puts "Waiting for DynamoDB to initialize..."
sleep 3

# Create users table
puts "Creating users table..."
create_table_cmd = <<~CMD
  aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=email,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --global-secondary-indexes '[{
      "IndexName": "EmailIndex",
      "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5, "WriteCapacityUnits": 5
      }
    }]' \
    --endpoint-url http://localhost:8000
CMD

unless system(create_table_cmd)
  puts "Failed to create table."
  cleanup
  exit(1)
end

# Seed users table
puts "Seeding users table..."
password = BCrypt::Password.create("password")
user_data = {
  "id" => { "S" => "rJ3P02N1d" },
  "name" => { "S" => "Johnny Boy" },
  "email" => { "S" => "johnny_walker@gmail.com" },
  "password" => { "S" => password },
  "active_sessions" => { "L" => [] },
  "last_login" => { "S" => Time.now.utc.to_s },
  "preferences" => { "M" => {} },
  "permissions" => { "M" => {} }
}

seed_cmd = <<~CMD
  aws dynamodb put-item \
    --table-name users \
    --item '#{JSON.dump(user_data)}' \
    --endpoint-url http://localhost:8000
CMD

unless system(seed_cmd)
  puts "Failed to seed table."
  cleanup
  exit(1)
end

puts "DynamoDB Local setup complete!"
puts "DynamoDB Local is running. Press Ctrl+C to stop..."

# Keep the process running until interrupted
begin
  loop { sleep 10 }
rescue Interrupt
  puts "Shutting down..."
end
