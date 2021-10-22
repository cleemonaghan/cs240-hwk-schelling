/**
 * Schelling's Model simulator
 * @author Colin Monaghan
 */

var boardArray;

//initialize the board
init();

/**
 * This method adds event listeners to the html inputs and generates the board
 */
function init() {
	// ----- add event listeners ----
	//size of the board
	let dimension = document.querySelector("#dimension");
	dimension.addEventListener("change", () => {
		console.log("yes");
		randomizeBoard();
		displayBoard();
	});
	//get color1 from the inputs
	let color1 = document.querySelector("#popXcolor");
	color1.addEventListener("change", () => {
		updateBoardColors();
		displayBoard();
	});
	//get color2 from the inputs
	let color2 = document.querySelector("#popYcolor");
	color2.addEventListener("change", () => {
		updateBoardColors();
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

	// ----- generate the board ----
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

function updateBoardColors() {}

function randomizeBoard() {
	//Fix!!!  needs to generate array with larger or smaller dimension

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
				color = color1;
			} else if (rand < probOfColor1 + probOfColor2 && color2available > 0) {
				//the tile is color 2
				color = color2;
			} else {
				//the tile is empty
				color = "rgb(255, 255, 255)";
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
			tile.style = `background-color:${boardArray[i][j]}`;
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
