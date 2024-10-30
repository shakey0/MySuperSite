class MController < ApplicationController
  def show
    @id = params[:id]
  end
end
