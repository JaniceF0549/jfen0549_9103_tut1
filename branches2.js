//Empty array of balls 
let balls = []

//Setup function to generate start position of trunk
function setup() {
  createCanvas(1200, 1200)
  let trunk = new Circles(width/2, height - height/3, 50)
  trunk.generateTrunk()
}

//Draw function for display ball function
function draw() {
  background(222)

    for (let ball of balls) {
    ball.display();
    }
}

//Circles class storing information of each ball
class Circles {

  constructor(starterXPos, starterYPos, starterDiameter){
    this.ballXPos = starterXPos
    this.ballYPos = starterYPos
    this.ballDiameter = starterDiameter
    
    //stored random colors with min/max of browns for trunk
    this.colorTop = color(random(60, 100), random(40, 70), random(20, 50));
    this.colorBottom = color(random(100, 150), random(60, 100), random(30, 80));

    this.StrokeColor = color(0)
    this.StrokeWeight = 0
  }
  
  //generate trunk function, logic
  generateTrunk() {
    const segments = 5
    let y = this.ballYPos 
    let x = this.ballXPos
    let prevD = this.ballDiameter
    
    //push initial ball
    balls.push(this)

    //logic to keep balls connected
    for (let i=0; i<segments; i++){
      let newD = Math.round(random(20, 100))
      //change y pos of next ball by radius of previous ball + new ball
      y -= (prevD/2 + newD/2) 
      balls.push(new Circles(x, y, newD))
      prevD = newD
  
    }
  }


  display() {

    push()

    translate(this.ballXPos, this.ballYPos)

    stroke(this.StrokeColor)
    strokeWeight(this.StrokeWeight)

    fill(this.colorTop)
    arc(0,0, this.ballDiameter, this.ballDiameter, PI/2, (3*PI)/2, PIE)

    fill(this.colorBottom)
    arc(0,0, this.ballDiameter, this.ballDiameter, (3*PI)/2, PI/2)


    pop()
    
  }

}