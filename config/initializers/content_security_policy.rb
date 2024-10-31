Rails.application.configure do
  if Rails.env.test? || Rails.env.production?
    config.content_security_policy do |policy|
      policy.default_src :self, :https
      policy.font_src    :self, :https, :data
      policy.img_src     :self, :https, :data
      policy.object_src  :none
      policy.script_src  :self, :https
      policy.style_src   :self, :https

      # Additional configuration for test or production
      policy.script_src *policy.script_src, :blob if Rails.env.test?

      # Specify URI for violation reports (optional)
      # policy.report_uri "/csp-violation-report-endpoint"
    end

    # Generate session nonces for permitted importmap, inline scripts, and inline styles.
    config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
    config.content_security_policy_nonce_directives = %w[script-src style-src]
  end
end
