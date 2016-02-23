/**
This is from https://github.com/rainerhessmer/drh-horology/blob/BrowserBased/csg/InvoluteSpurGearBuilder.html
which is licensed under the MIT permissive license.

Some modifications (can be compared against github) by Justin Overton
**/

// Involute spur gear builder jscad script. Licensed under the MIT license (http://opensource.org/licenses/mit-license.php). Copyright 2014 Dr. Rainer Hessmer

function getParameterDefinitions() {
	var baseParams = [
		{ name: 'circularPitch', caption: 'Circular pitch (the circumference of the pitch circle divided by the number of teeth):', type: 'float', initial: 8 },
		{ name: 'pressureAngle', caption: 'Pressure Angle (common values are 14.5, 20 and 25 degrees):', type: 'float', initial: 20 },
		{ name: 'clearance', caption: 'Clearance (minimal distance between the apex of a tooth and the trough of the other gear; in length units):', type: 'float', initial: 0.05 },
		{ name: 'backlash', caption: 'Backlash (minimal distance between meshing gears; in length units):', type: 'float', initial: 0.05 },
		{ name: 'profileShift', caption: 'Profile Shift (indicates what portion of gear one\'s addendum height should be shifted to gear two. E.g., a value of 0.1 means the adddendum of gear two is increased by a factor of 1.1 while the height of the addendum of gear one is reduced to 0.9 of its normal height.):', type: 'float', initial: 0.0 },
		{ name: 'stepsPerToothAngle', caption: 'Rotation steps per tooth angle when assembling the tooth profile (3 = draft, 10 = good quality). Increasing the value will result in smoother profiles at the cost of significantly higher calcucation time. Incease in small increments and check the result by zooming in.', type: 'int', initial: 3 },
		{ name: 'resolution', caption: 'Number of segments per 360 degree of rotation (only used for circles and arcs); 90 is plenty:', type: 'int', initial: 30 },
	];
	var _gearTrain = getGearTrain();
	for(var i=0; i<_gearTrain.length; i++){
		var g = _gearTrain[i];
		
		if(g.type=='planetary') {
			
			baseParams.push({ 
				name: g.type + i + 'Pdiameter', 
				caption: 'Planetary ' + (i+1) + ' Planet Center Hole Diameter (0 for no hole):', 
				type: 'float', 
				initial: 4 });
			
			baseParams.push({ 
				name: g.type + i + 'Sdiameter', 
				caption: 'Planetary ' + (i+1) + ' Sun Center Hole Diameter (0 for no hole):', 
				type: 'float', 
				initial: 4 });
				
			baseParams.push({ 
				name: g.type + i + 'Rdiameter', 
				caption: 'Planetary ' + (i+1) + ' Ring Center Hole Diameter (0 for no hole):', 
				type: 'float', 
				initial: 4 });
				
			baseParams.push({ 
				name: g.type + i + 'ShowOption', 
				caption: 'Planetary ' + (i+1) + ' Display:', 
				type: 'choice',
				values: [0,1,2,3, 4],
				captions: ['None', 'All', 'Ring', 'Sun', 'Planet'],
				initial: 1 });
			
		} else {
			baseParams.push({ 
				name: g.type + i + 'T1diameter', 
				caption: 'Spur ' + (i+1) + ' T1 Center Hole Diameter (0 for no hole):', 
				type: 'float', 
				initial: 4 });
				
			baseParams.push({ 
				name: g.type + i + 'T2diameter', 
				caption: 'Spur ' + (i+1) + ' T2 Center Hole Diameter (0 for no hole):', 
				type: 'float', 
				initial: 4 });
				
			baseParams.push({ 
				name: g.type + i + 'ShowOption', 
				caption: 'Spur ' + (i+1) + ' Display:', 
				type: 'choice',
				values: [0,1,2,3],
				captions: ['None', 'All', 'T1', 'T2'],
				initial: 1 });
		}
	}
	
	return baseParams;
}

var g_ExpandToCAGParams = {pathradius: 0.01, resolution: 2};
var GearType = {
	Regular: 0,
	Internal: 1,
	Rack: 2
};
function main(params)
{
	// Main entry point; here we construct our solid:
	var qualitySettings = {resolution: params.resolution, stepsPerToothAngle: params.stepsPerToothAngle};
	
	var gearSets = [];
	var _gearTrain = getGearTrain();
	for(var i=0; i<_gearTrain.length; i++){
		var g = _gearTrain[i];
		var showOpt = params[g.type + i + 'ShowOption'];
		
		if(g.type=='planetary') {
			
			var ring = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.r * -1,
					centerHoleDiameter: params[g.type + i + 'Rdiameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 2
				});
				
			var planet1 = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.p,
					centerHoleDiameter: params[g.type + i + 'Pdiameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 4
				});
				
			var sun = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.s,
					centerHoleDiameter: params[g.type + i + 'Sdiameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 3
				});
			
			var planet2 = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.p,
					centerHoleDiameter: params[g.type + i + 'Pdiameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 4
				});
			
			ring.connectedGear = planet1;
			planet1.connectedGear = sun;
			sun.connectedGear = planet2;
			planet2.connectedGear = ring;
			
			gearSets.push(new GearSet([ring, planet1, sun, planet2]));
		} else {
			
			var t1 = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.a,
					centerHoleDiameter: params[g.type + i + 'T1diameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 2
				});
			
			var t2 = new Gear({
					circularPitch: params.circularPitch,
					pressureAngle: params.pressureAngle,
					clearance: params.clearance,
					backlash: params.backlash,
					toothCount: g.b,
					centerHoleDiameter: params[g.type + i + 'T2diameter'],
					profileShift: -params.profileShift,
					qualitySettings: qualitySettings,
					show: showOpt == 1 || showOpt == 3
				});
			
			t1.connectedGear = t2;
			t2.connectedGear = t1;
			
			gearSets.push(new GearSet([t1, t2]));
		}
	}
	var shape = null;
	var offset = 0;
	for(var i=0; i<gearSets.length; i++){
		var gearSet = gearSets[i];
		var setShape = gearSet.createShape();
		
		var boundAdd = setShape.getBounds()[1].x + 10;
		
		if(shape == null)
			shape = setShape;
		else {
			shape = shape.union(setShape.translate([offset, 0]));
		}
		
		offset += boundAdd;
	}
	
	OpenJsCad.log("returning gear set shape");
	return shape;
}
// Generic support for 'class' inheritance (see TypeScript playground example 'Simple Inheritance' for details (http://www.typescriptlang.org/Playground/)
var __extends = this.__extends || function (d, b) {
	function __() { this.constructor = d; }
	__.prototype = b.prototype;
	d.prototype = new __();
};
// End generic support for 'class' inheritance
// Start base class Gear
var Gear = (function () {
	function Gear(options) {
		var options = options || {};
		this.show = options.show;
		this.toothCount = options.toothCount == null ? 15 : options.toothCount;
		if (this.toothCount > 0) {
			this.gearType = GearType.Regular;
		}
		else if (this.toothCount < 0) {
			this.gearType = GearType.Internal;
			this.toothCount = -this.toothCount;
		}
		else {
			// this.toothCount  == 0
			this.gearType = GearType.Rack;
		}					
		this.circularPitch = options.circularPitch;    // Distance from one face of a tooth to the corresponding face of an adjacent tooth on the same gear, measured along the pitch circle.
		this.diametralPitch = options.diametralPitch;  // Ratio of the number of teeth to the pitch diameter
		this.pressureAngle = options.pressureAngle || 20; // Most common stock gears have a 20° pressure angle, with 14½° and 25° pressure angle gears being much less
		// common. Increasing the pressure angle increases the width of the base of the gear tooth, leading to greater strength and load carrying capacity. Decreasing
		// the pressure angle provides lower backlash, smoother operation and less sensitivity to manufacturing errors. (reference: http://en.wikipedia.org/wiki/Involute_gear)
		this.centerHoleDiameter = options.centerHoleDiameter || 0;
		// Given either circular pitch or diametral pitch we calculate the other value
		if (this.circularPitch) {
			// convert circular pitch to diametral pitch
			this.diametralPitch = Math.PI / this.circularPitch;
		}
		else if (this.circularPitch) {
			// convert diametral pitch to circular pitch
			this.circularPitch = Math.PI / this.diametralPitch;
		}
		else {
			throw "gear module needs either a diametralPitch or circularPitch";
		}
		
		this.clearance = options.clearance == null ? 0 : options.clearance;
		this.backlash = options.backlash == null ? 0 : options.backlash;
		this.center = [0,0]; // center of the gear
		this.angle = 0; // angle in degrees of the complete gear (changes during rotation animation)
		// Pitch diameter: Diameter of pitch circle.
		this.pitchDiameter = this.toothCount / this.diametralPitch;
		this.pitchRadius = this.pitchDiameter / 2;
		// Addendum: Radial distance from pitch circle to outside circle.
		this.addendum = 1 / this.diametralPitch;
		this.profileShift = options.profileShift || 0;
		
		// Typically no profile shift is used meaning that this.shiftedAddendum = this.addendum 
		this.shiftedAddendum = this.addendum * (1 + this.profileShift);
		//Outer Circle
		this.outerRadius = this.pitchRadius + this.shiftedAddendum;
		this.angleToothToTooth = 360 / this.toothCount;
		this.qualitySettings = options.qualitySettings;
		//OpenJsCad.log("qualitySettings.resolution: " + this.qualitySettings.resolution);
		//OpenJsCad.log("qualitySettings.stepsPerToothAngle: " + this.qualitySettings.stepsPerToothAngle);
	}
	Gear.prototype.getZeroedShape = function() {
		// return the gear shape center on the origin and rotation angle 0.
		if (this.zeroedShape == null) {
			this.zeroedShape = this._createZeroedShape();
		}
		return this.zeroedShape;
	}
	Gear.prototype._createZeroedShape = function() {
		if (this.gearType == GearType.Regular) {
			return this._createRegularGearShape();
		}
		else if (this.gearType == GearType.Internal) {
			return this._createInternalGearShape();
		}
		else if (this.gearType == GearType.Rack) {
			return this._createRackShape();
		}
	}
	Gear.prototype._createRegularGearShape = function() {
		var tooth = this._createSingleTooth();
		//OpenJsCad.log("-1");
		// we could now take the tooth cutout, rotate it tooth count times and union the various slices together into a complete gear.
		// However, the union operations become more and more complex as the complete gear is built up.
		// So instead we capture the outer path of the tooth and concatenate rotated versions of this path into a complete outer gear path.
		// Concatenating paths is inexpensive resulting in significantly faster execution.
		var outlinePaths = tooth.getOutlinePaths();
		var corners = outlinePaths[0].points;
		// first we need to find the corner that sits at the center
		var centerCornerIndex;
		for(var i = 0; i < corners.length; i++) {
			var corner = corners[i];
			if (corner.lengthSquared() < 0.0000001) {
				centerCornerIndex = i;
				break;
			}
		}				
		var outerPoints = [];
		var outerCorners = [];
		var outterPointsCount = corners.length - 2;
		for(var i = 1; i < corners.length - 1; i++) {
			var corner = corners[(i + centerCornerIndex) % corners.length];
			outerCorners.push(corner);
			outerPoints.push([corner.x, corner.y]);
		}
		for(var i = 1; i < this.toothCount; i++) {
			var angle = i * this.angleToothToTooth;
			var roatationMatrix = CSG.Matrix4x4.rotationZ(angle)
			for (var j = 0; j < outerCorners.length; j++) {
				var rotatedCorner = outerCorners[j].transform(roatationMatrix);
				outerPoints.push([rotatedCorner.x, rotatedCorner.y]);
			}
			//OpenJsCad.log(i);
		}
		var gearShape = CAG.fromPointsNoCheck(outerPoints);
		if (this.centerHoleDiameter > 0) {
			var centerhole = CAG.circle({center: [-0, -0], radius: this.centerHoleDiameter / 2, resolution: this.qualitySettings.resolution});
			gearShape = gearShape.subtract(centerhole);
		}
		return gearShape.rotateZ(-90);
	}
	Gear.prototype._createSingleTooth = function() {
		// create outer circle sector covering one tooth
		var toothSectorPath = new CSG.Path2D([[0,0]], /* closed = */ false);
		var toothSectorArc = CSG.Path2D.arc({
			center: [0, 0],
			radius: this.outerRadius,
			startangle: 90,
			endangle: 90 - this.angleToothToTooth,
			resolution: this.qualitySettings.resolution,
		});
		toothSectorPath = toothSectorPath.concat(toothSectorArc);
		toothSectorPath = toothSectorPath.close();
		var toothSector = toothSectorPath.innerToCAG();
		var toothCutout = this.createToothCutout(false);
		//OpenJsCad.log("-2");
		var tooth = toothSector.subtract(toothCutout);
		return tooth;
	}
	Gear.prototype.createCutoutDemo = function() {
		// create outer circle
		var outerCirclePath = CSG.Path2D.arc({
			center: [0, 0],
			radius: this.outerRadius,
			startangle: 0,
			endangle: 360,
			resolution: this.qualitySettings.resolution,
		});
		outerCirclePath = outerCirclePath.close();
		var gearShape = new CAG();
		gearShape = gearShape.union(outerCirclePath.expandToCAG(g_ExpandToCAGParams.pathradius, g_ExpandToCAGParams.resolution));
		
		var firstCutoutHalf = this.createHalfToothCutout(true);
		// for illustration purposes we mirror the cutout and rotate it so that we can see a completely formed tooth 
		var secondCutoutHalf = firstCutoutHalf.mirroredX();
		gearShape = gearShape.union(firstCutoutHalf);
		gearShape = gearShape.union(secondCutoutHalf);
		
		// apply gear rotation
		gearShape = gearShape.rotateZ(this.angle)
		// move to correct center
		gearShape = gearShape.translate(this.center);
		return gearShape;
	}
	Gear.prototype.createToothCutout = function(asPath) {
		var angleToothToTooth = 360 / this.toothCount;
		var angleStepSize = this.angleToothToTooth / this.qualitySettings.stepsPerToothAngle;

		var toothCutout = new CAG();
		
		var toothCutter = this.createToothCutter(asPath);
		var toothCutterShape = toothCutter.shape;
		var lowerLeftCorner = toothCutter.lowerLeftCorner;
		
		// To create the tooth profile we move the (virtual) infinite gear and then turn the resulting cutter position back. 
		// For illustration see http://lcamtuf.coredump.cx/gcnc/ch6/, section 'Putting it all together'
		// We continue until the moved tooth cutter's lower left corner is outside of the outer circle of the gear.
		// Going any further will no longer influence the shape of the tooth
		var lowerLeftCornerDistance = 0;
		var stepCounter = 0;
		while (true) {
			var angle = stepCounter * angleStepSize;
			var xTranslation = [angle * Math.PI / 180 * this.pitchRadius, 0];
			var movedLowerLeftCorner = lowerLeftCorner.translate(xTranslation);
			movedLowerLeftCorner = movedLowerLeftCorner.rotateZ(angle);
			
			lowerLeftCornerDistance = movedLowerLeftCorner.length();
			if (movedLowerLeftCorner.length() > this.outerRadius) {
				// the cutter is now completely outside the gear and no longer influences the shape of the gear tooth
				break;
			}
			// we move in both directions
			var movedToothCutterShape = toothCutterShape.translate(xTranslation);
			var movedToothCutterShape = movedToothCutterShape.rotateZ(angle);
			toothCutout = toothCutout.union(movedToothCutterShape);

			if (xTranslation[0] > 0) {
				//OpenJsCad.log("xTranslation: " + xTranslation);
				movedToothCutterShape = toothCutterShape.translate([-xTranslation[0], xTranslation[1]]);
				movedToothCutterShape = movedToothCutterShape.rotateZ(-angle);
				toothCutout = toothCutout.union(movedToothCutterShape);
			}
			
			stepCounter++;
		}
		
		var outlinePaths = toothCutout.getOutlinePaths();
		var corners = outlinePaths[0].points;
		var cleanedUpCorners = this._smoothConcaveCorners(corners);
		
		var points = [];
		cleanedUpCorners.map(function(corner) { points.push([corner.x, corner.y]); });
		var toothCutout = CAG.fromPoints(points);
		return toothCutout.rotateZ(-this.angleToothToTooth / 2);
	}
	Gear.prototype.createToothCutter = function(asPath) {
		// we create a trapezoidal cutter as described at http://lcamtuf.coredump.cx/gcnc/ch6/ under the section 'Putting it all together'
		var toothWidth = this.circularPitch / 2;

		var cutterDepth = this.addendum + this.clearance;
		var cutterOutsideLength = 3 * this.addendum;
		
		var sinPressureAngle = Math.sin(this.pressureAngle * Math.PI / 180);
		var cosPressureAngle = Math.cos(this.pressureAngle * Math.PI / 180);
		// if a positive backlash is defined then we widen the trapezoid accordingly.
		// Each side of the tooth needs to widened by a fourth of the backlash (vertical to cutter faces).
		var dx = this.backlash / 2 / cosPressureAngle;
		//OpenJsCad.log("backlash: " + this.backlash);
		//OpenJsCad.log("dx: " + dx);
		
		var lowerRightCorner = [toothWidth / 2 + dx - cutterDepth * sinPressureAngle, this.pitchRadius + this.profileShift * this.addendum - cutterDepth];
		var upperRightCorner = [toothWidth / 2 + dx  + cutterOutsideLength * sinPressureAngle, this.pitchRadius + this.profileShift * this.addendum + cutterOutsideLength];
		var upperLeftCorner = [-upperRightCorner[0], upperRightCorner[1]];
		var lowerLeftCorner = [-lowerRightCorner[0], lowerRightCorner[1]];
		
		//this.logPoints([lowerRightCorner, upperRightCorner, upperLeftCorner, lowerLeftCorner]);
		
		var cutterPath = new CSG.Path2D(
			[lowerLeftCorner, upperLeftCorner, upperRightCorner, lowerRightCorner],
			/* closed = */ true
		);
		
		var cutterShape;
		if (asPath) {
			cutterShape = cutterPath.expandToCAG(g_ExpandToCAGParams.pathradius, g_ExpandToCAGParams.resolution);
		}
		else {
			cutterShape = cutterPath.innerToCAG();
		}
		return {
			shape: cutterShape,
			lowerLeftCorner: cutterPath.points[0] 
		}
	}
	Gear.prototype._createInternalGearShape = function() {
		var singleTooth = this._createInternalToothProfile();
		//return singleTooth;
		var outlinePaths = singleTooth.getOutlinePaths();
		var corners = outlinePaths[0].points;
		// first we need to find the corner that sits at the center
		var centerCornerIndex;
		var radius = this.pitchRadius + ( 1 + this.profileShift) * this.addendum + this.clearance;
		var delta = 0.0000001;
		for(var i = 0; i < corners.length; i++) {
			var corner = corners[i];
			if (corner.y < delta && (corner.x + radius) < delta) {
				centerCornerIndex = i;
				break;
			}
		}				
		var outerCorners = [];
		for(var i = 2; i < corners.length - 2; i++) {
			var corner = corners[(i + centerCornerIndex) % corners.length];
			outerCorners.push(corner);
		}
		
		outerCorners.reverse();
		var cornersCount = outerCorners.length;
		for(var i = 1; i < this.toothCount; i++) {
			var angle = i * this.angleToothToTooth;
			var roatationMatrix = CSG.Matrix4x4.rotationZ(angle)
			for (var j = 0; j < cornersCount; j++) {
				var rotatedCorner = outerCorners[j].transform(roatationMatrix);
				outerCorners.push(rotatedCorner);
			}
		}
		
		var outerCorners = this._smoothConcaveCorners(outerCorners);
		var outerPoints = [];
		outerCorners.map(function(corner) { outerPoints.push([corner.x, corner.y]); });
		var innerRadius = this.pitchRadius + (1 - this.profileShift) * this.addendum + this.clearance;
		var outerRadius = innerRadius + 4 * this.addendum;
		var outerCircle = CAG.circle({center: this.center, radius: outerRadius, resolution: this.qualitySettings.resolution});
		//return outerCircle;
		var gearCutout = CAG.fromPointsNoCheck(outerPoints);
		//return gearCutout;
		return outerCircle.subtract(gearCutout);
	}
	Gear.prototype._createInternalToothProfile = function() {
		var radius = this.pitchRadius + ( 1 - this.profileShift) * this.addendum + this.clearance;
		var angleToothToTooth = 360 / this.toothCount;
		var sin = Math.sin(angleToothToTooth / 2 * Math.PI / 180);
		var cos = Math.cos(angleToothToTooth / 2 * Math.PI / 180);
		var fullSector = CAG.fromPoints(
			[
				[0,0],
				[-(radius * cos), radius * sin],
				[-radius, 0],
				[-(radius * cos), -radius * sin]
			]
		);
		var innerCircle = CAG.circle({center: this.center, radius: radius - (2 * this.addendum + this.clearance), resolution: this.qualitySettings.resolution});
		var sector = fullSector.subtract(innerCircle);
		
		var cutterTemplate = this._createInternalToothCutter();
		
		var pinion = this.connectedGear;
		var angleToothToTooth = 360 / pinion.toothCount;
		var stepsPerTooth = this.qualitySettings.stepsPerToothAngle;
		var angleStepSize = angleToothToTooth / stepsPerTooth;
		//OpenJsCad.log("angleToothToTooth: " + angleToothToTooth);
		//OpenJsCad.log("this.qualitySettings.stepsPerToothAngle: " + this.qualitySettings.stepsPerToothAngle);
		//OpenJsCad.log("count: " + this.qualitySettings.stepsPerToothAngle * this.toothCount / pinion.toothCount);
		//OpenJsCad.log("angleStepSize: " + angleStepSize);
		var toothShape = sector;
		var cutter = cutterTemplate.translate([-this.pitchRadius + this.connectedGear.pitchRadius, 0]);
		toothShape = toothShape.subtract(cutter);
		
		for(var i = 1; i < stepsPerTooth; i++) {
			//OpenJsCad.log("i: " + i);
			
			var pinionRotationAngle = i * angleStepSize;
			var pinionCenterRayAngle = -pinionRotationAngle * pinion.toothCount / this.toothCount;
			//OpenJsCad.log("pinionRotationAngle: " + pinionRotationAngle);
			//OpenJsCad.log("pinionCenterRayAngle: " + pinionCenterRayAngle);
			
			//var cutter = cutterTemplate;
			cutter = cutterTemplate.rotateZ(pinionRotationAngle);
			cutter = cutter.translate([-this.pitchRadius + this.connectedGear.pitchRadius, 0]);
			cutter = cutter.rotateZ(pinionCenterRayAngle);
			
			toothShape = toothShape.subtract(cutter);
			
			cutter = cutterTemplate.rotateZ(-pinionRotationAngle);
			cutter = cutter.translate([-this.pitchRadius + this.connectedGear.pitchRadius, 0]);
			cutter = cutter.rotateZ(-pinionCenterRayAngle);
			
			toothShape = toothShape.subtract(cutter);
		}
		
		return toothShape;
	}
	Gear.prototype._smoothConvexCorners = function(corners) {
		// removes single convex corners located between concave corners
		return this._smoothCorners(corners, /* removeSingleConvex= */ true);
	}
	Gear.prototype._smoothConcaveCorners = function(corners) {
		// removes single concave corners located between convex corners
		return this._smoothCorners(corners, /* removeSingleConvex= */ false);
	}
	Gear.prototype._smoothCorners = function(corners, removeSingleConvex) {
		var isConvex = [];
		var previousCorner = corners[corners.length - 1];
		var currentCorner = corners[0];
		for(var i = 0; i < corners.length; i++) {
			var nextCorner = corners[(i + 1) % corners.length];
			
			var v1 = previousCorner.minus(currentCorner);
			var v2 = nextCorner.minus(currentCorner);
			var crossProduct = v1.cross(v2);
			isConvex.push(crossProduct < 0);
			
			previousCorner = currentCorner;
			currentCorner = nextCorner;
		}
		// we want to remove any concave corners that are located between two convex corners
		var cleanedUpCorners = [];
		var previousIndex = corners.length - 1;
		var currentIndex = 0;
		for(var i = 0; i < corners.length; i++) {
			var corner = corners[currentIndex];
			var nextIndex = (i + 1) % corners.length;
			
			var isSingleConcave = (!isConvex[currentIndex] && isConvex[previousIndex] && isConvex[nextIndex]);
			var isSingleConvex = (isConvex[currentIndex] && !isConvex[previousIndex] && !isConvex[nextIndex]);
			
			previousIndex = currentIndex;
			currentIndex = nextIndex;
			if (removeSingleConvex && isSingleConvex) {
				//OpenJsCad.log("skipping single convex: " + currentIndex);
				continue;
			}
			if (!removeSingleConvex && isSingleConcave) {
				//OpenJsCad.log("skipping single concave: " + currentIndex);
				continue;
			}
			
			cleanedUpCorners.push(corner);
		}				
		
		return cleanedUpCorners;
	}
	Gear.prototype._createInternalToothCutter = function() {
		// To cut the internal gear teeth, the actual pinion comes close but we need to enlarge it so properly cater for clearance and backlash
		var pinion = this.connectedGear;
		
		var enlargedPinion = new Gear({
			circularPitch: pinion.circularPitch,
			pressureAngle: pinion.pressureAngle,
			clearance: -pinion.clearance,
			backlash: -pinion.backlash,
			toothCount: pinion.toothCount,
			centerHoleDiameter: 0,
			profileShift: pinion.profileShift,
			qualitySettings: pinion.qualitySettings
		});
		
		var tooth = enlargedPinion._createSingleTooth();
		return tooth.rotateZ(90 + 180 / enlargedPinion.toothCount); // we need a tooth pointing to the left
	}
	Gear.prototype._createRackShape = function() {
		var rack = new CAG();
		var protoTooth = this._createRackTooth();
		
		// we draw one tooth in the middle and then five on either side
		var toothCount = 41.0;
		for (var i = 0; i < toothCount; i++) {
			var tooth = protoTooth.translate([0, (0.5 + -toothCount / 2 + i) * this.circularPitch]);
			rack = rack.union(tooth);
		}
		
		// creating the bar backing the teeth
		var rightX = -(this.addendum + this.clearance);
		var width = 4 * this.addendum;
		var halfHeight = toothCount * this.circularPitch / 2;
		var bar = CAG.rectangle({corner1: [rightX - width, -halfHeight], corner2: [rightX, halfHeight]});
		rack = rack.union(bar);
		rack = rack.translate([this.addendum * this.profileShift, 0]);
		return rack;
	}
	Gear.prototype._createRackTooth = function() {
		var toothWidth = this.circularPitch / 2;
		var toothDepth = this.addendum + this.clearance;
		
		var sinPressureAngle = Math.sin(this.pressureAngle * Math.PI / 180);
		var cosPressureAngle = Math.cos(this.pressureAngle * Math.PI / 180);
		// if a positive backlash is defined then we widen the trapezoid accordingly.
		// Each side of the tooth needs to widened by a fourth of the backlash (vertical to cutter faces).
		var dx = this.backlash / 4 / cosPressureAngle;
		//OpenJsCad.log("backlash: " + this.backlash);
		//OpenJsCad.log("dx: " + dx);
		
		var leftDepth = this.addendum + this.clearance;
		var upperLeftCorner = [-leftDepth, toothWidth / 2 - dx + (this.addendum + this.clearance) * sinPressureAngle];
		var upperRightCorner = [this.addendum, toothWidth / 2 - dx - this.addendum * sinPressureAngle];
		var lowerRightCorner = [upperRightCorner[0], -upperRightCorner[1]];
		var lowerLeftCorner = [upperLeftCorner[0], -upperLeftCorner[1]];
		
		return CAG.fromPoints([upperLeftCorner, upperRightCorner, lowerRightCorner, lowerLeftCorner]);
	}
	Gear.prototype.pointsToString = function(points) {
		var result = "[";
		points.map(function(point) {
			result += "[" + point.x + "," + point.y + "],";
		});
		return result + "]";
	}
	return Gear;
})();
// GearSet class
var GearSet = (function () {
	function GearSet(gears) {
		this.gears = gears;
		this.totalWidth = 0;
		// in order for the two gears to mesh we need to turn the second one by 'half a tooth'
		//this.gear1.setAngle(0);
		//this.gearRatio = this.gear1.toothCount / this.gear1.toothCount;
	}
	GearSet.prototype.createShape = function() {
		
		var shape = new CAG();
		var previousGear = null;
		
		for(var i=0; i<this.gears.length; i++) {
			var gear = this.gears[i];
			if(!gear.show)
				continue;
			
			var gearShape = gear.getZeroedShape();
			
			if(previousGear) {
				
				var relativePitchRadius1 = (previousGear.gearType == GearType.Internal) ? - previousGear.pitchRadius : previousGear.pitchRadius;
				var relativePitchRadius2 = (gear.gearType == GearType.Internal) ? - gear.pitchRadius : gear.pitchRadius;
				
				var gearsDistance = relativePitchRadius1 + relativePitchRadius2;
				this.totalWidth += gearsDistance;
				
				if (gear.gearType == GearType.Regular) {
					// we need an angle offset of half a tooth for the two gears to mesh
					var angle = (180 + 180 / gear.toothCount);
					if(i == 3) {
						angle += 180 / gear.toothCount;
					}
					// apply gear rotation
					gearShape = gearShape.rotateZ(angle);
				}
				else if (gear.gearType == GearType.Internal) {
					// we need an angle offset of half a tooth for the two gears to mesh
					var angle = 180; // + 180 / this.gear2.toothCount;
					// apply gear rotation
					gearShape = gearShape.rotateZ(angle);
				}
				else if (gear.gearType == GearType.Rack) {
					gearShape = gearShape.rotateZ(180);
					gearShape = gearShape.translate([0, gear.circularPitch / 2]);
				}
				// move to correct center
				gearShape = gearShape.translate([this.totalWidth, 0]);
				shape = shape.union(gearShape);
			} else {
				shape = shape.union(gearShape);
			}
			
			previousGear = gear;
		}
		
		return shape;
	}
	return GearSet;
})();