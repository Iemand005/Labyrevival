

/// <summary>
///     Get the sign (-1, +1, or 0) of a number
/// </summary>
/// <param name="number">
///     The number
/// </param>
/// <returns>
///     -1, +1, or 0
/// </returns>

var sign = function (number) {
	if (number === 0) return 0;
	else if (number < 0) return -1;
	return 1;
}

/// <summary>
///     Determine whether a line and a circle intersect
/// </summary>
/// <param name="A">
///     First point of the line as an [x,y] tuple
/// </param>
/// <param name="B">
///     Second point of the line as an [x,y] tuple
/// </param>
/// <param name="center">
///     Center of circle as an [x,y] tuple
/// </param>
/// <param name="radius">
///     Radius of circle
/// </param>
/// <returns>
///     0 if they do not intersect, or the distance from the intersection center to the edge of the circle if they do.
/// </returns>

var lineCircleIntersect = function (A, B, center, radius) {
		
			var dispAB = vectorSub(B, A);
			var dispCB = vectorSub(B, center);
			var dispAC = vectorSub(A, center);

			var lenAB = vectorDist(A, B);
			var lenCB = vectorDist(B, center);
			var lenAC = vectorDist(A, center);
			
			var widthB = Math.abs(vectorDot(dispAB, dispCB) / lenAB);
			var widthC = Math.abs(vectorDot(dispAB, dispAC) / lenAB);
			
			if (Math.max(widthB, widthC) > lenAB) //height never reached
			{
				height = Math.min(lenCB, lenAC);
			}
			else
			{
				height = Math.sqrt(lenCB * lenCB - widthB * widthB); 
			}
			

			if (height < radius) return radius - height;
			return 0;
         

}

/// <summary>
///     Determine whether a point is inside a rectangle
/// </summary>
/// <param name="pos">
///     Top left corner of the rectangle as an [x,y] tuple
/// </param>
/// <param name="dim">
///     Size of the rectangle as an [x,y] tuple
/// </param>
/// <param name="point">
///     Point being tested as an [x,y] tuple
/// </param>
/// <returns>
///     True if the point is inside the rectangle, false if it isn't.
/// </returns>
var pointInRect = function(pos, dim, point)
{
	return (point[0] >= pos[0]) && (point[1] >= pos[1]) && (point[0] <= (pos[0] + dim[0])) && (point[1] <= (pos[1] + dim[1]));
}

/// <summary>
///     Calculate the top-left corner and size of the bounding rectangle of a circle
/// </summary>
/// <param name="center">
///     Center of the circle as an [x,y] tuple
/// </param>
/// <param name="radius">
///     Radius of the cirlce
/// </param>
/// <returns>
///     A tuple of [pos, dim], each as an [x,y] tuple.
/// </returns>
function calcPosDim(center, radius) {
                return [vectorSub(center, [radius, radius]), [2*radius, 2*radius]];
}