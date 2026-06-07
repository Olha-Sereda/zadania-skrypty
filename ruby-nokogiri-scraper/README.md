# Ruby Nokogiri Scraper

Task 5: product scraper written in Ruby with Nokogiri.

## Scope 3.0

Fetch basic product data from any category:

- title
- price

The scraper uses the [Amazon Best Sellers: Movies & TV](https://www.amazon.com/best-sellers-movies-TV-DVD-Blu-ray/zgbs/movies-tv/ref=zg_bs_nav_movies-tv_0) category.

## Scope 3.5

Fetch basic product data by keyword. Pass a keyword as a command-line argument to filter scraped Amazon products by title.

## Run

```bash
ruby scraper.rb
```

Run with a keyword:

```bash
ruby scraper.rb avatar
```

Example output:

```text
Products from Amazon Best Sellers: Movies & TV category:

1. Killers of the Flower Moon (The Criterion Collection) [4K UHD] - PLN 122.34
2. Heated Rivalry: Season One (Collector's Edition - 4K / Blu-ray) - PLN 313.08
```

Keyword output:

```text
Products from Amazon Best Sellers: Movies & TV category matching "avatar":

1. Avatar: Fire And Ash (3 Disc) - 4K UHD/BD Combo + Bonus Disc + Digital - PLN 95.74
2. Avatar: Fire And Ash - Blu-ray + Bonus Disc + Digital - PLN 81.00
```
