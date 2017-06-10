 


/*----------- VARIABLES ----------- */

var mediaStream = null;
var webcamList = [];
var currentCam = null;
var play = false;
var camera, canvas, context, imageData, pixels, detector;

var c = "",
    color="#ffffff",
    size=25,
    tam=25,
    n = "",
    ArEL = "",
    k = "",
    myState, getUserMedia = "",
    videoTracks = "",
    markers = "",
    detector = "",
    detector="",
    corner, 
    video = document.getElementById('video');
var nx, ny;
camera = document.getElementById("video");
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");

camera.width = 1080;
camera.height = 720;




canvas.width = parseInt(canvas.style.width);
canvas.height = parseInt(canvas.style.height);



/*
MIRROR AQUI*/

/*  context.translate(camera.width, 0);
    context.scale(-1, 1);*/