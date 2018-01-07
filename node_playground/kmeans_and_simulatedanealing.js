var jsonfile = require('jsonfile')
var _ = require('lodash');
var bins = jsonfile.readFileSync('bins.json')
var fileSystem = require("fs");
var JSONStream = require("JSONStream");
var transformStream = JSONStream.parse("*");
var turf = require('@turf/turf');
var linestring = require('turf-linestring');
var featurecollection = require('turf-featurecollection');
var pathmatrix = []
var jsonfile = require('jsonfile')
var point = require('turf-point');
var PathFinder = require('geojson-path-finder');
var geojson = require('./data/cubuk.json');
var pathfinder = new PathFinder(geojson)

	 
	const kmeans = require('node-kmeans');

	kmeans.clusterize(_.map(bins, function(bin){return bin.coordinate.geometry.coordinates}), {k: 4}, (err,res) => {
		if (err) console.error(err);
		else {
			console.log("KMeans")
			// Simulated Anealing for TSP
			// Apply mapping to generate sub groups and depots.
			var regions = _.map(res, function(cluster){
				var bs = _.map(cluster.clusterInd, function(cl_id, index){
					return { id: cl_id, point: bins[cl_id], isVisited:false }
				});
				return { centroid: cluster.centroid, bins:bs }
			});
			
			//console.log(regions)
			
			// Run NN algorithm for initial solution.
			var regions_with_initial_sols = _.map(regions, function(region){
				region.initial = TSP_NNR(region);
				return region;
			});
		
			// Run Simulated anealing for every cluster.
			var regions_with_applied_sim_an = _.map(regions, function(region){
				region.tsp = TSP_sanuel(region.bins, region.initial);
				return region;
			});
			
			// Show results.
			colors = ['red', 'blue', 'yellow', 'black']
			files = ['cluster1.json', 'cluster2.json', 'cluster3.json', 'cluster4.json']
			_.each(regions, function(region, i){
				data = featurecollection(_.map(region.bins, function(bin, index){
					feature = bin.point.coordinate
					feature.properties = {"stroke":colors[i], "stroke-width":"3"}
					return feature
				}))
				jsonfile.writeFileSync(files[i], data);
			})
			files = ['path1.json', 'path2.json', 'path3.json', 'path4.json']
			_.each(regions_with_initial_sols, function(region, i){
				route = []
				console.log(region.tsp)
				_.each(region.tsp[0], function(bin, index){
					current = region.tsp[0][index]
					next = index+1
					if(next == region.tsp[0].length)
						return
					next = region.tsp[0][next]
					var feature = linestring(pathmatrix[current][next]["path"])
					feature.properties = {"stroke":colors[i], "stroke-width":"3"}
					route.push(feature)
				})
				data = featurecollection(route)
				jsonfile.writeFileSync(files[i], data);
			})
		}
	});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fitness(sol) {
	var error = true
	while(error) {
		error = false
		var cost = 0
		_.each(sol, function(bin, index){
			var current = sol[index]
			var next = sol[index+1]
			if(next == undefined)
				return
			try{
				cost += pathmatrix[current][next].weight
			} catch(err){
				if(pathmatrix[current] == undefined)
					pathmatrix[current] = _.map(bins, function(bin){ return null});
				if(pathmatrix[current][next] == null){
					pathmatrix[current][next] = pathfinder.findPath(bins[current].coordinate, bins[next].coordinate)
					if (pathmatrix[current][next] == null){
						pathmatrix[current][next] = {path:[],weight:999999999999999};
						error = true
						return;
					}
				}
			}
		})
	}
	return cost;
}

function TSP_sanuel(bins, initial_solution){
	console.log("Region TSP")
    var best_solution = initial_solution
    var current_solution = initial_solution
	var current_fitness = fitness(initial_solution)
    var best_fitness = current_fitness
    var temp = Math.sqrt(bins.length)
    var itr = 1
    while(temp >= 0.0001 && itr < 1000000) {
        var can = current_solution
        var l = getRandomInt(2, bins.length-1)
        var i = getRandomInt(0, l)
		var can_cl = _.map(can, function(bin, index){
			if(index <= i || index >= l)
				return bin;
			else
				return can[l -index + i]
		})
        var candidate_fitness = fitness(can_cl)
        if(candidate_fitness < current_fitness){
            current_solution = can_cl
            current_fitness = candidate_fitness
            
            if(candidate_fitness < best_fitness){
                console.log("Improved::" + candidate_fitness)
                best_fitness = candidate_fitness
                best_solution = can_cl
			}
		}
        else {
            if(Math.random() < Math.exp(-Math.abs(candidate_fitness-current_fitness) / temp)){
                current_solution = can
                current_fitness = candidate_fitness
			}
        }
        temp *= 0.9999999999
        itr += 1
	}
    return [best_solution, best_fitness]
}
	
// Nearest Neighbour Route
function TSP_NNR(region) {
	// Number of Nodes
    N = region.bins.length
    // Next pointer
	// TODO : Set Centroid !!!!
    next = _.sample(region.bins)
    // Route list, it will be filled up at the end in order of path
    route = []
    // Infinite Loop
	while(true) {
        current = next
		current.isVisited = true
        route.push(current)
		var candidates = _.filter(region.bins, function(bin){return bin.isVisited == false && bin.id != current.id;})
		// If our candidates are empty. It means you have visited every node
        if(candidates.length == 0){
            break;
		}
		if(pathmatrix[current.id] == undefined)
			pathmatrix[current.id] = _.map(bins, function(bin){ return null});
		pathmatrix[current.id] = _.map(pathmatrix[current.id], function(path, index){ target = _.find(candidates, function(bin){ return bin.id == index}); if(target==null) return path; if(path!=null) return path; else {candidate_path = pathfinder.findPath(current.point.coordinate, target.point.coordinate);return candidate_path != null ? candidate_path: {path:[],weight:999999999999999};}})
	    next = _.minBy(candidates, function(bin){ return pathmatrix[current.id][bin.id].weight; })
	}
	var last = route[route.length-1]
	var first = route[0]
	if(pathmatrix[last.id] == undefined)
		pathmatrix[last.id] = _.map(bins, function(bin){ return null});
	if(pathmatrix[last.id][first.id] == null)
		pathmatrix[last.id][first.id] = pathfinder.findPath(last.point.coordinate, first.point.coordinate)
		if (pathmatrix[last.id][first.id] == null)
			pathmatrix[last.id][first.id] = {path:[],weight:999999999999999};
	return _.map(route, function(bin){return bin.id});
}