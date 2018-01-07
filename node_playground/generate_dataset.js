var _ = require('lodash');
var turf = require('@turf/turf');
var line_chunk = require('@turf/line-chunk')
var point = require('turf-point');
var PathFinder = require('geojson-path-finder');
var fs = require('fs');
var geojson = require('./data/cubuk.json');
var jsonfile = require('jsonfile')
var fileSystem = require( "fs" );
var JSONStream = require( "JSONStream" );

console.log("Number of roads ::" + geojson.features.length);
var nodes = [];
var ind = 0;
geojson.features = _.map(geojson.features, function (x) {
	// Put bin to the beiging of the road
	nodes.push({id:ind,coordinate:point(x.geometry.coordinates[0])})
	ind += 1
	return x
});

var pathFinder = new PathFinder(geojson)
nodes = _.sampleSize(nodes, 1000)
console.log("Trash Bins ::" + nodes.length)
jsonfile.writeFileSync('bins.json', nodes);

/*var pathMatrix = [];

_.forEach(nodes, function (x, i) {
	pathMatrix[i] = []
	_.forEach(nodes, function (y, j) {
		if(i<j){
			var path = pathFinder.findPath(x.coordinate, y.coordinate);
			if (path == null)
				path = {path:[],weight:999999999999999}
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

transformStream.pipe(outputStream);
pathMatrix.forEach(transformStream.write);
transformStream.end();*/