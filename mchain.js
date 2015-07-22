"use strict";

var MChain = MChain || (function(){

	function MarkovChain(events, order){

		this.chain = [];

		// chain order must be 1 or greater
		if ( !(order >= 1) ){
			order = 1;
		}

		// pad the list of events
		for (var i=0; i<order; i++){
			events.unshift("_");
		}

		// generate the list of states and their adjacency lists
		for (var i=0; i<events.length-order+2; i++){
			// create a bracket that includes the state as well as the neighbor event
			var bracket = [];
			for (var j=i; j<i+order+1; j++){
				bracket.push(events[j]);
			}

			// set the neighbor event
			var neighborEvent = bracket[bracket.length-1];
			bracket.pop();

			// set the state
			var state = bracket.join();

			// add the neighbor event to the chain
			var newList = true;
			for (var j=0; j<this.chain.length; j++){
				if (this.chain[j].state === state){
					this.chain[j].neighbors.add(neighborEvent);
					newList = false;
					break;
				}
			}
			if (newList){
				var neighbors = new AdjacencyList([neighborEvent]);
				this.chain.push({ state: state, neighbors: neighbors });
			}
		}

		// set the initial state
		this.currentState = this.chain[Math.floor(Math.random()*this.chain.length)].state;
	}

	MarkovChain.prototype.choose = function(){
		// find the current state in the chain
		for (var i=0; i<this.chain.length; i++){
			if (this.chain[i].state === this.currentState){

				// choose a neighbor
				var neighbor = this.chain[i].neighbors.choose();

				// set the return value
				var snapshot = {
					state: this.chain[i].state,
					neighbors: this.chain[i].neighbors,
					chosen_neighbor: neighbor
				};

				// update the current state
				var currentStateSplit = this.currentState.split(',');
				currentStateSplit.shift();
				currentStateSplit.push(neighbor.event);
				this.currentState = currentStateSplit.join();

				return snapshot;
			}
		}

		// the current state was not a valid state, so choose one at random and try again
		this.currentState = this.chain[Math.floor(Math.random()*this.chain.length)].state;
		return this.choose();
	}

	function AdjacencyList(events){
		this.list = [];
		this.sum = 0;

		if (events){
			for (var i=0; i<events.length; i++){
				this.add(events[i]);
			}
		}
	}

	AdjacencyList.prototype.updateSum = function(){
		this.sum = 0;
		for (var i=0; i<this.list.length; i++){
			this.sum += this.list[i].count;
		}
	};

	AdjacencyList.prototype.normalize = function(){
		this.updateSum();
		for (var i=0; i<this.list.length; i++){
			this.list[i].relative_frequency = this.list[i].count / this.sum;
		}
	};

	AdjacencyList.prototype.add = function(eventName){
		for (var i=0; i<this.list.length; i++){
			if (eventName === this.list[i].event){
				this.list[i].count += 1;
				this.normalize();
				return;
			}
		}
		this.list.push({ event: eventName, count: 1 });
		this.normalize();
	};

	AdjacencyList.prototype.choose = function(){
		var upperBound = 0;
		var randVal = Math.random();
		for (var i=0; i<this.list.length; i++){
			upperBound += this.list[i].relative_frequency;
			if (randVal < upperBound){
				return this.list[i];
			}
		}
	};

	return {
		create: function(events, order){
			return new MarkovChain(events, order);
		}
	};

}());