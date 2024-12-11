

import {
    Color4, Engine, Scene, Vector3, FreeCamera,
    HemisphericLight, MeshBuilder, StandardMaterial, Color3, KeyboardEventTypes, Mesh,
    Texture,
    Sound
} from "@babylonjs/core";
// import {  } from "babylonjs";
import * as GUI from '@babylonjs/gui';


const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true)

const scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 1);

const camera = new FreeCamera("camera", new Vector3(0, -1, -5), scene);
camera.attachControl();


const light = new HemisphericLight("light", new Vector3(0, 6, -5), scene);
light.intensity = 1;

const rows: number = 5;
const cols: number = 5;
const spacing = { x: .5, y: .3 }
let bricks: any[] = [];

const STATE_STARTING: number = 0
const STATE_PLAYING: number = 1
const STATE_GAMEOVER: number = 2
const STATE_WON: number = 3

let gameState = STATE_STARTING;
let score: number = 0;


//load sounds here...
const bgmusic = new Sound("bgmusic", "/sounds/bgmusic/bg.wav", scene)

const breaksfx = new Sound("breaksfx", "/sounds/sfx/breaksfx.wav", scene)


const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')

//messages on screen
let messageText = new GUI.TextBlock();

messageText.color = 'white';
messageText.fontSize = 24;
messageText.top = '0px'
messageText.left = '0px'

advancedTexture.addControl(messageText);

//score in upper left of the screen
let scoreText = new GUI.TextBlock();

scoreText.color = 'white';
scoreText.fontSize = 24;
scoreText.top = '-350px'
scoreText.left = '-700px'

advancedTexture.addControl(scoreText);

// messageText.text = "HELLO BABYLON WORLD"



engine.runRenderLoop(
    () => {

        switch (gameState) {
            case STATE_STARTING:
                break;

            case STATE_PLAYING:
                update()
                break;

            case STATE_GAMEOVER:
                break;
            case STATE_WON:
                break;
        }

        //render the update
        scene.render();
    }
);

window.addEventListener("resize", () => {
    engine.resize();
});


//ball creation
const ball = MeshBuilder.CreateSphere("ball", { diameter: .2 }, scene);

const ballMaterial = new StandardMaterial(`ballMaterial`, scene)
ballMaterial.diffuseTexture = new Texture('./textures/ball.webp', scene)

ball.material = ballMaterial;

let ballMovement = { "h": 0, "v": 0 };

let paddleMovement: number = 0;
const PADDLE_SPD: number = .04;


//paddle creation
const paddle = MeshBuilder.CreateBox("paddle", { "width": 1, "height": .2 });


const paddleMaterial = new StandardMaterial(`paddleMaterial`, scene)
// paddleMaterial.diffuseColor = new Color3( 0, 0, 1 );
paddleMaterial.diffuseTexture = new Texture('./textures/paddle.webp', scene)

paddle.material = paddleMaterial;

const linePoints = [
    new Vector3(-2, -3, 0),
    new Vector3(-2, 1, 0),
    new Vector3(2, 1, 0),
    new Vector3(2, -3, 0)
]

MeshBuilder.CreateLines("lines", { "points": linePoints });


console.log("FIRST INIT")
gameInit();

scene.onKeyboardObservable.add(
    (kbInfo) => {
        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:

                switch (kbInfo.event.key) {
                    case "A":
                    case "a":
                        paddleMovement = -PADDLE_SPD;
                        break;
                    case "D":
                    case "d":
                        paddleMovement = PADDLE_SPD;
                        break;
                }
                break;

            case KeyboardEventTypes.KEYUP:
                switch (kbInfo.event.key) {
                    case "A":
                    case "a":
                    case "D":
                    case "d":
                        paddleMovement = 0;
                        break;
                    case " ":

                        if (gameState === STATE_STARTING) {


                            gameState = STATE_PLAYING;

                            const randomValue = Math.floor(Math.random() * 100) + 1;
                            if (randomValue <= 50)
                                ballMovement.h = -.03
                            else
                                ballMovement.h = .03

                            ballMovement.v = .03;


                            messageText.text = ""


                            //play bgmusic
                            bgmusic.stop();
                            bgmusic.play();
                        }


                        if (gameState === STATE_GAMEOVER) {
                            gameState = STATE_STARTING;
                            console.log("SATE GAMEOVER")
                            gameInit();
                        }

                        break;

                }
                break;
        }

    }
);


function update() {

    // ball.position.x  -= .04;
    if (paddleMovement !== 0) {
        paddle.position.x += paddleMovement;
        if (paddleMovement < 0 && paddle.position.x <= -1.5) paddle.position.x = -1.5;
        else if (paddleMovement > 0 && paddle.position.x >= 1.5) paddle.position.x = 1.5;

    }


    //ball with lines collisions
    ball.position.x += ballMovement.h
    ball.position.y += ballMovement.v;

    const topCollision = checkSphereCollisionWithLines(ball, [linePoints[1], linePoints[2]], .2)
    if (topCollision) {
        console.log("TOP COLLISION TRUE")
        ballMovement.v = ballMovement.v * -1;
    }

    const leftCollision = checkSphereCollisionWithLines(ball, [linePoints[0], linePoints[1]], .2)
    const rigthCollision = checkSphereCollisionWithLines(ball, [linePoints[2], linePoints[3]], .2)

    if (leftCollision || rigthCollision) {
        ballMovement.h = ballMovement.h * -1;
        //  ballMovement.h *=- 1;
    }


    //padle collision
    const paddleCollision = ball.intersectsMesh(paddle, false);
    if (paddleCollision) {
        ballMovement.v = .03;
    }


    //  brick collisions
    for (let i in bricks) {
        const b = bricks[i];

        if (b.isVisible) {

            const sideCollision = checkCollisionSide(ball, b);

            switch (sideCollision) {
                case "TOP":
                case "BTTOM":
                    ballMovement.v *= -1;
                    break;

                case "LEFT":
                case "RIGHT":
                    ballMovement.h *= -1;
                    break;

                case "FRONT":
                case "READ":
                    break;
            }

            if (sideCollision !== "NONE") {
                b.isVisible = false;


                score += 10;
                scoreText.text = `Score: ${score}`;

                if (score >= 250) {
                    gameState = STATE_WON;
                    messageText.text = "YOU WON!"
                }

                breaksfx.play();

            }

        }

    }//


    if (ball.position.y < (paddle.position.y - 1)) {

        messageText.text = "GAME OVER \n press Space Key to Start Again"
        gameState = STATE_GAMEOVER;
        console.log("GAME OVER")

    }


}//update

function pointSegmentDistance(meshPosition: Vector3, point1: Vector3, point2: Vector3) {
    const lon2 = Vector3.DistanceSquared(point1, point2);  //Longitud al cuadrado del segmento
    if (lon2 === 0.0) return Vector3.Distance(meshPosition, point1);

    let t = Vector3.Dot(meshPosition.subtract(point1), point2.subtract(point1)) / lon2;
    t = Math.max(0, Math.min(1, t));

    const projection = point1.add(point2.subtract(point1).scale(t))
    return Vector3.Distance(meshPosition, projection);
}


function checkSphereCollisionWithLines(sphere: Mesh, points: Vector3[], radius: number) {

    const pos: Vector3 = sphere.position;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const distance = pointSegmentDistance(pos, p1, p2);
        if (distance <= radius) return true;

    }
    return false;
}




function checkCollisionSide(sphere: Mesh, box: Mesh): string {
    const spherePosition = sphere.position;
    const boxPosition = box.position;

    const boxSize = box.getBoundingInfo().boundingBox.extendSizeWorld;  // bounding box if scaled size of the box
    const sphereRadius = sphere.getBoundingInfo().boundingSphere.radius;  // ball radius, diameter is .2;


    // console.log( "READIO SPEHERE ", sphere.geometry.diameter)
    const deltaX = spherePosition.x - boxPosition.x;
    const deltaY = spherePosition.y - boxPosition.y;
    const deltaZ = spherePosition.z - boxPosition.z;

    // Colisiones en el eje Y (arriba o abajo)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > Math.abs(deltaZ)) {
        if (deltaY > 0 && deltaY <= boxSize.y + sphereRadius) {
            return "TOP";
        } else if (deltaY < 0 && Math.abs(deltaY) <= boxSize.y + sphereRadius) {
            return "BOTTOM";
        }
    }

    // Colisiones en el eje X (lados izquierdo y derecho)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > Math.abs(deltaZ)) {
        if (deltaX > 0 && deltaX <= boxSize.x + sphereRadius) {
            return "RIGHT";
        } else if (deltaX < 0 && Math.abs(deltaX) <= boxSize.x + sphereRadius) {
            return "LEFT";
        }
    }

    // Colisiones en el eje Z (delante o detrás, en un mundo 3D)
    if (Math.abs(deltaZ) > Math.abs(deltaY) && Math.abs(deltaZ) > Math.abs(deltaX)) {
        if (deltaZ > 0 && deltaZ <= boxSize.z + sphereRadius) {
            return "FRONT";
        } else if (deltaZ < 0 && Math.abs(deltaZ) <= boxSize.z + sphereRadius) {
            return "REAR";
        }
    }

    return "NONE";
}


function gameInit() {

    bricks = [];

    const bricksToDispose = []

    for (const mesh of scene.meshes) {
        if (mesh.name === "brick") {
            bricksToDispose.push(mesh);
        }
    }

    bricksToDispose.forEach(mesh => { mesh.dispose() })

    const brickMaterial = new StandardMaterial(`brickMaterial`, scene)
    //   brickMaterial.diffuseColor = new Color3( 1, 0, 0 );
    brickMaterial.diffuseTexture = new Texture('./textures/brick.webp', scene);

    // bricks creation
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let x = (c * spacing.x) - ((cols - 1) / 2 * spacing.x)
            let y = (r * spacing.y) - ((rows - 1) / 2 * spacing.y)

            const brick = MeshBuilder.CreateBox(`brick`, {}, scene);

            brick.material = brickMaterial;

            brick.position.x = x;
            brick.position.y = y;

            brick.scaling.x = 0.4;
            brick.scaling.y = 0.2;
            brick.scaling.z = 0.2;

            bricks.push(brick);
        }
    }


    //set ball position
    ball.position = new Vector3(0, -2.5, 0)

    //set paddle position
    paddle.position = new Vector3(0, -3, 0);

    messageText.text = "Press Space Key to Start"

    score = 0;
    scoreText.text = `Score: ${score}`;

}







