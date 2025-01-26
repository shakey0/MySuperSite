class BrainController < ApplicationController
  before_action :authenticate_user!, only: [ :index ]
  before_action :require_no_user!, only: [ :auth ]

  def index
  end

  def auth
    permitted_params = params.permit(:auth_token, :message)
    auth_token = permitted_params[:auth_token]
    if auth_token
      check_auth_token_service = CheckAuthTokenService.new(auth_token)
      result = check_auth_token_service.check_and_reassign_token
      unless result[:valid]
        redirect_to brain_auth_path(message: result[:message])
      end
    end
  end
end
