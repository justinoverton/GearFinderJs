/**
Gear Solver
Copyright (c) 2016 Justin Overton
Licensed under the MIT license (http://opensource.org/licenses/mit-license.php)
*/
function GearSolver() {
	this.options = {
		timeout: 10000,
		precision: 4,
		minTeeth: 4,
		maxTeeth: 100,
		maxDepth: 5,
		allowFixedRing: true,
		allowFixedSun: true,
		allowFixedPlanet: true,
		allowSpur: true
	};
	
	this.gearCache = [];
	this.gearMap = {};
	this.gearMap.R = {};
	this.gearMap.S = {};
	this.gearMap.P = {};
	this.gearMap.spur = {};
	
	return this;
}

GearSolver.prototype.fixPrecision = function(n){
	return parseFloat(n.toFixed(this.options.precision));
};

GearSolver.prototype.solve = function(ratio) {
	this.buildCache();
	return this.findTrain(ratio, Date.now(), this.options.maxDepth);
};

GearSolver.prototype.findGear = function(ratio){
	
	var g = null;
	if(this.options.allowFixedRing) {
		g = this.gearMap.R[ratio];
	}
	
	if(!g && this.options.allowFixedSun) {
		g = this.gearMap.S[ratio];
	}
	
	if(!g && this.options.allowFixedPlanet) {
		g = this.gearMap.P[ratio];
	}
	
	if(!g && this.options.allowSpur) {
		g = this.gearMap.spur[ratio];
	}
	
	return g;
};

GearSolver.prototype.findTrain = function(ratio, start, maxDepth) {
	if(start === null){
		start = Date.now();
	} else if(Date.now() - start > this.options.timeout) {
		return null;
	}
	
	if(!maxDepth)
		return null;
	
	ratio = this.fixPrecision(ratio);
	
	var found = this.findGear(ratio);
	if(found)
		return [found];
	
	//multiply ratio by precision to remove decimals
	var numer = ratio * Math.pow(10, this.options.precision);
	var denomer = Math.pow(10, this.options.precision);
	
	/*
	Simple example of what's going on here
	10.4/5 with precision of 1 decimal
	104/50 = 2.08
	
	104 factor 52 quotient 2
	
	var ratio1 = 52/50
	var ratio2 = 2/1
	var final = ratio1 * ratio2
	(52/50) = 1.04
	1.04 * (2/1) = 1.04 * 2) = 2.08
	
	On the other side....
	
	10.4/5 with precision of 1 decimal
	104/50 = 2.08
	
	50 factor 10 quotient 5
	
	var ratio1 = 104/10
	var ratio2 = 1/5
	var final = ratio1 * ratio2
	(52/50) = 1.04
	1.04 * (2/1) = 1.04 * 2) = 2.08
	*/
	var self = this;
	//first try numer
	var sol = this.getFactors(numer, function(f) {
		var q = numer / f;
		var r1 = self.findTrain(f/denomer, start, maxDepth--);
		if(!r1) { return null;}
		var r2 = self.findTrain(q, start, maxDepth--);
		if(r2) {
			return r1.concat(r2);
		}
		
		return null;
	});
	
	if(sol)
		return sol;
	
	return this.getFactors(denomer, function(f) {
		var q = numer / f;
		var r1 = self.findTrain(numer/f, start, maxDepth--);
		if(!r1) { return null;}
		var r2 = self.findTrain(1/q, start, maxDepth--);
		if(r2) {
			return r1.concat(r2);
		}
		
		return null;
	});
}

GearSolver.prototype.getFixedRingRatio = function(r, s, p) {
	var ratio = this.fixPrecision(1 + (r/s));
	
	return {
		type: 'planetary',
		inputGear: 'S',
		outputGear: 'P',
		fixedGear: 'R',
		r: r,
		s: s,
		p: p,
		show: true,
		ratio: ratio
	};
};

GearSolver.prototype.getFixedSunRatio = function(r, s, p) {
	var ratio = this.fixPrecision(1 / (1 + (s/r)));	
	return {
		type: 'planetary',
		inputGear: 'P',
		outputGear: 'R',
		fixedGear: 'S',
		r: r,
		s: s,
		p: p,
		show: true,
		ratio: ratio
	};
};

GearSolver.prototype.getFixedPlanetRatio = function(r, s, p) {
	var ratio = this.fixPrecision(-r/s); //not sure how to deal with a negative ratio. Treat it as posive and let the user deal with reversing it with an idler at the end
	return {
		type: 'planetary',
		inputGear: 'S',
		outputGear: 'R',
		fixedGear: 'P',
		r: r,
		s: s,
		p: p,
		show: true,
		ratio: ratio
	};
};

GearSolver.prototype.getSpurRatio = function(r, s) {
	var ratio = this.fixPrecision(r/s);
	return {
		type: 'spur',
		a: r,
		b: s,
		ratio: ratio,
		show: true,
		fixedGear: 'spur'
	};
};

GearSolver.prototype.addGear = function(g, skipInvert) {
	if(!g)
		return;
	
	var map = this.gearMap[g.fixedGear];
	
	if(map[Math.abs(g.ratio)]) {
		return; //avoid duplicates
	} else {
		map[Math.abs(g.ratio)] = g;
	}
	
	if(skipInvert)
		return;
	
	this.addGear({
		type: g.type,
		inputGear: g.outputGear,
		outputGear: g.inputGear,
		fixedGear: g.fixedGear,
		a: g.a,
		b: g.b,
		r: g.r,
		s: g.s,
		p: g.p,
		show: true,
		ratio: this.fixPrecision(1/g.ratio)
	}, true);
}

GearSolver.prototype.buildCache = function() {
	if(this.isbuilt)
		return;
	this.isbuilt = true;
	
	//R = 2P + S
	//ratio = 1 + R/S
	//P = (R-S)/2
	
	for(var s=this.options.minTeeth; s<this.options.maxTeeth; s++) {
		for(var r=this.options.minTeeth; r<this.options.maxTeeth; r++) {
			
			var planetaryCompatible = true;
			if(r <= s)
				planetaryCompatible = false;
			
			var p = (r-s)/2;
			if(p < 4 || (p % 1 !== 0)) //p has to be a whole number and less than min teeth
				planetaryCompatible = false;
			
			if(planetaryCompatible) {
				this.addGear(this.getFixedRingRatio(r, s, p));
				this.addGear(this.getFixedSunRatio(r, s, p));
				this.addGear(this.getFixedPlanetRatio(r, s, p));
			}
			
			this.addGear(this.getSpurRatio(r, s));
		}
	}
};

GearSolver.prototype.getFactors = function(n, fn) {
  for(var i = n-1; i >= 2; i--){
    var quotient = n/i;
	
    if(quotient % 1 === 0){
      var res = fn(i);
	  if(res) {
	  	return res;
	  }
    }
  }
  return null;
};

function GearSolverCtrl(GearSolver, $scope, $http) {
	$scope.options = {
		timeout:10000, //millis
		precision:4, //decimal points
		minTeeth:4,
		maxTeeth:100,
		maxDepth:5,
		allowFixedRing:true,
		allowFixedSun:true,
		allowFixedPlanet:true,
		allowSpur:true,
		ratio: 3.4
	};
	
	$scope.cacheValid = false;
	$scope.isStale = true;
	$scope.train = null;
	$scope.isSolved = false;
	$scope.isRendering = false;
	
	$scope.$watch('options', function(){
		$scope.isStale = true;
	}, true);
	
	$scope.$watch('minTeeth', function(){
		GearSolver.isbuilt = false;
	});
	
	$scope.$watch('maxTeeth', function(){
		GearSolver.isbuilt = false;
	});
	
	$scope.solve = function() {
		
		$scope.isStale = false;
		$scope.train = null;
		$scope.isSolved = false;
		GearSolver.options = $scope.options;
		
		$scope.train = GearSolver.solve($scope.options.ratio);
		$scope.isSolved = true;
	};
	
	$scope.render = function() {
		if(!$scope.train)
			return null;
		
		//This isn't properly done in the angular way, but it's utilizing 3rd party code and
		//I don't have time to mess around with it. Feel free to submit a pull request to make it pretty :)
		
		var trainTxt = JSON.stringify($scope.train);
		$http.get('gearRender.js').then(function(o){
			
			var jscadScript = 'function getGearTrain() { return ' + trainTxt + ';} \r\n' + o.data;
			var proc = getProcessor();
			proc.setJsCad(jscadScript, "GearSolver");
			$scope.isRendering = false;
		});
	};
}

angular.module('GearSolverApp', [])
	.factory('GearSolver', function(){ return new GearSolver();})
	.controller('GearSolverCtrl', GearSolverCtrl)
	.directive('gsSvg', function() {
	  return {
	    scope: {
	    	train: '='
	    },
	    link: function (scope, element) {
	      
	      scope.$watchCollection('train', function(){
	      	element.empty();
	      	if(scope.train){
		      	element.append(angular.element(GearRenderer.getSvg(scope.train, {
						circularPitch: 8,
						pressureAngle: 20,
						clearance: 0.05,
						backlash: 0.05,
						centerHoleDiameter: 4,
						profileShift: -0,
						qualitySettings: {resolution: 30, stepsPerToothAngle: 3}
					})));
	      	}
	      });
	    }
	  };
	});
