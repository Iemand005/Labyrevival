var vectorScale = function (vec, scalar) {
	return [vec[0] * scalar, vec[1] * scalar];
}

var vectorAdd = function (vec1, vec2) {
	return [vec1[0] + vec2[0], vec1[1] + vec2[1]];
}

var vectorMult = function (vec1, vec2) {
	return [vec1[0] * vec2[0], vec1[1] * vec2[1]];
}

var vectorSub = function (vec1, vec2) { return [vec1[0] - vec2[0], vec1[1] - vec2[1]];}

var vectorCpy = function (vec) { return [vec[0], vec[1]] };

var vectorEq = function (vec1, vec2) { return (vec1[0] === vec2[0]) && (vec1[1] === vec2[1]) }

var vectorDist = function (vec1, vec2) { 
	var diffvec0 = vec2[0] - vec1[0];
    var diffvec1 = vec2[1] - vec1[1];
	return Math.sqrt(diffvec0 * diffvec0 + diffvec1 * diffvec1);
}

var vectorLen = function (vec) { 
	return vectorDist(vec, [0,0]);
}

var vectorDot = function (vec1, vec2) { return vec1[0] * vec2[0] + vec1[1] * vec2[1]; }

var vectorUnit = function (vec) {
    var len = vectorLen(vec);
    return [vec[0] / len, vec[1] / len];
}