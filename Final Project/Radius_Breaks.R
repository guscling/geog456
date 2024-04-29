library(classInt)
rm(list=ls(all=TRUE))
setwd('/Users/gusclingroth/GEOG456/Final Project/Csv')
migration_data <- read.csv('GEOG456_Total_Data.csv')

a <- min(migration_data$Assylum_Apps_2014)
b <- min(migration_data$Assylum_Apps_2015)
c <- min(migration_data$Assylum_Apps_2016)
d <- min(migration_data$Assylum_Apps_2017)
e <- min(migration_data$Assylum_Apps_2018)
f <- min(migration_data$Assylum_Apps_2019)
g <- min(migration_data$Assylum_Apps_2020,na.rm=T)
h <- min(migration_data$Assylum_Apps_2021,na.rm=T)
i <- min(migration_data$Assylum_Apps_2022,na.rm=T)
j <- min(migration_data$Assylum_Apps_2023,na.rm=T)

mins <- c(a,b,c,d,e,f,g,h,i,j)
min(mins)
#1216869

total_migration <- migration_data[,c(1,34:43)]
total_migration_no_country <- total_migration[-c(29),-c(1)]
total_migration_array <- array(unlist(total_migration_no_country))
total_migration_array <- na.omit(total_migration_array)
sorted_array <- sort(total_migration_array)

classify_intervals(var=sorted_array,n=7,style="kmeans")

length(sorted_array)
sum(sorted_array >= 7700 & sorted_array <21000)
max(sorted_array)
