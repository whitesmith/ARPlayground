console.log("cam in");

if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}




/*----------- CONECTING CAMERA TO GETUSERMEDIA LIBRARY ----------- */

if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {

        // First get ahold of the legacy getUserMedia, if present
        getUserMedia = navigator.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}


document.getElementById('switch').addEventListener('click', nextWebCam, false);




function successCallback(stream) {
    mediaStream = stream;

    if ("srcObject" in video) {
        video.srcObject = mediaStream;
    } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(mediaStream);
        attachMediaStream(video, mediaStream);
    }
    video.onloadedmetadata = function (e) {
        video.play();
        //console.log(webcamList.length);
    }

    if (webcamList.length > 1) {
        console.log(" > 1 ");
        document.getElementById('switch').disabled = false; //If more than 1 cam, enable switch button
        console.log(">1");
    }


}

/*----------- SWITCH CAM BUTTON ----------- */

$('.toggle').click(function () {
    batata = !batata;


    if (batata == true) {
        $('.toggle').html("Play");
        video.onloadedmetadata = video.pause();
        //console.log("pause");

    } else {
        $('.toggle').html("Pause");
        video.onloadedmetadata = video.play();



    }
});




function errorCallback(error) {}


navigator.getUserMedia({
    video: true

}, successCallback, errorCallback);



/*----------- SWITCH CAM FUNCTION ----------- */

// nextWebCam() - Function to rotate through the webcam device list
// 1. Release the current webcam (if there is one in use)
// 2. Call getUserMedia() to access the next webcam

var nextWebCam = function () {
    console.log("lista tem " + webcamList.length);
    document.getElementById('switch').disabled = true;
    if (currentCam !== null) {
        currentCam++;

        if (currentCam >= webcamList.length) {
            currentCam = 0;

        }
        video = document.getElementById('video');
        video.srcObject = null;
        video.src = null;
        if (mediaStream) {
            console.log("esta lista tem " + webcamList.length);
            videoTracks = mediaStream.getVideoTracks();
            videoTracks[0].stop();
            mediaStream = null;
        }
    } else {
        currentCam = 0;
        console.log("A lista " + webcamList.length);
    }

    navigator.mediaDevices.getUserMedia({

            video: {
                width: 1280,
                height: 720,
                // console.log("A lista " + webcamList.length);
                deviceId: {
                    exact: webcamList[currentCam]
                }
            }

        }).then(successCallback)
        .catch(errorCallback);
};


// deviceChanged() - Handle devicechange event
// 1. Reset webcamList
// 2. Re-enumerate webcam devices

var deviceChanged = function () {
    console.log("neste momento, a lista tem " + webcamList.length);
    navigator.mediaDevices.removeEventListener('devicechange', deviceChanged);
    // Reset the webcam list and re-enumerate
    webcamList = [];

    navigator.mediaDevices.enumerateDevices().then(devicesCallback);

};


// devicesCallback() - Callback function for device enumeration
// 1. Identify all webcam devices and store the info in the webcamList
// 2. Start the demo with the first webcam on the list
// 3. Show the webcam 'switch' button when there are multiple webcams
// 4. Show error message when there is no webcam
// 5. Register event listener (devicechange) to respond to device plugin or unplug

var devicesCallback = function (devices) {
    // Identify all webcams
    console.log("neste momento, a lista tem " + webcamList.length);
    for (var i = 0; i < devices.length; i++) {
        if (devices[i].kind === 'videoinput') {
            webcamList[webcamList.length] = devices[i].deviceId;

        }
    }

    if (webcamList.length > 0) {

        console.log("temos " + webcamList.length);
        // Start video with the first device on the list
        nextWebCam();
        if (webcamList.length > 1) {
            document.getElementById('switch').disabled = false;
        } else {
            document.getElementById('switch').disabled = true;
        }
    } else {
        errorCallback();
    }
    navigator.mediaDevices.addEventListener('devicechange', deviceChanged);
};

/*----------- CREATING AR ELEMENT AND RECOGNIZING MARKER ----------- */
function tick() {
   // console.log("tick");
    requestAnimationFrame(tick);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {

        snapshot();


        //drawId(markers);
    }
}


function snapshot() {

   // console.log("batata");

    context.drawImage(video, 0, 0, camera.width, camera.height);
    imageData = context.getImageData(0, 0, camera.width, camera.height);
    markers = detector.detect(imageData);

    
    //quero que só desenhe se detetar um marcador

    drawCorners(markers);


}



function drawV() {
    
    console.log("linda batata");

    detector = new AR.Detector();

    requestAnimationFrame(tick);

    tick();


}

drawV();


function drawCorners(markers) {
    corners, corner, i, j;






    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;


        k = new CanvasState(document.getElementById('canvas'));
        k.addShape(new Shape(0, 0, 20, 20, '#000000 '));

        //n is for debugging
        n = new CanvasState(document.getElementById('canvas2'));
        n.addShape(new Shape(0, 0, 20, 20, '#000000 '));

        // console.log("desenhou");
        //context.rect(corners[0].x, corners[0].y, 200, 200); //white canvas that appears with marker
        // context.fillStyle = "pink";
        //context.fill();

        /*----------- RECOG. CLICK ON CANVAS ----------- */

    }
}





/*function canvas() {

        w = ArEL.width;
        h = ArEL.height;

        ArEL.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        ArEL.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        ArEL.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        ArEL.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
    }
*/
/*----------- FIND CLICK ON CANVAS ----------- */

/*function findxy(res, e) {
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - ArEL.offsetLeft;
            currY = e.clientY - ArEL.offsetTop;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                context.beginPath();
                context.fillStyle = c;
                context.fillRect(currX, currY, 2, 2);
                context.closePath();
                dot_flag = false;
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - ArEL.offsetLeft;
                currY = e.clientY - ArEL.offsetTop;
                draw();
            }
        }
    }
*/

/*----------- CHANGE COLOR W/COLOR PICKER ----------- */


/*

    $('#white').click(function () {
        c = "white";
        n = 30;
        $('#white').html("Rubber activated");
    });

    $('#chosenColor').click(function () {
        $('#white').html("");
        // console.log("do");
        c = "#" + document.getElementById("chosenColor").value;
        //console.log(c);
        // console.log(document.getElementById("chosenColor").value);

        n = 10;

    });
*/

/*----------- DRAWING  ON CANVAS ----------- */

/* function draw() {
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(currX, currY);
        context.strokeStyle = c;
        context.lineWidth = n;
        context.stroke();
        context.closePath();
    }
*/
/*----------- ERASING DRAWING ----------- */
/*function erase() {
    var m = confirm("Want to clear");
    if (m) {
        context.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}*/

/*----------- SAVING DRAWING ----------- */

/*function save() {
        document.getElementById("canvasimg").style.border = "2px solid";
        var dataURL = ArEL.toDataURL();
        document.getElementById("canvasimg").src = dataURL;
        document.getElementById("canvasimg").style.display = "inline";
    }
*/


/*----------- DRAWING MARKER ID ----------- */
/*
    function drawId(markers) {
        var corners, corner, x, y, i, j;

        context.strokeStyle = "blue";
        context.lineWidth = 1;

        for (i = 0; i !== markers.length; ++i) {
            corners = markers[i].corners;

            x = Infinity;
            y = Infinity;

            for (j = 0; j !== corners.length; ++j) {
                corner = corners[j];

                x = Math.min(x, corner.x);
                y = Math.min(y, corner.y);
            }

            context.strokeText(markers[i].id, x, y)
        }
    }*/

/* function createImage(src, dst) {
     var i = src.data.length,
         j = (i * 4) + 3;

     while (i--) {
         dst.data[j -= 4] = 255;
         dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
     }

     return dst;
 };*/