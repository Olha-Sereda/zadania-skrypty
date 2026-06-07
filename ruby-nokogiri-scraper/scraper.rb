require "nokogiri"
require "open-uri"

CATEGORY_URL = "https://www.amazon.com/best-sellers-movies-TV-DVD-Blu-ray/zgbs/movies-tv/ref=zg_bs_nav_movies-tv_0"
CATEGORY_NAME = "Amazon Best Sellers: Movies & TV"
REQUEST_HEADERS = {
  "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " \
                  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language" => "en-US,en;q=0.9"
}.freeze

def fetch_document(url)
  Nokogiri::HTML(URI.open(url, REQUEST_HEADERS))
end

def scrape_products(document)
  document.css(".zg-grid-general-faceout").map do |product|
    title = product.at_css("[class*='p13n-sc-css-line-clamp']")&.text&.strip ||
            product.at_css("img.p13n-product-image")&.[]("alt")&.strip
    price = product.at_css("[class*='p13n-sc-price']")&.text&.strip ||
            product.at_css(".a-color-price")&.text&.strip

    next if title.nil? || title.empty? || price.nil? || price.empty?

    {
      title: title,
      price: price
    }
  end.compact
end

def filter_products_by_keyword(products, keyword)
  normalized_keyword = keyword.downcase.strip

  products.select do |product|
    product[:title].downcase.include?(normalized_keyword)
  end
end

document = fetch_document(CATEGORY_URL)
products = scrape_products(document)
keyword = ARGV.join(" ").strip

if keyword.empty?
  puts "Products from #{CATEGORY_NAME} category:"
else
  products = filter_products_by_keyword(products, keyword)
  puts "Products from #{CATEGORY_NAME} category matching \"#{keyword}\":"
end

puts

products.each_with_index do |product, index|
  puts "#{index + 1}. #{product[:title]} - #{product[:price]}"
end
