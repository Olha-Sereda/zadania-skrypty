require "nokogiri"
require "open-uri"
require "uri"

CATEGORY_BASE_URL = "https://www.amazon.com"
CATEGORY_URL = "https://www.amazon.com/best-sellers-movies-TV-DVD-Blu-ray/zgbs/movies-tv/ref=zg_bs_nav_movies-tv_0"
CATEGORY_NAME = "Amazon Best Sellers: Movies & TV"
DETAIL_FIELDS = ["Media Format", "Run time", "Release date", "Actors", "Studio"].freeze
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
    product_path = product.at_css("a.a-link-normal[href*='/dp/']")&.[]("href")

    next if title.nil? || title.empty? || price.nil? || price.empty? || product_path.nil? || product_path.empty?

    {
      title: title,
      price: price,
      product_url: URI.join(CATEGORY_BASE_URL, product_path).to_s
    }
  end.compact
end

def filter_products_by_keyword(products, keyword)
  normalized_keyword = keyword.downcase.strip

  products.select do |product|
    product[:title].downcase.include?(normalized_keyword)
  end
end

def normalize_text(text)
  text.gsub(/\s+/, " ").strip
end

def scrape_product_details(document)
  details = {}
  rating = document.at_css("#acrPopover .a-icon-alt, span[data-hook='rating-out-of-text']")&.text
  details["Rating"] = normalize_text(rating) if rating && !rating.strip.empty?

  document.css("#detailBullets_feature_div li").each do |item|
    label = item.at_css(".a-text-bold")&.text
    value = item.css("span").last&.text
    key = normalize_text(label.to_s).gsub(/[^A-Za-z0-9 ]/, "").strip

    next if key.empty? || value.nil? || value.strip.empty?
    next unless DETAIL_FIELDS.include?(key)

    details[key] = normalize_text(value)
  end

  details
end

def add_product_details(products)
  products.map do |product|
    detail_document = fetch_document(product[:product_url])
    product.merge(details: scrape_product_details(detail_document))
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

products = add_product_details(products)

puts

products.each_with_index do |product, index|
  puts "#{index + 1}. #{product[:title]} - #{product[:price]}"

  product[:details].each do |name, value|
    puts "   #{name}: #{value}"
  end
end
