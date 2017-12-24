var _ = require('lodash');
var turf = require('turf');
var PathFinder = require('geojson-path-finder');
var fs = require('fs');
var geojson = require('./data/cubuk.json');
var jsonfile = require('jsonfile')
var fileSystem = require( "fs" );
var JSONStream = require( "JSONStream" );

var pathFinder = new PathFinder(geojson);

console.log("Number of roads ::" + geojson.features.length);
var nodes = [];
var ind = 0;
_.forEach(geojson.features, function (x) {
	// It is a main road
	var dist_of_road = turf.lineDistance(x, 'meters')
	if (dist_of_road < 50) {
		return;
	} else if (dist_of_road < 100) {
		nodes.push(turf.along(x, Math.round(dist_of_road *0.5), 'meters'))
	} else if (dist_of_road < 150) {
		nodes.push(turf.along(x, Math.round(dist_of_road *0.33), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.66), 'meters'))
	} else if (dist_of_road < 200) {
		nodes.push(turf.along(x, Math.round(dist_of_road *0.25), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.50), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.75), 'meters'))
	} else if (dist_of_road < 250) {
		nodes.push(turf.along(x, Math.round(dist_of_road *0.2), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.4), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.6), 'meters'))
		nodes.push(turf.along(x, Math.round(dist_of_road *0.8), 'meters'))
	} else {
		return;
	}
});
console.log("Trash Bins ::" + nodes.length)
jsonfile.writeFileSync('bins.json', nodes);

var pathMatrix = [];

_.forEach(nodes, function (x, i) {
	pathMatrix[i] = []
	_.forEach(nodes, function (y, j) {
		if(i<j){
			var path = pathFinder.findPath(x, y);
		pathMatrix[i][j] = path;
		}else if(j>i){
		pathMatrix[i][j] = pathMatrix[j][i];
		}else{
			pathMatrix[i][j]={path:[],weight:0};
		}
	});
	console.log("Processed:::" + i + "/" + nodes.length)
});

var transformStream = JSONStream.stringify();
var outputStream = fileSystem.createWriteStream( "paths.json" );

transformStream.pipe( outputStream );

pathMatrix.forEach( transformStream.write );

transformStream.end();