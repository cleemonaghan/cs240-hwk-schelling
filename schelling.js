/**
 * Schelling's Model simulator
 * @author Colin Monaghan
 */

var boardArray;
var generations;

//initialize the board
init();
//simulate the board
Simulate();

/**
 * This method adds event listeners to the html inputs and generates the board
 */
function init() {
	// ----- add event listeners ----
	//size of the board
	let dimension = document.querySelector("#dimension");
	dimension.addEventListener("change", () => {
		randomizeBoard();
		displayBoard();
	});
	//get color1 from the inputs
	let color1 = document.querySelector("#popXcolor");
	color1.addEventListener("input", () => {
		displayBoard();
	});
	//get color2 from the inputs
	let color2 = document.querySelector("#popYcolor");
	color2.addEventListener("input", () => {
		displayBoard();
	});
	//get the % population split from the inputs
	let popRatio = document.querySelector("#popRatio");
	popRatio.addEventListener("change", () => {
		randomizeBoard();
		displayBoard();
	});
	//get the % vacant cells from the inputs
	let vacantRatio = document.querySelector("#vacantRatio");
	vacantRatio.addEventListener("change", () => {
		randomizeBoard();
		displayBoard();
	});
	//get the % vacant cells from the inputs
	let randomizeButton = document.querySelector("#randomize");
	randomizeButton.addEventListener("click", () => {
		randomizeBoard();
		displayBoard();
	});
	//
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
}

function randomizeBoard() {
	//get the inputed size of the board
	let dimension = document.querySelector("#dimension").value;
	//get color1 from the inputs
	let color1 = document.querySelector("#popXcolor").value;
	//get color2 from the inputs
	let color2 = document.querySelector("#popYcolor").value;
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
	let color1available = probOfColor1 * dimension * dimension;
	let color2available = probOfColor2 * dimension * dimension;

	//for each tile on the board, assign it a random color
	for (let i = 0; i < dimension; i++) {
		for (let j = 0; j < dimension; j++) {
			//assign the index a color
			let rand = Math.random();
			let color;
			if (rand < probOfColor1 && color1available > 0) {
				//the tile is color 1
				color = "color1";
			} else if (rand < probOfColor1 + probOfColor2 && color2available > 0) {
				//the tile is color 2
				color = "color2";
			} else {
				//the tile is empty
				color = "empty";
			}
			boardArray[i][j] = color;
		}
	}
}

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

async function Simulate() {
	//reset generations to zero
	generations = 0;
	let gen = document.querySelector("p");
	gen.innerHTML = `Generations: ${generations}`;

	//begin the loop
	while (document.querySelector("#runstop").value == "false") {
		//for (let i = 0; i < 10; i++) {
		try {
			let result = await round();
			displayBoard();
		} catch (error) {
			console.log(error);
		}
	}
}

function round() {
	return new Promise((resolve) => {
		setTimeout(() => {
			//dimension of the board
			let dim = document.querySelector("#dimension").value;
			let threshold = document.querySelector("#threshold").value;
			//list of empty tiles on the board
			const emptyTiles = new Array();
			//list of tiles to relocate to empty tiles
			const tilesToMove = new Array();
			//a boolean describing whether the board has converged to a stable state
			let converged = false;

			//iterate through every element
			for (let i = 0; i < dim; i++) {
				for (let j = 0; j < dim; j++) {
					//--- identify empty tiles -----
					if (boardArray[i][j] == "empty") {
						//add tile coordinates to the emptyTiles list
						emptyTiles.push([i, j]);
					} else {
						//--- count neighbors phase ----
						//count the number of neighbors and homogeneous neighbors
						let neighbors = 0;
						let sameColoredNeighbors = 0;

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
				}
			}

			if (tilesToMove.length == 0) converged = true;

			//for each tile in the list of tiles to be moved
			while (tilesToMove.length > 0) {
				//select a tile to relocate
				let rand = Math.floor(Math.random() * tilesToMove.length);
				let moving = tilesToMove.splice(rand, 1)[0];
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
			//examine whether any moves were made
			//if no moves were made, set runstop to true to stop the loop
			if (converged == true) {
				//we are stopped
				let runstop = document.querySelector("#runstop");
				//if false, change runstop to true
				runstop.value = "true";
				//change button to display run
				runstop.innerHTML = "Run";
			}
			resolve("success");
		}, 0);
	});
}
