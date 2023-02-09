export const cloneCube = cube => ({
	U: cube.U.map(row => row.map(cell => cell)),
	L: cube.L.map(row => row.map(cell => cell)),
	F: cube.F.map(row => row.map(cell => cell)),
	R: cube.R.map(row => row.map(cell => cell)),
	B: cube.B.map(row => row.map(cell => cell)),
	D: cube.D.map(row => row.map(cell => cell)),
});
