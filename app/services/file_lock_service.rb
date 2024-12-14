class FileLockService
  def self.read_file_with_lock(file_path, retries: 5, delay: 0.1)
    lock_key = "file:lock:#{file_path}"

    retries.times do
      # Attempt to acquire the lock
      if $redis.set(lock_key, "1", nx: true, ex: 1) # Set lock with expiration
        begin
          # Read and parse the file
          file_data = JSON.parse(File.read(file_path))
          return file_data
        rescue JSON::ParserError => e
          return nil
        ensure
          # Ensure the lock is removed after processing
          $redis.del(lock_key)
        end
      else
        # Wait before retrying
        sleep(delay)
      end
    end

    raise "Could not acquire lock for file: #{file_path}"
  end
end
