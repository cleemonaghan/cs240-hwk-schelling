/**
 * Schelling's Model simulator
 * @author Colin Monaghan
 */

//initialize the board
updateBoard();

/**
 * This method gathers the inputs and generates the board
 */
function updateBoard() {
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

	//generate the board
	generateBoard(dimension, color1, color2, popRatio, vacantRatio);
}

function generateBoard(dimension, color1, color2, popRatio, vacantRatio) {}
