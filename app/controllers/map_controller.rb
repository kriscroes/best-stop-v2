class MapController < ApplicationController

  def index
    #@food = Yelp.client.search('San Francisco', { term: 'food' })
    # coordinates = { latitude: 37.7577, longitude: -122.4376 }
    # @food.client.search_by_coordinates(coordinates, params, locale)
  end

  # def search
  #   parameters = { term: params[:term], limit: 16 }
  #   render json: Yelp.client.search('San Francisco', parameters)
  # end

end
