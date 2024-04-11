
var year1 = '2012'
var year2 = '2016'
var year3 = '2022'
//var year4 = '2023'

var lookup = function(sourceHist, targetHist) {
  // Split the histograms by column and normalize the counts.
  var sourceValues = sourceHist.slice(1, 0, 1).project([0])
  var sourceCounts = sourceHist.slice(1, 1, 2).project([0])
  sourceCounts = sourceCounts.divide(sourceCounts.get([-1]))

  var targetValues = targetHist.slice(1, 0, 1).project([0])
  var targetCounts = targetHist.slice(1, 1, 2).project([0])
  targetCounts = targetCounts.divide(targetCounts.get([-1]))

  // Find first position in target where targetCount >= srcCount[i], for each i.
  var lookup = sourceCounts.toList().map(function(n) {
    var index = targetCounts.gte(n).argmax()
    return targetValues.get(index)
  })
  return {x: sourceValues.toList(), y: lookup}
}

// Make the histogram of sourceImg match targetImg.
var histogramMatch = function(sourceImg, targetImg) {
  var geom = sourceImg.geometry();
  var args = {
    reducer: ee.Reducer.autoHistogram({maxBuckets: 256, cumulative: true}), 
    geometry: geom,
    scale: 30, // Need to specify a scale, but it doesn't matter what it is because bestEffort is true.
    maxPixels: 65536 * 4 - 1,
    bestEffort: true
  }
  
  // Only use pixels in target that have a value in source (inside the footprint and unmasked).
  var source = sourceImg.reduceRegion(args)
  var target = targetImg.updateMask(sourceImg.mask()).reduceRegion(args)

  return ee.Image.cat(
    sourceImg.select(['R']).interpolate(lookup(source.getArray('R'), target.getArray('R'))),
    sourceImg.select(['G']).interpolate(lookup(source.getArray('G'), target.getArray('G'))),
    sourceImg.select(['B']).interpolate(lookup(source.getArray('B'), target.getArray('B')))
  )
}


var dataset1 = ee.ImageCollection('USDA/NAIP/DOQQ')
                  .filter(ee.Filter.bounds(geometry))
                  .filter(ee.Filter.date(year1 + '-01-01', year1 + '-12-31'));

var dataset2 = ee.ImageCollection('USDA/NAIP/DOQQ')  
                  .filter(ee.Filter.bounds(geometry))
                  .filter(ee.Filter.date(year2 + '-01-01', year2 + '-12-31'));

var dataset3 = ee.ImageCollection('USDA/NAIP/DOQQ')  
                  .filter(ee.Filter.bounds(geometry))
                  .filter(ee.Filter.date(year3 + '-01-01', year3 + '-12-31'));

//var dataset4 = ee.ImageCollection('USDA/NAIP/DOQQ')  
//                  .filter(ee.Filter.bounds(geometry))
//                  .filter(ee.Filter.date(year4 + '-01-01', year4 + '-12-31'));

var img1 = dataset1.select(['R', 'G', 'B'])
img1 = img1.median().clip(geometry);

var img2 = dataset2.select(['R', 'G', 'B'])
img2 = img2.median().clip(geometry);

var img3 = dataset3.select(['R', 'G', 'B'])
img3 = img3.median().clip(geometry);

//var img4 = dataset4.select(['R', 'G', 'B'])
//img4 = img4.median().clip(geometry);

var trueColorVis = {
  min: 0,
  max: 255,
};

var match_1_3 = histogramMatch(img1,img3)
var match_2_3 = histogramMatch(img2,img3)


Map.setCenter(-78.6492, 35.7874, 12);
Map.addLayer(img1, trueColorVis, year1);
Map.addLayer(img2, trueColorVis, year2);
Map.addLayer(img3, trueColorVis, year3);
Map.addLayer(match_1_3, trueColorVis, year1 + " & " + year3 + " matched")
Map.addLayer(match_2_3, trueColorVis, year2 + " & " + year3 + " matched")
//Map.addLayer(img4, trueColorVis, year4);

Export.image.toDrive({
  image: img3,
  description: year3,
  scale: 0.6,
  region: geometry
})

Export.image.toDrive({
  image: match_1_3,
  description: year1 + " & " + year3 + " matched",
  scale: 0.6,
  region: geometry
})

Export.image.toDrive({
  image: match_2_3,
  description: year2 + " & " + year3 + " matched",
  scale: 0.6,
  region: geometry
})