library(leaflet.minicharts)
library(leaflet.providers)
library(leaflet)
library(htmlwidgets)

data("eco2mix")
head(eco2mix)

library(dplyr)

prod2016 <- eco2mix %>%
  mutate(
    renewable = bioenergy + solar + wind + hydraulic,
    non_renewable = total - bioenergy - solar - wind - hydraulic
  ) %>%
  filter(grepl("2016", month) & area != "France") %>%
  select(-month) %>%
  group_by(area, lat, lng) %>%
  summarise_all(sum) %>%
  ungroup()

head(prod2016)

library(leaflet)

tilesURL <- "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"

basemap <- leaflet(width = "100%", height = "400px") %>%
  addTiles(tilesURL)

colors <- c("red", "blue")

minichart <- basemap %>%
  addMinicharts(
    prod2016$lng, prod2016$lat,
    type = "pie",
    chartdata = prod2016[, c("renewable", "non_renewable")], 
    colorPalette = colors, 
    width = 60 * sqrt(prod2016$total) / sqrt(max(prod2016$total)), transitionTime = 0
  )

saveWidget(minichart, "minicharttest.html")

