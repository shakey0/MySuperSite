class UserMailer < ApplicationMailer
  def welcome_email(user_data, link)
    @user_email = user_data["email"]

    mail(to: @user_email, subject: "Welcome to Shakey0!") do |format|
      format.html { render "welcome_email", locals: { link: link, user_name: user_data["name"] } }
    end
  end

  def forgot_password_email(user_data, link)
    @user_email = user_data["email"]

    mail(to: @user_email, subject: "Password Reset") do |format|
      format.html { render "forgot_password_email", locals: { link: link, user_name: user_data["name"] } }
    end
  end
end
