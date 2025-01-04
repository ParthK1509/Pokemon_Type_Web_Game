const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // context object


canvas.width = 1024;
canvas.height = 576;

const collisionMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionMap.push(collisions.slice(i, i + 70));
}
const battlezonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battlezonesMap.push(battleZonesData.slice(i, i + 70));
}

const boundaries = [];
const offset = {
  x: -580,
  y: -520,
};

collisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const battlezones = [];
battlezonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 1025)
      battlezones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

// made a html image object to put in draw image
const image = new Image();
image.src = "./img/Pellet Town.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/ForegroundObjects.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";

//cant call before the image is loaded, so we have to wait
// image.onload = () => {
// }

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
  },
  sprites: {
    up: playerUpImage,
    down: playerDownImage,
    right: playerRightImage,
    left: playerLeftImage,
  },
});
const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const testBoundary = new Boundary({
  position: {
    x: 350,
    y: 350,
  },
});

const movables = [background, ...boundaries, foreground, ...battlezones]; //put all items of boundaries to movables
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

const battle = {
    initiated : false
}
function animate() {
  //to be called over and over again
  const animationId = window.requestAnimationFrame(animate);
  background.draw();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });

  battlezones.forEach((zone) => {
    zone.draw();
  });

  player.draw();
  foreground.draw();

  let moving = true
  player.moving = false

  if(battle.initiated)
  {
      return
  }//battleActivation
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battlezones.length; i++) {
      const battlezone = battlezones[i];
      const overlappingArea =
        (-Math.max(player.position.x, battlezone.position.x) +
          Math.min(
            player.position.x + player.width,
            battlezone.position.x + battlezone.width
          )) *
        (-Math.max(player.position.y, battlezone.position.y) +
          Math.min(
            player.position.y + player.height,
            battlezone.position.y + battlezone.height
          ));

      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battlezone,
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.02
      ) {
        console.log("battlezoneDetected");
        window.cancelAnimationFrame(animationId);
        battle.initiated = true
        gsap.to('#overlappingDiv',{
            opacity:1,
            repeat:3,
            yoyo: true,
            duration: 0.4,
            onComplete(){
                gsap.to('#overlappingDiv',{
                    opacity:1,
                    duration: 0.4
                })
                animateBattle()
            }
        })
        
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey == "w") {
    player.moving = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
  } else if (keys.a.pressed && lastKey == "a") {
    player.moving = true;
    player.image = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
  } else if (keys.s.pressed && lastKey == "s") {
    player.moving = true;
    player.image = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
  } else if (keys.d.pressed && lastKey == "d") {
    player.moving = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
  }
}
animate();

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
function animateBattle()
{
    window.requestAnimationFrame(animateBattle)

}

let lastKey = "";
window.addEventListener("keydown", (e) => {
  //whenever we keydown, this function plays
  //   console.log(e.key);
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});
window.addEventListener("keyup", (e) => {
  //whenever we keydown, this function plays
  //   console.log(e.key);
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});

// console.log(c);
