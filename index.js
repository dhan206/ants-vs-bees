'use strict';

var ants = require('./lib/ants_ui.js'); //load the game (UI-level) to interact with it

if(process.argv[2] === '--debug'){
  //the scenario to play
  var colony = ants.AntColony.createTestColony();
  var hive = ants.Hive.createTestHive();
  var game = new ants.AntGame(colony, hive);
  
  //run hard-coded commands
  game.deployAnt("Grower", "0,0");
  game.deployAnt("Bodyguard", "0,0");
  game.deployAnt("Bodyguard", "0,1");
  game.deployAnt("Scuba", "0,1");
  game.deployAnt("Queen", "0,2");
  game.deployAnt("Queen", "0,3");
  //ants.showMapOf(game); //show the board, for example


  ants.play(game); //launch the interactive version from here

}
else {
  //initialize the game to play (not interactively selected yet)
  var colony = ants.AntColony.createTestColony();
  var hive = ants.Hive.createTestHive();
  var game = new ants.AntGame(colony, hive);

  //start playing the game
  ants.play(game); 
}