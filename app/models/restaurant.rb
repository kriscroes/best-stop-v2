class Restaurant < ActiveRecord::Base
  
geocoded_by :address
after_validation :geocode, :if => :address_changed?

  def self.get_yelp(lat, lon)
    #parameters to be passed in search, e.g. hardcoded flatiron latlon info
    coordinates = { latitude: lat, longitude: lon }
    params = {term: 'restaurant',limit: 5, sort: 2}
    locale = {lang: 'eng'}
    # sort: 1 = by distance
    # sort: 2 = highest rated

    #searching
    search = Yelp.client.search_by_coordinates(coordinates, params, locale) 

    search.businesses.each do |restaurant|
      restaurant_name = restaurant.name
      begin
        restaurant_image = restaurant.image_url
      rescue
        restaurant_image = "http://i786.photobucket.com/albums/yy146/featherbrigade/cat-with-surprised-guilty-look.jpg"
      end
      restaurant_address = restaurant.location.display_address.join(", ")
      restaurant_rating = restaurant.rating
      restaurant_rating_img = restaurant.rating_img_url_small
      restaurant_url = restaurant.url
      begin
        restaurant_distance = (restaurant.distance * 0.00062137).round(2)
      rescue
        restaurant_distance = -1

      end

 
    
      Restaurant.create(name: restaurant_name,
                       address: restaurant_address,
                       image_url: restaurant_image,
                       rating: restaurant_rating,
                       rating_img_url: restaurant_rating_img, 
                       url: restaurant_url, 
                       distance: restaurant_distance)
      end

  end


end
