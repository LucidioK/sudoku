/**
 * @author Lucidio Kuhn
 */
"use strict";

class IntMatrix
{
	constructor(w,h)
	{
		this.width = w;
		this.height = h;
		this.m = new Array(h);
		for (var i = 0; i < h; i++)
		{
			this.m[i] = new Array(w);
			for (var j = 0; j < w; j++)
			{
				this.m[i][j] = [0];
			}
		}
	}
	
	valuesAt(i,j)
	{
		return this.m[i][j];
	}
	
	addTo(i,j,value)
	{
		this.m[i][j].push(value);
	}
	
	removeValue(i,j,value)
	{
		var index = this.m[i][j].indexOf(value);
		if (index >= 0)
		{
			this.m[i][j].splice(index, 1);
		}
	}
}

var im = new IntMatrix(9,9);


