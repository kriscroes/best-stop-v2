class MapController < ApplicationController

  def index
    @restaurants = Restaurant.all
  end

  # def calculate
  #   Restaurant.destroy_all
  #   Restaurant.get_yelp

  #   @restaurants = Restaurant.all
  # end

end
