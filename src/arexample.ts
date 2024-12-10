
import { Color4, Engine, Scene, Vector3, FreeCamera, 
    HemisphericLight, MeshBuilder, StandardMaterial, Color3, KeyboardEventTypes, Mesh, 
    Texture,
    Sound} from "@babylonjs/core";
// import {  } from "babylonjs";
import  * as GUI from '@babylonjs/gui';
// import 'babylonjs-xr';
import "@babylonjs/loaders";





window.addEventListener('DOMContentLoaded', async () =>{

    const canvas  = document.querySelector("#canvas") as HTMLCanvasElement;

const engine =  new Engine( canvas, true )

const scene =  new Scene( engine );
      scene.clearColor = new Color4(0,0,0,1);

  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;


  
  var sphere = MeshBuilder.CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);
  sphere.position.y = 2;
  sphere.position.z = 5;


  const xr = await scene.createDefaultXRExperienceAsync({
    // ask for an ar-session
    uiOptions: {
      sessionMode: "immersive-ar",
    },
  });


  engine.runRenderLoop(
    ()=>{

        //render the update
        scene.render();
    }
);

});
