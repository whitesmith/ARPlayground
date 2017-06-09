console.log("variavies in");


if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}


/*----------- VARIABLES ----------- */

var mediaStream = null;
var webcamList = [];
var currentCam = null;
var batata = false;
var camera, canvas, context, imageData, pixels, detector;
var debugImage, warpImage, homographyImage;
var c = "",
    n = "",
    ArEL = "",
    k = "",
    myState, getUserMedia = "",
    videoTracks = "",
    markers = "",
    detector = "",
    detector="",
    i, j, contour, corners, corner, point, tickF,
    video = document.getElementById('video');

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