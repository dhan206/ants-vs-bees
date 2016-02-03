# Ants vs. Some-Bees

This module is a simple turn-based tower-defense game played on the command-line, completed as part of a [course](http://arch-joelross.rhcloud.com/) at the UW ISchool. 

The below questions should be answered (in detail!) regarding your submission!


##### 1. Spend some time reading through the provided code _carefully_ to make sure you understand it. After you've read the code, in the space below list any _design patterns_ we discussed in class that you can find (note that you may need to revisit the code after each lecture). Be clear about which pattern is used, where, and _why it is being employed_.
The Hive and AntColony classes use the factory pattern to create the game's Bee Hive and Ant Colony. It is used to create hives and colonies for game play.


##### 2. After you've read the code, is there anywhere that it could be re-architected (e.g., using design patterns) to be more changeable or reusable? 
The code could be re-architected to use the strategy pattern, decorator pattern, abstract factory method pattern and singleton pattern to become more changeable and resuable. The singleton pattern would be used to create the Queen and keep track of the true queen. The abstract factory method pattern could be used to create different types of ants. The decorator pattern could be used to implement the fire ant's reducearmor behavior because it adds functionality to the parent's reducearmor behavior. It can also be implemented to create the wet places. The strategy pattern could be used to reuse a lot of the act behaviors, watersafe, invisible, and other behaviors that are shared among the ants.


##### 3. The tunnels in the `AntColony` are structured as a ___Linked List___ (where each element is a `Place`, and the `exit` and `entrance` variables are the traditional `next` and `prev`). Why is this data structure appropriate (as opposed to, say, an array). _You may need to revisit your notes from CSE 143._
This data structure is appropriate because it allows for the referencing of neighboring objects to that place. So instead of having just an array of places, an arraylist allowed for easier access to the neighboring places when the bees need to move across the game or when the Queen applied its ability to double neighboring insect's damage. 


##### 4. Describe the overall architecture you used to implement the different components of this assignment. Did you use inheritance? A particular design pattern?
I attempted to move away from inheritance and towards programming to an interface. I don't know if I achieved my goal of doing that but I was aiming to make the Insect, Bee, and Ant classes as abstract as possible and pass in behaviors in the constructor to create the different types of ants. If I could make improvements I would have tried to create an abstract factory method pattern that would produce the different types of ants but I did not know how to implement that into my code.


##### 5. Specifically, discuss your use of object-oriented design patterns in your program. What patterns did you use in your implementation (be specific)? Why? Is there anywhere you explicitly decided _not_ to use a pattern (e.g., because doing so would have made it more difficult to change the code later, etc)? Be detailed---you should reflect carefully on your own design and architecture work!
I used the strategy pattern for varying behaviors between the ants. I implemented it for the act methods, invisible/visible behaviors, watersafe/not watersafe behaviors, reducearmor method, container/not container behavior, and set place method. I did this because each ant had varying behaviors and I believed that to make the game extensible. Also, some of the ants shared similar behaviors (such as throwing leaves for Thrower and Scuba, or not having act methods at all) so I thought it would make the code less redundant while encapsulating what varied between the ants. I didn't use the strategy pattern in the other classes because I beleive that places, antcolony, etc did not have as much variation between each instance of object using these classes. I used the decorator pattern for the Fire ant's reduceArmor method because it showed characteristics that it added features to the parent method, so instead of inheriting or copying that method, I wanted to decorate that method with the Fire ant's own special ability. It was easier to do this because passing the parent method made it easier to add functionality to the Fire ant while not losing the parent method's features. I ended up not using this method for the water implementation because I would have required me to copy a lot of the code from places, which would've defeat the purpose of creating a new water class and decorating the place object. Finally, I used the singleton pattern to implement the Queen because there should only be one instance of the queen throughout the game. This made it very easy to detect whether an imposter queen had been deployed or whether the Queen had already doubled the damage of its surroundning neighbors. I didn't use the Singleton pattern for any other part of the program because there was no other ants, bees, or places that needed to only have a single instance of itself.


##### 6. Approximately how many hours did it take you to complete this assignment? #####
22+ hours;


##### 7. Did you receive help from any other sources (classmates, etc)? If so, please list who (be specific!). #####
I used Google and Youtube to better understand the patterns.


##### 8. Did you encounter any problems in this assignment we should warn students about in the future? How can we make the assignment better? #####
Not really an assignment problem. I understood the concepts and implementations of the patterns shown in class, but I found it difficult to actually implement them in my code. For example, I know that using an abstract factory method pattern for creating different ants would make the architecture of my code a lot better, but I just couldn't wrap my head around being able to do it.

