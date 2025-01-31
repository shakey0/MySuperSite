require 'open3'
require 'json'
require 'bcrypt'
require 'fileutils'

# Force immediate output flushing
$stdout.sync = true
$stderr.sync = true

DYNAMO_CONTAINER_NAME = "dynamodb_local"
@cleanup_done = false

def run_command(command)
  # Split output into smaller chunks for better streaming
  puts "Running command..."
  STDOUT.flush

  # Use popen3 to stream output in real-time
  Open3.popen3(command) do |stdin, stdout, stderr, wait_thread|
    # Read stdout and stderr streams in separate threads to avoid blocking
    Thread.new do
      while line = stdout.gets
        STDOUT.flush
      end
    end

    Thread.new do
      while line = stderr.gets
        warn "ERR: #{line}"
        STDERR.flush
      end
    end

    # Wait for process to complete
    status = wait_thread.value
    unless status.success?
      warn "Command failed with status: #{status.exitstatus}"
      exit(1)
    end
  end
end

def cleanup
  return if @cleanup_done

  puts "Starting cleanup..."
  STDOUT.flush
  run_command("docker stop #{DYNAMO_CONTAINER_NAME}")
  run_command("docker rm #{DYNAMO_CONTAINER_NAME}")
  puts "Cleanup complete."
  STDOUT.flush

  @cleanup_done = true
end

# Ensure cleanup runs when the script exits
Signal.trap("INT") { cleanup; exit }
Signal.trap("TERM") { cleanup; exit }

puts "Starting DynamoDB Local setup..."
STDOUT.flush

# Step 1: Start DynamoDB Local in a Docker container
run_command("docker run --name #{DYNAMO_CONTAINER_NAME} -d -p 8000:8000 amazon/dynamodb-local")

puts "Waiting for DynamoDB to initialize..."
STDOUT.flush
sleep 3

# Step 2: Create the users table with a GSI on email
puts "Creating users table..."
STDOUT.flush

create_table_command = <<~CMD
  aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=email,AttributeType=S \
    --key-schema \
      AttributeName=id,KeyType=HASH \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --global-secondary-indexes \
      '[{
        "IndexName": "EmailIndex",
        "KeySchema": [
          {"AttributeName": "email", "KeyType": "HASH"}
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

# Step 3: Seed the users table with a sample user
puts "Seeding users table..."
STDOUT.flush

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

seed_command = <<~CMD
  aws dynamodb put-item \
    --table-name users \
    --item '#{JSON.dump(user_data)}' \
    --endpoint-url http://localhost:8000
CMD
run_command(seed_command)

puts "DynamoDB Local setup and seeding complete!"
STDOUT.flush

# Keep the script running to maintain the DynamoDB container
puts "DynamoDB Local is running. Press Ctrl+C to stop..."
STDOUT.flush

# Instead of a bare sleep, use a loop that can be interrupted
loop do
  sleep 1
rescue Interrupt
  break
end
