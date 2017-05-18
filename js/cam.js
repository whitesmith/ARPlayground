'use strict';


function onLoad() {
    console.log("bababa");
    var mediaStream = null;
    var webcamList = [];
    var currentCam = null;
    var batata = false;
    var camera, canvas, context, imageData, pixels, detector;
    var debugImage, warpImage, homographyImage;


    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    camera = document.getElementById("video");
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    camera.width = 1080;
    camera.height = 720;

    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);
    var video = document.getElementById('video');



    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

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

    /*
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    navigator.mediaDevices.enumerateDevices().then(devicesCallback);
                } else if (navigator.getUserMedia) {
                    document.getElementById('tooltip').innerHTML = 'Cannot switch web cams because navigator.mediaDevices.enumerateDevices is unsupported by your browser.';
                 navigator.getUserMedia({
                        video: true }, successCallback, errorCallback);
                
                }
    */



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
            document.getElementById('switch').disabled = false;
            console.log(">1");
        }


    }

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
            var video = document.getElementById('video');
            video.srcObject = null;
            video.src = null;
            if (mediaStream) {
                console.log("esta lista tem " + webcamList.length);
                var videoTracks = mediaStream.getVideoTracks();
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



    detector = new AR.Detector();

    requestAnimationFrame(tick);



    function tick() {
        requestAnimationFrame(tick);

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            snapshot();

            var markers = detector.detect(imageData);
            //drawDebug();
            drawCorners(markers);
            drawId(markers);
        }
    }

    function snapshot() {
        context.drawImage(video, 0, 0, camera.width, camera.height);
        imageData = context.getImageData(0, 0, camera.width, camera.height);
    }


    function drawContours(contours, cx, cy, width, height, fn) {
        var i = contours.length,
            j, contour, point;

        while (i--) {
            contour = contours[i];

            context.strokeStyle = fn(contour.hole);
            context.beginPath();

            for (j = 0; j < contour.length; ++j) {
                point = contour[j];
                this.context.moveTo(cx + point.cx, cy + point.cy);
                point = contour[(j + 1) % contour.length];
                this.context.lineTo(cx + point.cx, cy + point.cy);
            }

            context.stroke();
            context.closePath();
        }
    }


    function drawCorners(markers) {
        var corners, corner, i, j;


        // context.lineWidth = 3;

        for (i = 0; i !== markers.length; ++i) {
            corners = markers[i].corners;

            context.rect(corners[0].x, corners[0].y, 200, 200);
            context.fillStyle = "white";
            context.fill();


            canvas.style.width = '';
            context.lineWidth = 20 || Math.ceil(Math.random() * 35);
            context.lineCap = 20 || "round";
            context.pX = undefined;
            context.pY = undefined;
            var lines = [, , ];
            var offset = $(canvas).offset();
            var self = {
                init: function () {
                    canvas.addEventListener('touchstart', self.preDraw, false);
                    canvas.addEventListener('touchmove', self.draw, false);
                },
                preDraw: function (event) {
                    $.each(event.touches, function (i, touch) {
                        var id = touch.identifier,
                            colors = ["red", "green", "yellow", "blue", "magenta", "orange", "red"],
                            mycolor = colors[Math.floor(Math.random() * colors.length)];
                        lines[id] = {
                            lineX: this.pageX - offset.left,
                            lineY: this.pageY - offset.top,
                            color: mycolor
                        };
                    });
                    event.preventDefault();
                },
                draw: function (event) {
                    var e = event,
                        hmm = {};
                    $.each(event.touches, function (i, touch) {
                        var id = touch.identifier,
                            moveX = this.pageX - offset.left - lines[id].lineX,
                            moveY = this.pageY - offset.top - lines[id].lineY;
                        var ret = self.move(id, moveX, moveY);
                        lines[id].x = ret.x;
                        lines[id].y = ret.y;
                    });



                    event.preventDefault();
                },
                move: function (i, changeX, changeY) {
                    context.strokeStyle = lines[i].color;
                    context.beginPath();
                    context.moveTo(lines[i].x, lines[i].y);
                    context.lineTo(lines[i].x + changeX, lines[i].y + changeY);
                    context.stroke();
                    context.closePath();
                    return {
                        x: lines[i].x + changeX,
                        y: lines[i].y + changeY
                    };
                }
            };
            return self.init();







        }
    }

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
    }

    function createImage(src, dst) {
        var i = src.data.length,
            j = (i * 4) + 3;

        while (i--) {
            dst.data[j -= 4] = 255;
            dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
        }

        return dst;
    };







}

window.onload = onLoad;