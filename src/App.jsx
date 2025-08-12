import { useState } from "react";
import "./App.css";
import { quizData, sortedListAnswers } from "./Assets/quiz";
import Random from "./Utilities/Random";
import Select from "react-select";
import { selectCustomStyles } from "./Utilities/SelectReactSetting";

function App() {
  //set up the state for the current question and answer
  const [gameData, setGameData] = useState({ Q: "Start", A: "Start" });
  // State to hold the users current question and answer
  const [answer, setAnswer] = useState("");
  //state for win or lose message
  const [winlose, setWinlose] = useState("");

  //get all data for length
  const allData = quizData;
  //get a random index for the quiz question
  const getRandomIndex = Random(allData.length);
  //sorted answers to display in the dropdown
  const answerData = sortedListAnswers();

  //variables to pass data in the game
  let answerLet;
  let gameDataForConsoleLogOnly = { Q: "Start", A: "Start" };

  const onClickHandlerNewGame = () => {
    //reset the answer
    setAnswer("");
    //reset the winlose message
    setWinlose("");

    // This will ensure a new question is selected each time
    let rand = Random(allData.length); // Get a new random index
    // Set the new question and answer using the random index
    setGameData({ Q: allData[rand].Q, A: allData[rand].A });
    // Store the question and answer in a temporary variable
    // This is useful for debugging or further processing
    gameDataForConsoleLogOnly = { Q: allData[rand].Q, A: allData[rand].A };
    // Log for debugging
    console.log("rand", rand);
    console.log("gameData Q= ", gameData.Q + " A= " + gameData.A);
    console.log("gameDataLet Q= ", gameDataForConsoleLogOnly.Q + " A= " + gameDataForConsoleLogOnly.A);
  };

  // When the user selects an answer from the dropdown
  const handleAnswerChange = (e) => {
    setAnswer(e.value); // Update the answer state
    answerLet = e.value; // Store the answer in a variable
    setWinlose("- you " + winLoseCalc(answerLet)); // Set win/lose message
    // Log for debugging
    console.log("answer = ", answerLet + "  gameplay = " + gameData.A);
  };

  // Function to check if the answer is correct
  const winLoseCalc = (answerLet) => {
    if (answerLet !== "undefined") {
      if (answerLet === gameData.A) {
        return "win"; // Correct answer
      } else {
        return "lose"; // Wrong answer
      }
    }
  };

  return (
    // Main container with padding
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        {/* Responsive column for the card */}
        <div className="col-12 col-md-10 col-lg-12">
          <div className="card shadow">
            <div className="card-body">
              {/* Button to get a new random question */}
              <button className="btn btn-primary mb-4 w-100 display-4" onClick={onClickHandlerNewGame}>
                Choose a Random Question
              </button>
              {/* Show the question and result */}
              <div className="mb-4 text-center">
                <h2 className="display-4">{gameData.Q}</h2>
                <h4 className="fs-3 mt-3">{answer ? "You selected " + answer + winlose : ""}</h4>
              </div>
              {/* Dropdown for selecting an answer */}
              <div>
                <Select
                  styles={selectCustomStyles}
                  options={answerData}
                  className="selectDropDownStyle"
                  value={answerData.find((opt) => opt.value === answer) || null}
                  onChange={handleAnswerChange}
                  placeholder={answer !== "" ? answer : "Select an Answer"}
                  controlShouldRenderValue={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
