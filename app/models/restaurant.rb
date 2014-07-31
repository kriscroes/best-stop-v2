class Restaurant < ActiveRecord::Base
    
  def self.get_yelp
    #parameters to be passed in search, e.g. hardcoded flatiron latlon info
    coordinates = { latitude: 40.7055268, longitude: -74.0143461 }
    params = {term: 'restaurant',limit: 5, sort: 1}
    locale = {lang: 'eng'}

    #searching
    search = Yelp.client.search_by_coordinates(coordinates, params, locale) 

    search.businesses.each do |restaurant|
      restaurant_name = restaurant.name
      restaurant_image = restaurant.image_url
      restaurant_address = restaurant.location.display_address.join(", ")
      restaurant_rating = restaurant.rating
      restaurant_rating_img = restaurant.rating_img_url_small
      restaurant_url = restaurant.url
      Restaurant.create(name: restaurant_name, address: restaurant_address, image_url: restaurant_image, rating: restaurant_rating, rating_img_url: restaurant_rating_img, url: restaurant_url)
    end
  end
end
