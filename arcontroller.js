

window.addEventListener('load', function () {
    
    
var w=200;
var h= 200;
$('#sketchpad').css("width",w);
$('#sketchpad').css("height",h);
    
    var menu_open = false;

    window.awe.init({
        device_type: awe.AUTO_DETECT_DEVICE_TYPE,
        settings: {
            container_id: 'container',
            fps: 30,
            default_camera_position: {
                x: 0,
                y: 0,
                z: 0
            },
            //texture: {path: video_stream()},
            default_lights: [{
                id: 'point_light',
                type: 'point',
                color: 0xFFFFFF
      }]
        },
        ready: function () {
                awe.util.require([
                    {
                        capabilities: ['gum', 'webgl'],
                        files: [
            ['lib/awe-standard-dependencies.js', 'lib/awe-standard.js'],
            'lib/awe-standard-window_resized.js',
            'lib/awe-standard-object_clicked.js',
            'lib/awe-jsartoolkit-dependencies.js',
            'lib/awe.marker_ar.js'
          ],
                        success: function () {
                                window.awe.setup_scene();

                                // Points of Interest
                                awe.pois.add({
                                    id: 'marker',
                                    position: {
                                        x: 0,
                                        y: 0,
                                        z: 10000
                                    },
                                    visible: false
                                });

                                // Projections
                                awe.projections.add({
                                    id: 'sketchpad',
                                    
                                    geometry: {
                                        shape: 'plane',
                                        height: w,
                                        width: h,
                                       
                                    },
                                    position: {
                                        x: 0,
                                        y: 0,
                                        z: 0
                                    },
                                    rotation: {
                                        x: 90,
                                        z: 0
                                    },
                                    material: {
                                        type: 'phong',
                                        color: 0xffffff,
                                        opacity:1, 
                                        transparent:false, 
                                        wireframe:false, 
                                        fog:true
                                    },
                                    
                                    
                                    
                                }, {
                                    poi_id: 'marker'
                                });

                                
                                awe.events.add([{
                                    id: 'ar_tracking_marker',
                                    device_types: {
                                        pc: 1,
                                        android: 1
                                    },
                                    register: function (handler) {
                                        window.addEventListener('ar_tracking_marker', handler, false);
                                    },
                                    unregister: function (handler) {
                                        window.removeEventListener('ar_tracking_marker', handler, false);
                                    },
                                    handler: function (event) {
                                        if (event.detail) {
                                            if (event.detail['64']) {
                                                awe.pois.update({
                                                    data: {
                                                        visible: true,
                                                        position: {
                                                            x: 0,
                                                            y: 0,
                                                            z: 0
                                                        },
                                                        matrix: event.detail['64'].transform
                                                    },
                                                    where: {
                                                        id: 'marker'
                                                    }
                                                });
                                                awe.projections.update({
                                                    data: {
                                                        visible: true
                                                    },
                                                    where: {
                                                        id: 'sketchpad'
                                                    }
                                                });
                                            } else if (menu_open) {
                                                awe.projections.update({
                                                    data: {
                                                        visible: false
                                                    },
                                                    where: {
                                                        id: 'sketchpad'
                                                    }
                                                });
                                            } else {
                                                awe.pois.update({
                                                    data: {
                                                        visible: false
                                                    },
                                                    where: {
                                                        id: 'marker'
                                                    }
                                                });
                                            }
                                            awe.scene_needs_rendering = 1;
                                        }
                                    }
            }]);

                                window.addEventListener('object_clicked', function (e) {
                                    switch (e.detail.projection_id) {
                                    case 'sketchpad':
                                       

                                        menu_open = !menu_open;
                                        break;
                                    case 'ar_button_one':
                                    case 'ar_button_two':
                                    case 'ar_button_three':
                                    case 'ar_button_four':
                                    case 'ar_button_five':
                                    case 'ar_button_six':
                                    case 'ar_button_seven':
                                        var request = new XMLHttpRequest();
                                        request.open('GET', 'http://maker.ifttt.com/trigger/' + e.detail.projection_id + '/with/key/yourkeyhere', true);

                                        request.onload = function () {
                                            if (request.status >= 200 && request.status < 400) {
                                                var data = JSON.parse(request.responseText);
                                                console.log(data);
                                            }
                                        };

                                        request.send();
                                        break;
                                    }
                                }, false);
                            } // success()
        },
                    {
                        capabilities: [],
                        success: function () {
                            document.body.innerHTML = '<p>Try this demo in the latest version of Chrome or Firefox on a PC or Android device</p>';
                        }
        }
      ]); // awe.util.require()
            } // ready()
    }); // window.awe.init()
}); // load