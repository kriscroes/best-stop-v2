class MapController < ApplicationController

  def index
    Restaurant.destroy_all
    Restaurant.get_yelp

    @restaurants = Restaurant.all
  end

end
