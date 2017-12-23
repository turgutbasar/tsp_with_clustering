var connect = require('connect');
var serveStatic = require('serve-static');
var _ = require('lodash');
//const Graph = require('node-dijkstra');
var Stork = require('stork');
var jsonfile = require('jsonfile');
var turf = require('turf');
var http = require('http');
var PathFinder = require('geojson-path-finder');
var fs = require('fs');
var geojson = require('./data/cubuk.json');

var pathFinder = new PathFinder(geojson);
var decimalFix = 8;
function fixedPoint(str) {
	return _.map(str, function (x) {
		return parseFloat(parseFloat(x).toFixed(decimalFix));
	}).join(' ');
}

function getLineFirstPoint(str) {
	return _.map(str[0], function (x) {
		return parseFloat(x);
	});
}
function getLineLastPoint(str) {
	str = str;
	return _.map(str[str.length - 1], function (x) {
		return parseFloat(x);
	});
}
console.log(geojson.features.length);
console.log(new Date());
var nodes = {};
var ind = 0;
_.forEach(geojson.features, function (x) {
	if (turf.lineDistance(x, 'meters') > 300) {
	return;
	}
	var startPnt = getLineFirstPoint(x.geometry.coordinates);
	var startWkt = fixedPoint(startPnt);
	if (nodes[startWkt] == undefined) {
		nodes[startWkt] = turf.point(startPnt);
		nodes[startWkt].properties.id = ind;
		ind++;
	}
	x.properties.START_NODE_ID = nodes[startWkt].properties.id;
	var endPnt = getLineLastPoint(x.geometry.coordinates);
	var endWkt = fixedPoint(endPnt);
	if (nodes[endWkt] == undefined) {
		nodes[endWkt] = turf.point(endPnt);
		nodes[endWkt].properties.id = ind;
		ind++;
	}
	x.properties.END_NODE_ID = nodes[endWkt].properties.id;
	x.properties.length = Math.round(turf.lineDistance(x, 'meters'));
});

var sampleNodeList = _.values(nodes);
var pathMatrix = [];

var keyGeoJson = _.keyBy(geojson.features, function (x) {
		return x.properties.START_NODE_ID + "-" + x.properties.END_NODE_ID;
	});
console.log(sampleNodeList.length);
/*fs.writeFile('sampleNodes.json', JSON.stringify({
type : "FeatureCollection",
features : sampleNodeList
}), function () {});*/
sampleNodeList=turf.sample({
type : "FeatureCollection",
features : sampleNodeList
},10).features;
_.forEach(sampleNodeList, function (x, i) {
	pathMatrix[i] = []
	_.forEach(sampleNodeList, function (y, j) {
		/*var s = keyGeoJson[x.properties.id + "-" + y.properties.id];
		var t = keyGeoJson[y.properties.id + "-" + x.properties.id];
		if (s != undefined) {
			pathMatrix[i][j] = {
				path : s.geometry.coordinates,
				weight : s.properties.length
			};
			return;
		} else if (t != undefined) {
			pathMatrix[i][j] = {
				path : t.geometry.coordinates,
				weight : t.properties.length
			};
			return;
		}*/
		if(i<j){
			var path = pathFinder.findPath(x, y);
		pathMatrix[i][j] = path;
		}else if(j>i){
		pathMatrix[i][j] = pathMatrix[j][i];
		}else{
			pathMatrix[i][j]={path:[],weight:0};
		}
		
	});
});
//fs.writeFile('pathMatrix.json', JSON.stringify(pathMatrix), function () {});
	//var pathMatrix = require('./pathMatrix.json');
	
	new Stork({
		port : 8060
	}).start()

	var reqOpts = {
		host : '127.0.0.1',
		port : 8060,
		path : '/solve',
		method : 'POST',
		headers : {
			'content-type' : 'application/json'
		}
	}

	var matrix = _.map(pathMatrix, function (row) {
			return _.map(row, function (column) {
				return column == undefined ? 10000 : parseInt(column.weight.toFixed(0));
			})
		});
//	fs.writeFile('matrix.json', JSON.stringify(matrix), function () {});
	var server = http.createServer(function (request, response) {
			console.log("request comes");
			var headers = {};
			headers["Access-Control-Allow-Origin"] = "*";
			headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
			headers["Access-Control-Allow-Credentials"] = false;
			headers["Access-Control-Allow-Headers"] = "Content-Type,X-Requested-With, X-PINGOTHER";
			headers["Access-Control-Max-Age"] = 86400;
			response.writeHead(200, headers);

			var req = http.request(reqOpts, function (res) {
					var data = ''
						res.on('data', function (chunk) {
							data += chunk
						})
						res.on('end', function () {

							data = JSON.parse(data).solution;

							data = _.map(data, function (arr) {

									var rota = [];

									var i = 0;

									for (var i = 0; i < arr.length - 1; ++i) {
										var current = arr[i];
										var next = arr[i + 1];
										if(pathMatrix[current][next]!=undefined){
										var route = pathMatrix[current][next].path;
										rota.push(turf.lineString(route));	
										}
									}
									return rota;

								});
							response.end(JSON.stringify({route:data,nodes:sampleNodeList}));
						})
				});

			req.end(JSON.stringify({
					numWorkers : 10,
					customers : Array.apply(null, {
						length : 100
					}).map(Number.call, Number),
					depotLoc : 'Waterloo, ON',
					maxRouteLength : 300000, // 300km max rota,
					verbose : false,
					distances : matrix,
					depot : matrix[0]
				}));
		});

	server.listen(8086);

//});
console.log(" end: " + new Date());
//var pathMatrix = require('./pathMatrix.json');