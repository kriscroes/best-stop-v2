class CreateRestaurants < ActiveRecord::Migration
  def change
    create_table :restaurants do |t|
      t.string :name
      t.string :address
      t.string :image_url
      t.string :url
      t.string :rating
      t.string :rating_img_url
      t.float :distance

      t.timestamps
    end
  end
end
