class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("GMAIL_USERNAME")
  layout "mailer"

  private

  def send_via_lambda(to:, subject:, html:, text:)
    LambdaMailerService.new.send_email(
      to: to,
      subject: subject,
      html: html,
      text: text
    )
  end
end
