class UserMailer < ApplicationMailer
  require "premailer"

  def welcome_email(user_data, link)
    send_email(user_data, "Welcome to Shakey0!", "welcome_email", link)
  end

  def forgot_password_email(user_data, link)
    send_email(user_data, "Password Reset", "forgot_password_email", link)
  end

  private

  def send_email(user_data, subject, template, link)
    @user_email = user_data["email"]
    @user_name = user_data["name"]

    if Rails.env.development? || Rails.env.test?
      mail(to: @user_email, subject: subject) do |format|
        format.html { render template, locals: { link: link, user_name: @user_name } }
      end
    elsif Rails.env.production?
      html = render_to_string(
        template: "user_mailer/#{template}",
        layout: "mailer",
        locals: { link: link, user_name: @user_name }
      )

      send_via_lambda(
        to: @user_email,
        subject: subject,
        html: html,
        text: Premailer.new(html, with_html_string: true).to_plain_text
      )
    else
      raise "Unknown environment: #{Rails.env}"
    end
  end
end
