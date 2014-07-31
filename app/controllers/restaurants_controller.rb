class RestaurantsController < ApplicationController
  class FoodsController < ApplicationController
  before_action :set_food, only: [:show, :edit, :update, :destroy]

  def index
    #destroy_all_persisted information for every request
    Food.destroy_all

    #parameters to be passed in search, e.g. hardcoded flatiron latlon info
    coordinates = { latitude: 40.7055268, longitude: -74.0143461 }
    params = {term: 'food',limit: 5, sort: 1}
    locale = {lang: 'eng'}

    #searching
    search = Yelp.client.search_by_coordinates(coordinates, params, locale)
   
    #results. Refer to @search
    result_size = search.businesses.size

    #create (persist) instances with name and address of each restaurant in search  
    index = 0
    result_size.times do 
      food_name = search.businesses[index].name
      food_image = search.businesses[index].image_url
      food_address = search.businesses[index].location.display_address.join(",")
      Food.create(name: food_name, address: food_address, image_url: food_image)
      index = index + 1
      # binding.pry
    end    

    @foods = Food.all
   
  
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_food
      @food = Food.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def food_params
      params[:food]
    end
end
end
