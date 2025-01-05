require "aws-sdk-cloudfront"
require "time"
require "json"

class CloudFrontCookieService
  def initialize(key_pair_id:, private_key_path:, domain: ".shakey0.co.uk", path: "/*", expiry_duration: 3600)
    @key_pair_id = key_pair_id
    @private_key_path = private_key_path
    @domain = domain
    @path = path
    @expiry_duration = expiry_duration
    @flags = "Secure; HttpOnly;"

    init_signer
  end

  def generate_signed_cookies(url)
    start_time = Time.now.utc
    expiry_time = start_time + @expiry_duration

    policy = create_policy(url, expiry_time.to_i)
    cookies = @signer.signed_cookie(url, policy: policy.to_json)

    format_individual_cookies(cookies, expiry_time)
  end

  private

  def init_signer
    @signer = Aws::CloudFront::CookieSigner.new(
      key_pair_id: ENV[@key_pair_id],
      private_key: File.read(ENV[@private_key_path])
    )
  end

  def create_policy(url, expiry_epoch)
    {
      "Statement" => [ {
        "Resource" => url,
        "Condition" => {
          "DateLessThan" => { "AWS:EpochTime" => expiry_epoch }
        }
      } ]
    }
  end

  def format_individual_cookies(cookies, expiry_time)
    cookies.map do |name, value|
      "#{name}=#{value}; Path=#{@path}; Domain=#{@domain}; #{@flags} Expires=#{expiry_time.httpdate}"
    end
  end
end
