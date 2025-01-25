class BrainController < ApplicationController
  before_action :authenticate_user!, only: [ :index ]
  before_action :require_no_user!, only: [ :auth ]

  def index
  end

  def auth
    auth_token = params.permit(:auth_token)[:auth_token]
    # Need a check_auth_token_service here that validates the auth_token and invalidates it if it's valid
    # If the auth_token is not valid, render the index page with a message param saying the link has expired or is invalid
  end
end
