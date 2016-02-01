'use strict';

/**
 * Represents an insect (e.g., an Ant or a Bee) in the game
 * This class should be treated as abstract
 */
class Insect {
  constructor(armor, place, actBehavior, waterSafeBehavior, reduceArmorBehavior) {
    this._armor = armor;
    this._place = place;
    this.actBehavior = actBehavior;
    this.waterSafeBehavior = waterSafeBehavior;
    this.reduceArmorBehavior = reduceArmorBehavior;
  }
  
  get armor() {
    return this._armor;
  }

  reduceArmor(amount) {
      if(this.reduceArmorBehavior) {
          this.reduceArmorBehavior.reduceArmor(amount, this);
      }
  }
  
  get watersafe() {
      if(this.waterSafeBehavior) {
          return this.waterSafeBehavior.watersafe;
      }  
  }

  get place(){
    return this._place;
  }
  
  set place(place){
    if(place === undefined){ //if being removed
      this._place._removeInsect(this);
      this._place = undefined;
    }
    else if(place._addInsect(this)){ //try to go to new place
      if(this._place !== undefined){
        this._place._removeInsect(this); //leave old place
      }
      this._place = place; //save our new location
    }
  }
  
  act(colony) { 
      if(this.actBehavior) {
          this.actBehavior.act(this, colony);
      }
  } //the abstract act method (composite pattern)
  
  toString() {
    return this.name + '('+(this.place ? this.place.name : '')+')';
  }
}

/**
 * Represents a Bee (the antagonist!)
 */
class Bee extends Insect {
  constructor(armor, place, actBehavior, waterSafeBehavior, reduceArmorBehavior){
    super(armor, place, actBehavior, waterSafeBehavior, reduceArmorBehavior);
    this.name = 'Bee';
    this._damage = 1;
  }
  
  sting(ant){
    console.log(this+ ' stings '+ant+'!');
    ant.reduceArmor(this._damage);
  }
  
  get blocked() {
      if(this.place.ant !== undefined) { // enters if an ant is in place
          return !this.place.ant.invisible; // returns whether the ant is visible or not
      }
      return false; // otherwise, not blocked
  }
}

/**
 * A class representing a basic Ant.
 * This class should be treated as abstract
 */
class Ant extends Insect {
  constructor(armor, cost, actBehavior, invisiblebehavior, waterSafeBehavior, reduceArmorBehavior, containerBehavior, place){
    super(armor, place, actBehavior, waterSafeBehavior, reduceArmorBehavior);
    this._name = 'Ant'; //for display
    this._foodCost = cost;
    this._damage = 3; // default ant damage
    this.invisiblebehavior = invisiblebehavior;
    this.containerBehavior = containerBehavior;
    this._containedAnt; //default to undefined
  }
  
  get foodCost() {
    return this._foodCost;
  }
  
  get name() {
    return this._name;
  }
  
  get invisible() {
      if(this.invisiblebehavior) {
          return this.invisiblebehavior.invisible;
      }
  }
  
  get container() {
      if(this.containerBehavior) {
          return this.containerBehavior.container;
      }
  }
  
  get contained() {
      return this._containedAnt;
  }
  
  set contained(ant) {
      if(this.containerBehavior.container) {
          this._containedAnt = ant;
      }
  }
}


/**
 * Represents a location in the game
 */
class Place {
  constructor(name, exit, entrance) {
    this.name = name;
    this._bees = [];
    this._ant = undefined; //placeholder for code clarity
    this.exit = exit;
    this.entrance = entrance;
    this._water = false; // places default to tunnels
  }
  
  _addInsect(insect){
    if(insect instanceof Bee){
      this._bees.push(insect);
      return true;
    }
    else if(this._ant === undefined){
      this._ant = insect;
      return true;
    }
    else {
      return false; //could not add insect
    }
  }
  
  _removeInsect(insect){
    if(insect instanceof Bee){
      var index = this._bees.indexOf(insect);
      if(index >= 0){
        this._bees.splice(index,1);
      }
    }
    else {
      this._ant = undefined;
    }

  }
  
  get ant() { 
    return this._ant; 
  }
  
  get bees() {
    return this._bees;
  }
  
  //Returns a nearby bee, between the minDistance and the maxDistance ahead. 
  //If multiple bees are the same distance, a random bee is chosen
  getClosestBee(minDistance, maxDistance) {
		var p = this;
		for(var dist = 0; p!==undefined && dist <= maxDistance; dist++)
		{
			if(dist >= minDistance && p.bees.length > 0) {
				return p.bees[Math.floor(Math.random()*p.bees.length)]; //pick a random bee
      }
			p = p.entrance;
		}
		return undefined; //no bee found
  }
  
  get water() { // to check if water type
      return this._water;
  }
  
  set water(water) { // to set the place to water
      this._water = water;
  }

  toString() {
    return `Place[$(this.name)]`;
  }
}

/**
 * An entire colony of ants and their tunnels
 */
class AntColony {
  constructor(startingFood, numTunnels, tunnelLength, moatFrequency){
    var MAX_TUNNEL_LENGTH = 8;
    tunnelLength = Math.min(tunnelLength, MAX_TUNNEL_LENGTH); //respect the max-length
    
    this._food = startingFood;

    this._places = []; //2d-array storage for easy access
    this._beeEntrances = [];
    this._queenPlace = new Place('Ant Queen');
    
    //sets up a tunnels, which are linked-lists of places
    var prev, curr, typeName;
    for(var tunnel=0; tunnel < numTunnels; tunnel++) {
        curr = this._queenPlace; //start the tunnels at the queen
        this._places[tunnel] = [];
        for(var step=0; step < tunnelLength; step++) {
            //water or not?
            typeName = 'tunnel';
            if(moatFrequency !== 0 && (step+1)%moatFrequency === 0){ //if we have moats and we're on a moat count (starting at 1)
                typeName = 'water';
            }
			
            prev = curr; //keep track of the previous guy (who we will exit to)
            var locationId = tunnel+','+step; //location id string
            curr = new Place(typeName+'['+locationId+']', prev); //create new place with an exit that is the previous spot
            
            if (typeName == 'water') { // makes the current place a moat if the type is water
                curr.water = true; 
            }
            
            prev.entrance = curr; //the previous person's entrance is the new spot
            this._places[tunnel][step] = curr; //keep track of new place
        }
			this._beeEntrances.push(curr); //current place is last item in the tunnel, so mark that it is a bee entrance
    } //loop to next tunnel
  }
  
  get food() {
    return this._food;
  }
  
  increaseFood(amount){
    this._food += amount;
  }
  
  //returns a 2d-array of the places
  get places() {
    return this._places;
  }
  
  get entrances() {
    return this._beeEntrances;
  }
  
  get queenPlace() {
    return this._queenPlace;
  }
  
  get queenHasBees() {
    return this._queenPlace.bees.length > 0;
  }

  deployAnt(place, ant){
    if(this._food >= ant.foodCost){
        if(!place.water || place.water === ant.watersafe ) {
            this._food -= ant.foodCost;
            ant.place = place; //assign the ant
            return ant.place === place; //return if could place the ant
        } else {
            return false; //could not place the ant
        }
    }
    else {
      return false; //could not place the ant, insuffient food
    }
  }
  
  removeAnt(place){
    place.ant = undefined;
  }
  
  //return all ants currently in the colony
  get allAnts() {
    var ants = [];
    for(var i=0; i<this._places.length; i++){
      for(var j=0; j<this._places[i].length; j++){
        if(this._places[i][j].ant !== undefined){
          ants.push(this._places[i][j].ant);
        }
      }
    }
    return ants;
  }
  
  //return all bees currently in the colony
  get allBees() {
    var bees = [];
    for(var i=0; i<this._places.length; i++){
      for(var j=0; j<this._places[i].length; j++){
        bees = bees.concat(this._places[i][j].bees);
      }
    }
    return bees;    
  }
  
  //Creates a default starting colony
  static createDefaultColony() {
    return new AntColony(2, 1,8,0);
  }

  //Creates a testing colony with extra food
  static createTestColony() {
    return new AntColony(10, 1,8,0);
  }

  //Creates a full colony with 3 tunnels
  static createFullColony() {
    return new AntColony(2, 3,8,0);
  }

  //Creates a full colony with three tunnels and moats
  static createWetColony() {
    return new AntColony(10, 3,8,3);
  }
}



class Hive extends Place {
  constructor(beeArmor){
    super('Hive');
    this._beeArmor = beeArmor;
    this._waves = {};
  }

  //Adds a wave of attacking bees to this hive
  addWave(attackTurn, numBees){
    var wave = [];
    for(var i=0; i<numBees; i++){
      var bee = new Bee(this._beeArmor, this, new BeeStrategy(), new WatersafeStrategy(), new DefaultReduceArmor()); // default watersafe
      wave.push(bee);
      bee.place = this;
      this._bees.push(bee); //explicitly position the bee; workaround for bug(?)
    }
    this._waves[attackTurn] = wave;
    return this;
  }
  
  //Moves in the invaders who are attacking the colony on the given turn
  invade(colony, time){
    if(this._waves[time] !== undefined){
      this._waves[time].forEach(function(bee){
        var randEntrance = Math.floor(Math.random()*colony.entrances.length);
        bee.place = colony.entrances[randEntrance];       
      });
      return this._waves[time]; //return list of new bees
    }
    else{
      return []; //no bees attacking 
    }    
  }
  
  //Creates a hive with two attacking bees
  static createTestHive() {
    var hive = new Hive(3)
              .addWave(2,1)
              .addWave(3,1);
    return hive;
  }
  
  //Creates a hive filled with attacking bees
  static createFullHive() {
    var hive = new Hive(3)
              .addWave(2,1);
    for(var i=3; i<15; i+=2){
      hive.addWave(i, 1);
    }
    hive.addWave(15,8);
    return hive;
  }
  
  //Creates a hive filled with a huge number of powerful attacking bees
  static createInsaneHive() {
    var hive = new Hive(4)
              .addWave(1,2);
    for(var i=3; i<15; i+=2){
      hive.addWave(i, 1);
    }
    hive.addWave(15,20);
    return hive;
  }  
}


class AntGame {
  constructor(colony, hive){
    this._colony = colony;
    this._hive = hive;
    this._turn = 0;
  }
  
  //execute a turn
  takeTurn() {
    //all ants take a turn
    this._colony.allAnts.forEach(function(ant){
      ant.act(this._colony); //pass in colony reference if needed
    }, this);
    
    //all bees take a turn
    this._colony.allBees.forEach(function(bee){
      bee.act();
    }, this);
    
    //new bees arrive
    this._hive.invade(this._colony, this._turn);
    
    //turn finished
    this._turn++;    
  }

  get turn() {
    return this._turn;
  }

  //returns true if the game is won, false if lost, and undefined if ongoing
  get gameWon() {
    if(this._colony.queenHasBees){ //queen has been reached
      return false; //we won!
    }
    else if(this._colony.allBees.length + this._hive.bees.length === 0){ //no more bees!
      return true; //we won!
    }
    
    return undefined; //ongoing
  }

  //User control: deploy an ant of the given type
  //@param antType should be a String (subclass name)
  //@param placeName should be a String (form: "0,1" [tunnel,step])
  deployAnt(antType, placeName){
    try{ //brute force error catching
      var loc = placeName.split(',');
      var place = this._colony._places[loc[0]][loc[1]];
      var ant = new Ants[antType]();
      return this._colony.deployAnt(place, ant);
      //return true; //success
    }catch(e){
      return false; //error = failure
    }
  }

  //User control: remove an ant from the given place
  //@param placeName should be a String (form: "0,1" [tunnel,step])
  removeAnt(placeName){
    try { //brute force error catching
      var loc = placeName.split(',');
      var place = this._colony._places[loc[0]][loc[1]];
      place.ant.place = undefined; //take ant who was there and have him leave (circular)
      return true; //success
    }catch(e){
      return false; //error = failure
    }
  }
  
  get colony(){
    return this._colony;
  }
  
  get hive(){
    return this._hive;
  }
  
}

class NoactStrategy {
    act() { } // Empty act
}

class IncreaseFoodStrategy {
    act(ant, colony) {
        colony.increaseFood(1);
    }
}

class ThrowLeavesStrategy {
    act(ant) {
        var target = ant.place.getClosestBee(0,3);
        if(target){
            console.log(ant + ' throws a leaf at '+target);
            target.reduceArmor(ant._damage);
        }      
    }  
}

class EatDigestStrategy {
    act(ant) {
        if (ant._stomach > 0) { // condition for digestion
            console.log(ant + " is digesting, " + ant._stomach + " more turns to go");
            ant._stomach--; // digest each turn
        } else { // empty stomach, eat a bee
            var target = ant.place.getClosestBee(0,0);
            if (target) {
                console.log(ant + " has eaten " + target);
                target.reduceArmor(target.armor);
                ant._stomach = 3; // full stomach value
            }
        }
    }
}

class NinjaStrategy {
    act(ant) {
        var bees = ant.place.bees;
        if(bees) {
            bees.forEach(function(bee) {
                console.log(ant + " ninja kicks " + bee);
                bee.reduceArmor(ant._damage);
            }, ant)
        }
    }
}

class BeeStrategy {
    act(bee) {
        if(bee.blocked){
            bee.sting(bee.place.ant);
        }
        else if(bee.armor > 0) {
            bee.place = bee.place.exit;
        }
    }
}

class InvisibleStrategy {
    get invisible() {
        return true;
    }
}

class VisibleStrategy {
    get invisible() {
        return false;
    }
}

class WatersafeStrategy {
    get watersafe() {
        return true;
    }
}

class NotwatersafeStrategy {
    get watersafe() {
        return false;
    }
}

class DefaultReduceArmor { // concrete component for reducearmor
    reduceArmor(amount, insect) {
        insect._armor -= amount;
        if(insect._armor <= 0){
            console.log(insect.toString()+' ran out of armor and expired');
            insect.place = undefined;
        }
    }
}

class MartyrdomStrategy { // a concrete decorator for fire ant's reducearmor features
    constructor(reduceArmor) {
        this._reduceArmor = reduceArmor;
    }
    
    reduceArmor(amount, insect) {
        if (insect.armor - amount <= 0) {
            var bees = insect.place.bees;
            bees.forEach(function(bee) {
                console.log(insect + " burns " + bee + "!");
                bee.reduceArmor(insect._damage);
            }, insect);
        }
       this._reduceArmor.reduceArmor(amount, insect); //calls the parent/concrete reduce armor for its functionality
    }
}

class ContainerStrategy {
    get container() {
        return true;
    }
}

class NotContainerStrategy {
    get container() {
        return false;
    }
}

/*************
 * ANT TYPES *
 *************/

//an object to hold subclasses / give them specific namespaces
var Ants = {
  //grower type
  Grower : class extends Ant {
      constructor() {
          super(1,2, new IncreaseFoodStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = 'Grower';
      }
  },
  
  //thrower type
  Thrower : class extends Ant {
      constructor()  {
          super(1,4, new ThrowLeavesStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = 'Thrower';
          this._damage = 1;
      }
  },
  //wall type
  Wall : class extends Ant {
      constructor() {
          super(4,4, new NoactStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = 'Wall';
      }
  },
  //hungry type
  Hungry : class extends Ant {
      constructor() {
          super(1,4, new EatDigestStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = 'Hungry';
          this._stomach = 0; // empty stomach value
      }
  },
  //fire type
  Fire : class extends Ant {
      constructor() {
          super(1,4, new NoactStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new MartyrdomStrategy(new DefaultReduceArmor()), new NotContainerStrategy());
          this._name = 'Fire';
      }
  },
  //scuba type
  Scuba : class extends Ant {
      constructor() {
          super(1,5, new ThrowLeavesStrategy(), new VisibleStrategy(), new WatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = "Scuba";
          this._damage = 1;
      }
  },
  //ninja type
  Ninja : class extends Ant {
      constructor() {
          super(1,6, new NinjaStrategy(), new InvisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new NotContainerStrategy());
          this._name = "Ninja";
          this._damage = 1;
      }
  },
  //bodyguard type
  Bodyguard: class extends Ant {
      constructor() {
          super(2,4, new BodyguardStrategy(), new VisibleStrategy(), new NotwatersafeStrategy(), new DefaultReduceArmor(), new ContainerStrategy());
          this._name = "Bodyguard";
      }
  }
  
};

//export classes to be available to other modules. Note that this does expose some of the other classes
module.exports.Hive = Hive;
module.exports.AntColony = AntColony;
module.exports.AntGame = AntGame;

