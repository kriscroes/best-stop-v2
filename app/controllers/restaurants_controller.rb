class RestaurantsController < ApplicationController
  before_action :set_restaurant, only: [:show, :edit, :update, :destroy]

  def index
    #destroy_all_persisted information for every request
    Restaurant.destroy_all
    Restaurant.get_yelp

    @restaurants = Restaurant.all
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_food
      @restaurant = Restaurant.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def restaurant_params
      params[:restaurant]
    end
end
