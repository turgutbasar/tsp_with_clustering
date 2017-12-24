var jsonfile = require('jsonfile')
var _ = require('lodash');
var bins = jsonfile.readFileSync('bins.json')

/*
# Generate Graph From Nodes using Eclidan Distace
def calcComplGraph(coords):
    # Graph Dictionary
    graph = {}
    # For Every Node, We are adding distances to other nodes
    for s in range(len(coords)):
        graph[s] = {}
        # Calculate Distance and add to our list
        for d in range(len(coords)):
            graph[s][d] = dist(coords[s],coords[d])
    return graph

*/

/*def dist(a,b):
			return numpy.linalg.norm(numpy.array(a)-numpy.array(b))

		def total_dist(sol, N, distances):
			return sum( [distances[sol[i-1]][sol[i]] for i in range(1,N-1)] )
*/

/*
def TSP_sanuel(coords, distances, cur_solution, alpha=0.9, t_criteria = 0.1, i_criteria = 10000 ):
    cur_solution = cur_solution[:]
    best_solution = cur_solution
    N = len(coords)
    current_fitness = None
    current_fitness = fitness(cur_solution, N, distances)
    initial = current_fitness
    best_fitness = current_fitness
    temp = math.sqrt(N)
    itr = 1
    while temp >= t_criteria and itr < i_criteria:
        can = cur_solution
        l = random.randint(2, N-1)
        i = random.randint(0, l)
        can_cl = can[:]
        can_cl[i:(i+l)] = reversed(can_cl[i:(i+l)])
        candidate_fitness = fitness(can_cl, N, distances)
        if candidate_fitness < current_fitness:
            cur_solution = can_cl
            current_fitness = candidate_fitness
            
            if candidate_fitness < best_fitness:
                print(best_fitness)
                best_fitness = candidate_fitness
                best_solution = can_cl
        else:
            if random.random() < math.exp(-abs(candidate_fitness-current_fitness) / temp):
                cur_solution = can
                current_fitness = candidate_fitness
                
        temp *= alpha
        itr += 1
    return best_solution, best_fitness


*/

/*
# Nearest Neighbour Route
def TSP_NNR(coords):
    # Number of Nodes
    N = len(coords)
    # Calculate Graph and store in graph dict
    graph = calcComplGraph(coords)
    # Nodes list ie. [0,1,2,3,4,5,6,7,8,9]
    nodes = list(range(N))
    # Next pointer
    next = 0
    # Route list, it will be filled up at the end in order of path
    route = []
    # Infinite Loop
    while True:
        current = next
        # Create Distance Array for your current node ie. [0, 10, 12, 13] A->A, A->B, A->C, A->D
        distances = dict(zip(nodes, list(graph[current].values())))
        # Check every neighbour if it is already visited or node itself.
        # Keep only unvisited nodes as candidates
        cands = dict([(k, v) for k,v in distances.items() if k not in route and v > 0])
        # Add your current node to route list
        route.append(current)
        # If our candidates are empty. It means you have visited every node
        if not bool(cands):
            route.append(route[0])
            break;
        # Take smallest distance node, nearest node
        nind = numpy.argmin(numpy.array(list(cands.values())))
        # Change our current to this nearest node
        next = list(cands.keys())[nind]
        # Start again to the loop
    return route, total_dist(route, N, graph), graph

		
		
		*/


// Create the data 2D-array (vectors) describing the data
// Create Mapping for points
let vectors = new Array();
for (let i = 0 ; i < bins.length ; i++) {
  vectors[i] = bins[i].geometry.coordinates;
}
 
const kmeans = require('node-kmeans');

kmeans.clusterize(vectors, {k: 4}, (err,res) => {
	if (err) console.error(err);
	else {
		// Simulated Anealing for TSP
		// Apply mapping to generate sub groups and depots.
		var regions = _.map(res, function(cluster){
			return { centroid: cluster.centroid, bins:_.map(cluster.clusterInd, function(idx){
					var point = { id: idx, point: vectors[idx] }
				})
			}
		})
		
		console.log(regions[0].bins.length)
		// Run NN algorithm for initial solution.
		var regions_with_initial_sols = _.map(regions, function(region){
			region.initial = TSP_NNR(region);
			return region;
		});
	
		// Run Simulated anealing for every cluster.
		var regions_with_applied_sim_an = _.map(regions, function(region){
			region.tsp = TSP_NNR(region);
			return region;
		});
		
		// Show results.
		_.each(regions_with_applied_sim_an, function(res){
			// TODO : Save results as some array or something to generate in charts
		})
	}
});