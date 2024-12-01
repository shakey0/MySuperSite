class CatsController < ApplicationController
  def index
  end

  def show
  end

  def data
    slug = params[:slug]
    cat_data = CatData.load_all(slug)
    render json: cat_data
  end
end
