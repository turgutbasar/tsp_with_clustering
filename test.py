import csv 
import sys
import numpy
import math
import random
import functools

# TODO : We need initial data
f = open('2017/2017/TSP_20.txt', 'r')
reader = csv.reader(f)
# Coords Var
coords = []
# Read row by row
for row in reader:
    # Add coordinates to coords list
    coords.append([int(item) for item in row])

# Close File
f.close()

# Distance Function
def dist(a,b):
    return numpy.linalg.norm(numpy.array(a)-numpy.array(b))

def total_dist(sol, N, distances):
    return sum( [distances[sol[i-1]][sol[i]] for i in range(1,N-1)] )


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

# Run algorithm
initial = TSP_NNR(coords)
# Print calculated total distance
print(initial[0], initial[1])

def fitness(sol, N, distances):
    return sum( [distances[sol[i-1]][sol[i]] for i in range(1,N-1)] )
	
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
	
import timeit

start = timeit.default_timer()

optimized = TSP_sanuel(coords, initial[2], initial[0], alpha=0.9999993, t_criteria = 0.00001, i_criteria = 1000000)

stop = timeit.default_timer()

print stop - start 

# Print values
print(optimized[1])
print(swogger(optimized[0]))