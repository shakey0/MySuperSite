class BrainController < ApplicationController
  before_action :authenticate_user!, only: [ :index ]
  before_action :require_no_user!, only: [ :auth ]

  def index
  end

  def auth
  end
end
