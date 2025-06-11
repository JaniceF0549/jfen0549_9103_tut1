// Draw the trunk, which consists of three half-green and half-dark green circles, arranged vertically against the base.
function drawTrunk() {
    let x = width / 2; // Trunk round horizontal center
    let offsetY = 60; // To adjust the alignment
    let scale = 1.1; // To adjust the overall size
  
    // Calculate the bottom position of the trunk (stick to the top of the base)
    let baseTop = height - 160 * scale + offsetY;
    let r = 40 * scale;      // Circle radius (after enlargement)
    let spacing = r;         // Vertical spacing between circles (edges just touching)
    let bottomY = baseTop;   // The Y coordinate of the center of the bottom circle
  
    // Draw three circles, starting from the bottom and going up
    for (let i = 0; i < 3; i++) {
      let y = bottomY - i * spacing;
  
      stroke(0); // Add black outline
      strokeWeight(1);
  
      // Left half dark green
      fill('#2AA25E');
      arc(x, y, r, r, PI / 2, PI * 3 / 2, PIE);
  
      // Right half light green
      fill('#A8DC80');
      arc(x, y, r, r, PI * 3 / 2, PI / 2, PIE);
    }
  }
  
  // Draw the base part, which consists of 9 rectangles, each with a red and green semicircle decoration inside (except for some)
  function drawBase() {
    let offsetY = 76 + 5; // Base location
    let scale = 1.1; // To adjust the overall size
  
    // Top edge position of base
    let baseTop = height - 160 * scale + offsetY;
  
    // The size of a single rectangle
    let cellW = (50 + 1) * scale;
    let cellH = (50 + 1) * scale;
  
    // The starting horizontal coordinate of the entire base (to center it horizontally)
    let xStart = width / 2 - (cellW * 4.5);
  
    for (let i = 0; i < 9; i++) {
      let x = xStart + i * cellW;
  
      // Set the fill color of each rectangle
      if (i === 0 || i === 8) fill('#A8DC80'); // The two outermost rectangles
      else if (i === 1 || i === 7) fill('#2AA25E'); // The second two outer rectangles
      else if (i % 2 === 0) fill('#A8DC80');      // The remaining even numbers are yellow (greenish tone now)
      else fill('#2AA25E');                       // The remaining odd numbers are orange (now dark green)
  
      stroke(0); // Add black outline to base rectangles
      strokeWeight(1);
      rect(x, baseTop, cellW, cellH); // Draw the base rectangle
  
      // Coordinates of the center point of the semicircle
      let cx = x + cellW / 2;
      let cy = baseTop + cellH / 2;
  
      noStroke(); // Remove stroke for inner arcs
  
      // The 5 rectangles in the middle draw red and green semicircles (upper and lower)
      if (i >= 2 && i <= 6) {
        fill('#2AA25E'); // Upper half green
        arc(cx, cy, cellW, cellH, PI, 0, PIE);
        fill('#C3695D'); // Lower half red
        arc(cx, cy, cellW, cellH, 0, PI, PIE);
      } else {
        // The outer upper green circle
        fill('#2AA25E');
        arc(cx, cy, cellW, cellH, PI, 0, PIE);
      }
    }
  }
