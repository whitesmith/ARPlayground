console.log("all in");

function init() {




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
        i, j, contour, corners, corner, point, tickF,
        video = document.getElementById('video');

    camera = document.getElementById("video");
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    camera.width = 1080;
    camera.height = 720;

    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);



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

        requestAnimationFrame(tick);

        if (video.readyState === video.HAVE_ENOUGH_DATA) {

            snapshot();


            //drawId(markers);
        }
    }


    function snapshot() {

        // console.log("batata")
        imageData = context.getImageData(0, 0, camera.width, camera.height);
        markers = detector.detect(imageData);
        context.drawImage(video, 0, 0, camera.width, camera.height);

        //só desenha se detetar video
        //quero que só desenhe se detetar um marcador

        drawCorners(markers);


    }



    function drawV() {

        detector = new AR.Detector();

        requestAnimationFrame(tick);

        tick();

    }

   // drawV();



    function drawCorners(markers) {
        //corners, corner, i, j;



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



        }
    }





    /* — — — — — — INTERACTIVE CANVAS ELEMENT — — — — — —*/

    // Constructor for Shape objects to hold data for all drawn objects.
    // For now they will just be defined as rectangles.
    function Shape(x, y, w, h, fill) {
        // This is a very simple and unsafe constructor. 
        // All we're doing is checking if the values exist.
        // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 1;
        this.h = h || 1;
        this.fill = fill || '#AAAAAA';
    }

    // Draws this shape to a given context
    Shape.prototype.draw = function (context) {
        context.fillStyle = this.fill;
        context.fillRect(this.x, this.y, this.w, this.h);
    }




    // Determine if a point is inside the shape's bounds
    Shape.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Width) and its Y and (Y + Height)
        return (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    }

    function CanvasState(canvas) {
        // **** First some setup! ****

        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = canvas.getContext('2d');
        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
        }
        // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
        // They will mess up mouse coordinates and this fixes that
        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;

        // **** Keep track of state! ****

        this.valid = false; // when set to false, the canvas will redraw everything
        this.shapes = []; // the collection of things to be drawn
        this.dragging = false; // Keep track of when we are dragging
        // the current selected object. In the future we could turn this into an array for multiple selection
        this.selection = null;
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;

        // **** Then events! ****

        // This is an example of a closure!
        // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
        // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
        // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
        // This is our reference!
        myState = this;

        //fixes a problem where double clicking causes text to get selected on the canvas
        canvas.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        }, false);
        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {
            var mouse = myState.getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;
            var shapes = myState.shapes;
            var l = shapes.length;
            for (var i = l - 1; i >= 0; i--) {
                if (shapes[i].contains(mx, my)) {
                    var mySel = shapes[i];
                    // Keep track of where in the object we clicked
                    // so we can move it smoothly (see mousemove)
                    myState.dragoffx = mx - mySel.x;
                    myState.dragoffy = my - mySel.y;
                    myState.dragging = true;
                    myState.selection = mySel;
                    myState.valid = false;
                    return;
                }
            }
            // havent returned means we have failed to select anything.
            // If there was an object selected, we deselect it
            if (myState.selection) {
                myState.selection = null;
                myState.valid = false; // Need to clear the old selection border
            }
        }, true);
        canvas.addEventListener('mousemove', function (e) {
            if (myState.dragging) {
                var mouse = myState.getMouse(e);
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.selection.x = mouse.x - myState.dragoffx;
                myState.selection.y = mouse.y - myState.dragoffy;
                myState.valid = false; // Something's dragging so we must redraw
            }
        }, true);
        canvas.addEventListener('mouseup', function (e) {
            myState.dragging = false;
        }, true);
        // double click for making new shapes
        canvas.addEventListener('dblclick', function (ev) {
            // console.log("entrou double");
            var mouse = myState.getMouse(ev);
            // console.log("entrou rato");

            myState.addShape(new Shape(mouse.x - 10, mouse.Y - 10, 20, 20, 'rgba(0, 10, 255, 0.6)'));
            //console.log(myState);
            k = new CanvasState(document.getElementById('canvas2'));
            k.addShape(new Shape(0, 0, 20, 20, 'rgba(0,255,0,.6)'));
            // console.log("entrou desenho");
        }, true);


        // **** Options! ****

        this.selectionColor = '#CC0000';
        this.selectionWidth = 2;
        this.interval = 10;
        setInterval(function () {
            myState.draw();
        }, myState.interval);
    }

    CanvasState.prototype.addShape = function (shape) {
        this.shapes.push(shape);
        this.valid = false;
    }

    CanvasState.prototype.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    }



    // While draw is called as often as the INTERVAL variable demands,
    // It only ever does something if the canvas gets invalidated by our code
    CanvasState.prototype.draw = function () {



        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            var ctx = this.context;
            var shapes = this.shapes;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **
            //VIDEO AQUI!!

             drawV();




            // draw all shapes
            var l = shapes.length;
            for (var i = 0; i < l; i++) {
                var shape = shapes[i];
                // We can skip the drawing of elements that have moved off the screen:
                if (shape.x > this.width || shape.y > this.height ||
                    shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
                shapes[i].draw(ctx);
            }

            // draw selection
            // right now this is just a stroke along the edge of the selected Shape
            if (this.selection != null) {
                ctx.strokeStyle = this.selectionColor;
                ctx.lineWidth = this.selectionWidth;
                var mySel = this.selection;
                ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
            }

            // ** Add stuff you want drawn on top all the time here **

            this.valid = true;
        }
    }


    // Creates an object with x and y defined, set to the mouse position relative to the state's canvas
    // If you wanna be super-correct this can be tricky, we have to worry about padding and borders
    CanvasState.prototype.getMouse = function (e) {
        var element = this.canvas,
            offsetX = 0,
            offsetY = 0,
            mx, my;

        // Compute the total offset
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        // Add padding and border style widths to offset
        // Also add the <html> offsets in case there's a position:fixed bar
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;

        // We return a simple javascript object (a hash) with x and y defined
        return {
            x: mx,
            y: my
        };


    }


}
window.onload = init;