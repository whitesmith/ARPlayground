(function() {
    'use strict';

    //begin all values at null so it does not star with values used in other sessions
    var mediaStream = null;
    var webcamList = [];
    var currentCam = null;


    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // init() - The entry point to the demo code
    // 1. Detect whether getUserMedia() is supported, show an error if not
    // 2. Set up necessary event listners for video tag and the webcam 'switch' button
    // 3. Detect whether device enumeration is supported, use the legacy media capture API to start the demo otherwise
    // 4. Enumerate the webcam devices when the browser supports device enumeration

    var init = function () {

   

        

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

        // document.getElementById('switch').addEventListener('click', nextWebCam, false);
        document.querySelector('#switch').addEventListener('click', nextWebCam, false);
        
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devicesCallback);
        } else if (navigator.getUserMedia) {
            document.getElementById('tooltip').innerHTML = 'Cannot switch web cams because navigator.mediaDevices.enumerateDevices is unsupported by your browser.';

            navigator.getUserMedia({
                video: true /*, audio: true */
            }, initializeVideoStream, getUserMediaError);
        } else {
            writeError('You are using a browser that does not support the Media Capture API');
        }
    };
 

    // initializeVideoStream() - Callback function when getUserMedia() returns successfully with a mediaStream object
    // 1. Set the mediaStream on the video tag
    // 2. Use 'srcObject' attribute to determine whether to use the standard-based API or the legacy version
    var video = document.getElementById('videoTag');
    var batata = false;
    var initializeVideoStream = function (stream) {
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
        }
        if (webcamList.length > 1) {
            document.getElementById('switch').disabled = false;
            
            
  document.getElementById('videoTag').addEventListener('click', capture,         false);
        }


    }

    $('.toggle').click(function () {
        batata = !batata;


        if (batata == true) {
            $('.toggle').html("Play");
            video.onloadedmetadata = video.pause();
                console.log("pause");
             
        } else {
            $('.toggle').html( "Unpause");
         video.onloadedmetadata = video.play();
            


        }

    });




    // nextWebCam() - Function to rotate through the webcam device list
    // 1. Release the current webcam (if there is one in use)
    // 2. Call getUserMedia() to access the next webcam

    var nextWebCam = function () {
        document.getElementById('switch').disabled = true;
        if (currentCam !== null) {
            currentCam++;
            if (currentCam >= webcamList.length) {
                currentCam = 0;
            }
            var video = document.getElementById('videoTag');
            video.srcObject = null;
            video.src = null;
            if (mediaStream) {
                var videoTracks = mediaStream.getVideoTracks();
                videoTracks[0].stop();
                mediaStream = null;
            }
        } else {
            currentCam = 0;
        }

        navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    deviceId: {
                        exact: webcamList[currentCam]
                    }
                }
            }).then(initializeVideoStream)
            .catch(getUserMediaError);
    };


    // deviceChanged() - Handle devicechange event
    // 1. Reset webcamList
    // 2. Re-enumerate webcam devices

    var deviceChanged = function () {
        navigator.mediaDevices.removeEventListener('devicechange', deviceChanged);
        // Reset the webcam list and re-enumerate
        webcamList = [];
        /*eslint-disable*/
        navigator.mediaDevices.enumerateDevices().then(devicesCallback);
        /*eslint-enable*/
    };


    // devicesCallback() - Callback function for device enumeration
    // 1. Identify all webcam devices and store the info in the webcamList
    // 2. Start the demo with the first webcam on the list
    // 3. Show the webcam 'switch' button when there are multiple webcams
    // 4. Show error message when there is no webcam
    // 5. Register event listener (devicechange) to respond to device plugin or unplug

    var devicesCallback = function (devices) {
        // Identify all webcams
        for (var i = 0; i < devices.length; i++) {
            if (devices[i].kind === 'videoinput') {
                webcamList[webcamList.length] = devices[i].deviceId;
            }
        }

        if (webcamList.length > 0) {
            // Start video with the first device on the list
            nextWebCam();
            if (webcamList.length > 1) {
                document.getElementById('switch').disabled = false;
            } else {
                document.getElementById('switch').disabled = true;
            }
        } else {
            writeError('Webcam not found.');
        }
        navigator.mediaDevices.addEventListener('devicechange', deviceChanged);
    };


    // writeError(string) - Provides a way to display errors to the user

    var writeError = function (string) {
        var elem = document.getElementById('error');
        var p = document.createElement('div');
        p.appendChild(document.createTextNode('ERROR: ' + string));
        elem.appendChild(p);
    };


    // getUserMediaError() - Callback function when getUserMedia() returns error
    // 1. Show the error message with the error.name

    var getUserMediaError = function (e) {
        if (e.name.indexOf('NotFoundError') >= 0) {
            writeError('Webcam not found.');
        } else {
            writeError('The following error occurred: "' + e.name + '" Please check your webcam device(s) and try again.');
        }
    };




    init();

}());