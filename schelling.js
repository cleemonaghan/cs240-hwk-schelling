/**
 * Schelling's Model simulator
 * @author Colin Monaghan
 */

//the global variable containing the values of the board
var boardArray;

//initialize the board
init();

/**
 * This method adds event listeners to the html inputs
 * and runs the functions to generate the board
 */
function init() {
	// ----- add event listeners ----

	//Add event listeners to the dimension slider
	let dimension = document.querySelector("#dimension");
	dimension.addEventListener("change", () => {
		randomizeBoard();
		displayBoard();
	});
	dimension.addEventListener("input", () => {
		//update display for slider
		let dimensionDisplay = document.querySelector("#dimensionDisplay");
		dimensionDisplay.innerHTML = dimension.value;
	});

	//Add event listeners to the similarity threshold slider
	let threshold = document.querySelector("#threshold");
	threshold.addEventListener("input", () => {
		//update display for slider
		let thresholdDisplay = document.querySelector("#thresholdDisplay");
		thresholdDisplay.innerHTML = threshold.value;
	});

	//Add event listeners to the % vacant cells input box
	let vacantRatio = document.querySelector("#vacantRatio");
	vacantRatio.addEventListener("input", () => {
		randomizeBoard();
		displayBoard();
	});

	//Add event listeners to the % Population split slider
	let popRatio = document.querySelector("#popRatio");
	popRatio.addEventListener("change", () => {
		randomizeBoard();
		displayBoard();
	});
	popRatio.addEventListener("input", () => {
		//update display for slider
		let popRatioDisplay = document.querySelector("#popRatioDisplay");
		popRatioDisplay.innerHTML = popRatio.value;
	});

	//Add event listeners to the Population 1 color picker
	let color1 = document.querySelector("#popXcolor");
	color1.addEventListener("input", () => {
		displayBoard();
	});

	//Add event listeners to the Population 2 color picker
	let color2 = document.querySelector("#popYcolor");
	color2.addEventListener("input", () => {
		displayBoard();
	});

	//Add event listeners to the randomize button
	let randomizeButton = document.querySelector("#randomize");
	randomizeButton.addEventListener("click", () => {
		randomizeBoard();
		displayBoard();
	});

	//Add event listeners to the run/stop button
	let runstop = document.querySelector("#runstop");
	runstop.addEventListener("click", () => {
		if (runstop.value == "true") {
			//we are running
			//if true, change it to false
			runstop.value = "false";
			//change button to display stop
			runstop.innerHTML = "Stop";
			//begin running the simulation
			Simulate();
		} else {
			//we are stopped
			//if false, change it to true
			runstop.value = "true";
			//change button to display run
			runstop.innerHTML = "Run";
		}
	});

	//initialize generations
	generations = 0;

	// ----- initialize the board ----
	//get the inputed size of the board
	let dim = dimension.value;

	//initalize the board
	boardArray = new Array(dim);
	for (let i = 0; i < dim; i++) {
		boardArray[i] = new Array(dim);
	}

	//randomize the tiles of the board
	randomizeBoard();
	//display the board
	displayBoard();
	//simulate the board
	Simulate();
}

/**
 * This method randomly assigns values to the tiles on the board
 * according to the dimension, population ratio, and vacancy ratio
 * inputed.
 */
function randomizeBoard() {
	//get the inputed size of the board
	let dimension = document.querySelector("#dimension").value;
	//get the % population split from the inputs
	let popRatio = document.querySelector("#popRatio").value;
	//get the % vacant cells from the inputs
	let vacantRatio = document.querySelector("#vacantRatio").value;

	//check if we need to reallocate space in boardArray
	if (dimension != boardArray.length) {
		//reallocate space for boardArray
		boardArray = new Array(dimension);
		for (let i = 0; i < dimension; i++) {
			boardArray[i] = new Array(dimension);
		}
	}

	//create variables for probability and availablity for each color
	let probOfColor1 = (1 - vacantRatio) * popRatio;
	let probOfColor2 = (1 - vacantRatio) * (1 - popRatio);
	let color1available = Math.floor(probOfColor1 * dimension * dimension);
	let color2available = Math.floor(probOfColor2 * dimension * dimension);

	//for each tile on the board, assign it a random color
	for (let i = 0; i < dimension; i++) {
		for (let j = 0; j < dimension; j++) {
			//assign the index a color
			let rand = Math.random();
			let color;
			if (rand < probOfColor1 && color1available > 0) {
				//the tile is color 1
				color = "color1";
				color1available--;
			} else if (rand < probOfColor1 + probOfColor2 && color2available > 0) {
				//the tile is color 2
				color = "color2";
				color2available--;
			} else {
				//the tile is empty
				color = "empty";
			}
			boardArray[i][j] = color;
		}
	}
}

/**
 * This function manipulates the index.html DOM to
 * display the contents of the board to the screen.
 *
 * The board is "printed" as a table element with
 * each tile as a td element of the table.
 */
function displayBoard() {
	// create a new table element
	const newTable = document.createElement("table");

	//add each row to the board
	for (let i = 0; i < boardArray.length; i++) {
		//create the row element
		let row = document.createElement("tr");
		//add each tile in the row
		for (let j = 0; j < boardArray.length; j++) {
			//create the tile element
			let tile = document.createElement("td");
			//determine the color
			if (boardArray[i][j] == "empty")
				tile.style = `background-color:rgb(255,255,255)`;
			else if (boardArray[i][j] == "color1")
				tile.style = `background-color:${
					document.querySelector("#popXcolor").value
				}`;
			else if (boardArray[i][j] == "color2")
				tile.style = `background-color:${
					document.querySelector("#popYcolor").value
				}`;
			// add the tile element to the row
			row.appendChild(tile);
		}
		// add the row element to the table
		newTable.appendChild(row);
	}

	// replace the old board with the new board
	const parent = document.getElementById("board");
	parent.replaceChildren(newTable);
}

/**
 * This function asynchronously runs the simulation until
 * the board converges to a stable state.
 */
async function Simulate() {
	//reset generations to zero
	var generations = 0;
	let gen = document.querySelector("p");
	gen.innerHTML = `Generations: ${generations}`;

	//begin the loop
	while (document.querySelector("#runstop").value == "false") {
		//retrieve the dimension of the board at the current moment
		let dimension = document.querySelector("#dimension").value;
		//asynchronously play a round
		await round(dimension);
		//display the baord
		displayBoard();
	}
}

/**
 * This function creates and returns a promise that simulates a generation.
 * The promise interates through every tile of boardArray, identifying empty
 * tiles and tiles that need to be relocated. Then it swaps every tile that
 * needs to be relocated with an empty tile, increments the generations variable,
 * and determines if the board has converged before it returns.
 *
 * @param {integer} dim the length of the board
 * @returns a promise that simulates a generation
 */
function round(dim) {
	return new Promise((resolve, reject) => {
		//set a 1 second delay between generations
		setTimeout(() => {
			try {
				//list of empty tiles on the board
				const emptyTiles = new Array();
				//list of tiles to relocate to empty tiles
				const tilesToMove = new Array();

				//iterate through every element
				for (let i = 0; i < dim; i++) {
					for (let j = 0; j < dim; j++) {
						//identify empty tiles
						if (boardArray[i][j] == "empty") {
							//add tile coordinates to the emptyTiles list
							emptyTiles.push([i, j]);
						} else {
							//count the number of neighbors at the given (i,j) coordinate
							//and add it to tilesToMove if it needs to be relocated
							countNeighbors(tilesToMove, i, j, dim);
						}
					}
				}

				//if there are no tiles to move, we have converged
				//so set runstop to true to stop the loop
				if (tilesToMove.length == 0) {
					//we are stopped
					let runstop = document.querySelector("#runstop");
					//if false, change runstop to true
					runstop.value = "true";
					//change button to display run
					runstop.innerHTML = "Run";
				}

				//relocate each tile in the list of tiles to be moved
				while (tilesToMove.length > 0) {
					//select a tile to relocate
					let moving = tilesToMove.pop();
					let x = moving[0];
					let y = moving[1];
					//select a home for the tile to move to
					rand = Math.floor(Math.random() * emptyTiles.length);
					let newHome = emptyTiles.splice(rand, 1)[0];
					//swap the tile with an empty tile
					boardArray[newHome[0]][newHome[1]] = boardArray[x][y];
					boardArray[x][y] = "empty";
					//add the new empty tile to the empty tile list
					emptyTiles.push([x, y]);
				}

				//increment the number of generations
				generations++;
				let gen = document.querySelector("p");
				gen.innerHTML = `Generations: ${generations}`;

				//resolve the promise
				resolve("success");
			} catch (err) {
				//if there was an error, reject the promise
				reject(err);
			}
		}, 100);
	});
}

/**
 * This function counts the number of neighbors at the given (i,j) coordinate
 * and, if there ratio of (homogeneous neighbors/total neighbors) is greater
 * than the inputed threshold, the coordinate is added to tilesToMove as it
 * needs to be relocated.
 *
 * @param {Array} tilesToMove the list of tiles to relocate in this generation
 * @param {integer} i the x coordinate
 * @param {integer} j the y coordinate
 * @param {integer} dim the length of the board
 */
function countNeighbors(tilesToMove, i, j, dim) {
	//the threshold of minimum homogeneous neighbors to total neighbors
	let threshold = document.querySelector("#threshold").value;
	//the total number of neighbors of the given coordinate
	let neighbors = 0;
	//the total number of homogeneous neighbors of the given coordinate
	let sameColoredNeighbors = 0;

	//count the number of neighbors and homogeneous neighbors at the given i,j coordinate
	if (i != 0) {
		//if we are not in the top row, count the neighbors above us
		let x = boardArray[i - 1][j];
		if (x != "empty") neighbors++;
		if (x == boardArray[i][j]) sameColoredNeighbors++;
		//check the neighbor up-left
		if (j != 0) {
			x = boardArray[i - 1][j - 1];
			if (x != "empty") neighbors++;
			if (x == boardArray[i][j]) sameColoredNeighbors++;
		}
		//check the neighbor up-right
		if (j != dim - 1) {
			x = boardArray[i - 1][j + 1];
			if (x != "empty") neighbors++;
			if (x == boardArray[i][j]) sameColoredNeighbors++;
		}
	}
	if (i != dim - 1) {
		//if we are not in the bottom row, count the neighbors below us
		let x = boardArray[i + 1][j];
		if (x != "empty") neighbors++;
		if (x == boardArray[i][j]) sameColoredNeighbors++;
		//check the neighbor up-left
		if (j != 0) {
			x = boardArray[i + 1][j - 1];
			if (x != "empty") neighbors++;
			if (x == boardArray[i][j]) sameColoredNeighbors++;
		}
		//check the neighbor up-right
		if (j != dim - 1) {
			x = boardArray[i + 1][j + 1];
			if (x != "empty") neighbors++;
			if (x == boardArray[i][j]) sameColoredNeighbors++;
		}
	}
	//check the neighbor left
	if (j != 0) {
		x = boardArray[i][j - 1];
		if (x != "empty") neighbors++;
		if (x == boardArray[i][j]) sameColoredNeighbors++;
	}
	//check the neighbor right
	if (j != dim - 1) {
		x = boardArray[i][j + 1];
		if (x != "empty") neighbors++;
		if (x == boardArray[i][j]) sameColoredNeighbors++;
	}

	//determine whether it moves to a random vacant location
	//check the sameColoredNeighbors/neighbors against the threshold
	if (sameColoredNeighbors / neighbors < threshold) {
		//add the tile to the list of tiles to be moved
		tilesToMove.push([i, j]);
	}
}
