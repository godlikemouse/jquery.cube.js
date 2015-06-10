/*
 * Copyright 2015 Jason Graves (GodLikeMouse/Collaboradev)
 * http://www.collaboradev.com
 *
 * This file is part of jquery.cube.js.
 *
 * The jquery.cube.js plugin is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * The jquery.cube.js plugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with the jquery.cube.js plugin. If not, see http://www.gnu.org/licenses/.
 */

$.fn.cube = function(options){

	var _defaultOptions = {
		position: {
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
		},
		size: {
			width: 150,
			height: 150
		},
		color: [
			"red", //front
			"green", //right
			"orange", //rear
			"blue", //left
			"yellow", //top
			"white" //bottom
		],
		animation: {
			delay: 250
		}
	};

    options = $.extend(_defaultOptions, options);

    var _ref = this;

    var _cube = [];

    //method for parsing moves string into individual moves
    function parse(moves){

        var allowed = ["U","u","R","r","D","d","L","l","F","f","B","b","M","E","S","X","Y","Z","2","'"];

        //clean unnecessary moves
        moves = moves
            .replace(/\(/gm,"")
            .replace(/\)/gm,"")
            .replace(/\[/gm,"")
            .replace(/\]/gm,"")
            .replace(/\n/gm," ");

        //replace old algorithm notation
        //Fw, Bw, Rw, Lw, Uw, Dw
        moves = moves
            .replace(/Fw/gm, "f")
            .replace(/Bw/gm, "b")
            .replace(/Rw/gm, "r")
            .replace(/Lw/gm, "l")
            .replace(/Uw/gm, "u")
            .replace(/Dw/gm, "d")
            .replace(/x/gm, "X")
            .replace(/y/gm, "Y")
            .replace(/z/gm, "Z");

        var m = moves.split(" ");
        var parsed = [];
        for(var i=0; i<m.length; i++){
            var move = m[i];

            //sanity check max length
            if(move.length == 0 || move.length > 3)
                continue;

            //sanity check move notation
            var sane = true;
            for(var j=0; j<move.length; j++){
                var segment = move[j];
                if($.inArray(segment, allowed) < 0){
                    sane = false;
                    break;
                }
            }

            if(!sane)
                continue;

            //check for numeric moves like U2' and B2
            //transform into separate moves
            //U2' => U' U'
            var repeat = move[1];
            if($.isNumeric(repeat)){
                move = move.replace(move[1], "");
                while(repeat--){
                    parsed.push(move);
                }
            }
            else{
                parsed.push(move);
            }

        }

        return parsed;
    }

    //method for positioning cubits according to
    //the cubit data pos
    function positionCubits(cubits, animate){

        var index = 0;
        var length = cubits.length;

        $(cubits).each(function(){
            var cubit = $(this);
            var pos = cubit.data("pos");

            if(animate){

                //animated move
                var translate3d = "translate3d(" + pos.x + "px," + pos.y + "px," + pos.z + "px)";
                var ox = 0;
                var oy = 0;
                var oz = 0;

                cubit.animate({
                    rotateX: pos.ox,
                    rotateY: pos.oy,
                    rotateZ: pos.oz
                },
                {
                    duration: options.animation.delay,
                    step: function(now, fx){
                            switch(fx.prop){
                                case "rotateX":
                                    ox = now;
                                    break;

                                case "rotateY":
                                    oy = now;
                                    break;

                                case "rotateZ":
                                    oz = now;
                                    break;
                            }

                        cubit.css({
                            transform: "rotateX(" + ox + "deg) rotateY(" + oy + "deg) rotateZ(" + oz + "deg) " + translate3d
                        });
                    },
                    complete: function(){

                        //restore back to original rotation
                        cubit
                            .animate({
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0
                        }, 0)
                            .css({
                            transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg) " + translate3d
                        });

                        //wait until all cubits have moved
                        index++;

                        if(index == length){

                            //begin next command
                            _ref.trigger("next-move");
                        }
                    }
                });

            }
            else{
                //non-animated move
                cubit.css({
                    transform: "rotateX(" + pos.ox + "deg) rotateY(" + pos.oy + "deg) rotateZ(" + pos.oz + "deg) translate3d(" + pos.x + "px," + pos.y + "px," + pos.z + "px)"
                });
            }
        });

    }

    //method for updating cubit colors
    //from array => to array
	function updateCubitColors(){

		var from = _ref.data("from");
		var to = _ref.data("to");

		if(!from || !to)
			return;

        //build new colors to be applied
        var paint = [];
        $(to).each(function(){
            paint.push({
                f1: $(this).find(".f1").css("background-color"),
                f2: $(this).find(".f2").css("background-color"),
                f3: $(this).find(".f3").css("background-color"),
                f4: $(this).find(".f4").css("background-color"),
                f5: $(this).find(".f5").css("background-color"),
                f6: $(this).find(".f6").css("background-color")
            });
        });

        //apply new colors
        $(from).each(function(){
            var p = paint.shift();
            $(this).find(".f1").css("background-color", p.f1);
			$(this).find(".f2").css("background-color", p.f2);
			$(this).find(".f3").css("background-color", p.f3);
			$(this).find(".f4").css("background-color", p.f4);
			$(this).find(".f5").css("background-color", p.f5);
			$(this).find(".f6").css("background-color", p.f6);
        });
	}

    //method for retrieving cubits by layer
    //specifying plane x, y, z
    //and depth 0, 1, 2
    //for example:
    // U layer is
    //      plane: y
    //      depth: 0
    // R layer is
    //      plane: x
    //      depth: 2
    // B layer is
    //      plane: z
    //      depth: 0
    function getCubits(plane, depth){
        switch(plane){
            case "y":
                switch(depth){
                    case 0:
                        return [
                            _cube[0].get(0), _cube[1].get(0), _cube[2].get(0),
                            _cube[9].get(0), _cube[10].get(0), _cube[11].get(0),
                            _cube[18].get(0), _cube[19].get(0), _cube[20].get(0)
                        ];
                    case 1:
                        return [
                            _cube[3].get(0), _cube[4].get(0), _cube[5].get(0),
                            _cube[12].get(0), _cube[13].get(0), _cube[14].get(0),
                            _cube[21].get(0), _cube[22].get(0), _cube[23].get(0)
                        ];
                    case 2:
                        return [
                            _cube[6].get(0), _cube[7].get(0), _cube[8].get(0),
                            _cube[15].get(0), _cube[16].get(0), _cube[17].get(0),
                            _cube[24].get(0), _cube[25].get(0), _cube[26].get(0)
                        ];
                }
            case "x":
                switch(depth){
                    case 0:
                        return [
                            _cube[6].get(0), _cube[3].get(0), _cube[0].get(0),
                            _cube[15].get(0), _cube[12].get(0), _cube[9].get(0),
                            _cube[24].get(0), _cube[21].get(0), _cube[18].get(0)
                        ];
                    case 1:
                        return [
                            _cube[7].get(0), _cube[4].get(0), _cube[1].get(0),
                            _cube[16].get(0), _cube[13].get(0), _cube[10].get(0),
                            _cube[25].get(0), _cube[22].get(0), _cube[19].get(0)
                        ];
                    case 2:
                        return [
                            _cube[8].get(0), _cube[5].get(0), _cube[2].get(0),
                            _cube[17].get(0), _cube[14].get(0), _cube[11].get(0),
                            _cube[26].get(0), _cube[23].get(0), _cube[20].get(0)
                        ];
                }
            case "z":
                switch(depth){
                    case 0:
                        return [
                            _cube[6].get(0), _cube[7].get(0), _cube[8].get(0),
                            _cube[3].get(0), _cube[4].get(0), _cube[5].get(0),
                            _cube[0].get(0), _cube[1].get(0), _cube[2].get(0)
                        ];
                    case 1:
                        return [
                            _cube[15].get(0), _cube[16].get(0), _cube[17].get(0),
                            _cube[12].get(0), _cube[13].get(0), _cube[14].get(0),
                            _cube[9].get(0), _cube[10].get(0), _cube[11].get(0)
                        ];
                    case 2:
                        return [
                            _cube[24].get(0), _cube[25].get(0), _cube[26].get(0),
                            _cube[21].get(0), _cube[22].get(0), _cube[23].get(0),
                            _cube[18].get(0), _cube[19].get(0), _cube[20].get(0)
                        ];
                }
        }
    }

    //method for generating the to array from
    //a set of cubits and the move direction
    function generateToArray(cubits, move){

        if(move == "cw"){
            //clockwise
            return [
                cubits[6], cubits[3], cubits[0],
                cubits[7], cubits[4], cubits[1],
                cubits[8], cubits[5], cubits[2]
            ];
        }

        //counter clockwise
        return [
                cubits[2], cubits[5], cubits[8],
                cubits[1], cubits[4], cubits[7],
                cubits[0], cubits[3], cubits[6]
            ];
    }

    //method for orienting cubits
	function orientCubits(){

		//reorient cubits
        var from = _ref.data("from");
        if(!from) return;

        $(from).each(function(){
            var cubit = $(this);
			var pos = cubit.data("pos");
            var f1 = cubit.find(".f1");
            var f2 = cubit.find(".f2");
            var f3 = cubit.find(".f3");
            var f4 = cubit.find(".f4");
            var f5 = cubit.find(".f5");
            var f6 = cubit.find(".f6");

            //Y Layer
			switch(pos.oy){
				case -90: //clockwise turn
					var temp = f1.css("background-color");
					f1.css("background-color", f2.css("background-color"));
					f2.css("background-color", f3.css("background-color"));
					f3.css("background-color", f4.css("background-color"));
					f4.css("background-color", temp);
					break;

                case 90: //counter clockwise turn
					var temp = f4.css("background-color");
					f4.css("background-color", f3.css("background-color"));
					f3.css("background-color", f2.css("background-color"));
					f2.css("background-color", f1.css("background-color"));
					f1.css("background-color", temp);
                    break;
			}

            //X Layer
			switch(pos.ox){
                case -90: //counter clockwise turn
					var temp = f1.css("background-color");
					f1.css("background-color", f5.css("background-color"));
					f5.css("background-color", f3.css("background-color"));
					f3.css("background-color", f6.css("background-color"));
					f6.css("background-color", temp);
					break;

				case 90: //clockwise turn
					var temp = f1.css("background-color");
					f1.css("background-color", f6.css("background-color"));
					f6.css("background-color", f3.css("background-color"));
					f3.css("background-color", f5.css("background-color"));
					f5.css("background-color", temp);
					break;
			}

            //Z Layer
			switch(pos.oz){
                case -90: //counter clockwise turn
					var temp = f5.css("background-color");
					f5.css("background-color", f2.css("background-color"));
					f2.css("background-color", f6.css("background-color"));
					f6.css("background-color", f4.css("background-color"));
					f4.css("background-color", temp);
					break;

				case 90: //clockwise turn
					var temp = f5.css("background-color");
					f5.css("background-color", f4.css("background-color"));
					f4.css("background-color", f6.css("background-color"));
					f6.css("background-color", f2.css("background-color"));
					f2.css("background-color", temp);
					break;
			}

            pos.ox = 0;
            pos.oy = 0;
            pos.oz = 0;
		});
	}

    //method for executing a single move/turn
	_ref.turn = function(move, rotation){

		switch(move){
			case "U":
                var from = getCubits("y", 0);
                var to = generateToArray(from, "cw");

				_ref.data("from", from);
				_ref.data("to", to);

                $(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

            case "U'":
                var from = getCubits("y", 0);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

            case "u":
                var f1 = getCubits("y", 0);
                var f2 = getCubits("y", 1);
                var from = f1.concat(f2);

				var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

            case "u'":
				var f1 = getCubits("y", 0);
                var f2 = getCubits("y", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

			case "R":
                var from = getCubits("x", 2);
                var to = generateToArray(from, "ccw");

				_ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = 90;
				});

				break;

            case "R'":
				var from = getCubits("x", 2);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

            case "r":
				var f1 = getCubits("x", 2);
                var f2 = getCubits("x", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

				_ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = 90;
				});

				break;

            case "r'":
				var f1 = getCubits("x", 2);
                var f2 = getCubits("x", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

				_ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

			case "D":
                var from = getCubits("y", 2);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

            case "D'":
                var from = getCubits("y", 2);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

            case "d":
				var f1 = getCubits("y", 2);
                var f2 = getCubits("y", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw");
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

            case "d'":
				var f1 = getCubits("y", 2);
                var f2 = getCubits("y", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "cw");
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

			case "L":
				var from = getCubits("x", 0);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

			case "L'":
				var from = getCubits("x", 0);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = 90;
				});

				break;

            case "l":
				var f1 = getCubits("x", 0);
                var f2 = getCubits("x", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

            case "l'":
				var f1 = getCubits("x", 0);
                var f2 = getCubits("x", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

			case "F":
				var from = getCubits("z", 2);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = 90;
				});

				break;

			case "F'":
				var from = getCubits("z", 2);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

            case "f":
				var f1 = getCubits("z", 2);
                var f2 = getCubits("z", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

            case "f'":
				var f1 = getCubits("z", 2);
                var f2 = getCubits("z", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

			case "B":
				var from = getCubits("z", 0);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

			case "B'":
				var from = getCubits("z", 0);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = 90;
				});

				break;

            case "b":
				var f1 = getCubits("z", 0);
                var f2 = getCubits("z", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

            case "b'":
				var f1 = getCubits("z", 0);
                var f2 = getCubits("z", 1);
                var from = f1.concat(f2);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var to = t1.concat(t2);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = 90;
				});

				break;

            case "M":
				var from = getCubits("x", 1);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

				break;

            case "M'":
				var from = getCubits("x", 1);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = 90;
				});

				break;

            case "E":
				var from = getCubits("y", 1);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

            case "E'":
				var from = getCubits("y", 1);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

            case "S":
				var from = getCubits("z", 1);
                var to = generateToArray(from, "ccw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = 90;
				});

				break;

            case "S'":
				var from = getCubits("z", 1);
                var to = generateToArray(from, "cw");

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

            case "X":
                var f1 = getCubits("x", 2);
                var f2 = getCubits("x", 1);
                var f3 = getCubits("x", 0);
                var from = f1.concat(f2).concat(f3);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var t3 = generateToArray(f3, "ccw");
                var to = t1.concat(t2).concat(t3);

				_ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = 90;
				});

				break;

            case "X'":
                var f1 = getCubits("x", 2);
                var f2 = getCubits("x", 1);
                var f3 = getCubits("x", 0);
                var from = f1.concat(f2).concat(f3);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var t3 = generateToArray(f3, "cw");
                var to = t1.concat(t2).concat(t3);

				_ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.ox = -90;
				});

                break;

            case "Y":
                var f1 = getCubits("y", 0);
                var f2 = getCubits("y", 1);
                var f3 = getCubits("y", 2);
                var from = f1.concat(f2).concat(f3);

				var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var t3 = generateToArray(f3, "cw");
                var to = t1.concat(t2).concat(t3);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = -90;
				});

				break;

            case "Y'":
                var f1 = getCubits("y", 0);
                var f2 = getCubits("y", 1);
                var f3 = getCubits("y", 2);
                var from = f1.concat(f2).concat(f3);

				var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var t3 = generateToArray(f3, "ccw");
                var to = t1.concat(t2).concat(t3);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oy = 90;
				});

				break;

            case "Z":
				var f1 = getCubits("z", 0);
                var f2 = getCubits("z", 1);
                var f3 = getCubits("z", 2);
                var from = f1.concat(f2).concat(f3);

                var t1 = generateToArray(f1, "cw")
                var t2 = generateToArray(f2, "cw");
                var t3 = generateToArray(f3, "cw");
                var to = t1.concat(t2).concat(t3);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = -90;
				});

				break;

            case "Z'":
				var f1 = getCubits("z", 0);
                var f2 = getCubits("z", 1);
                var f3 = getCubits("z", 2);
                var from = f1.concat(f2).concat(f3);

                var t1 = generateToArray(f1, "ccw")
                var t2 = generateToArray(f2, "ccw");
                var t3 = generateToArray(f3, "ccw");
                var to = t1.concat(t2).concat(t3);

                _ref.data("from", from);
				_ref.data("to", to);

				$(from).each(function(){
					var pos = $(this).data("pos");
					pos.oz = 90;
				});

				break;

            default:
                return;
		}

        positionCubits(from, true);
	}

    //method for executing a set of moves
	_ref.execute = function(moves){

        //parse moves from notation into individual moves
        moves = parse(moves);
        console.info(moves);

		_ref.data("move-stack", moves);
		_ref.trigger("next-move");
	}

	_ref.on("next-move", function(e){

        //color cubits according to new orientation
        orientCubits();

        //copy colors from array => to array
        updateCubitColors();

        _ref.data("from", null);
        _ref.data("to", null);

        var moves = _ref.data("move-stack");
        if(!moves)
            return;

        console.info("moves", moves);

        var move = moves.shift();

        if(!move)
            moves = null;

        _ref.data("move-stack", moves);

        if(move)
            _ref.turn(move);
	})

    //method for creating the cubit
	function createCubit(point){

        //create cubit
		var cubit = $("<div>")
			.addClass("cubit")
			.css({
				width: options.cubit.width + "px",
				height: options.cubit.height + "px"
			});
		_ref.append(cubit);

        //create cubit faces
		for(var i=0; i<6; i++){
			var face = $("<div>")
				.addClass("face f" + (i+1))
                .css({
                    width: options.cubit.width + "px",
                    height: options.cubit.height + "px"
                });
			cubit.append(face);

            //place face
            switch(i){
                case 0:
                    face.css({
                        transform: "translateZ(" + (options.cubit.width/2) + "px)"
                    });
                    break;

                case 1:
                    face.css({
                        left: (options.cubit.width/2) + "px",
                        transform: "rotateY(90deg)"
                    })
                    break;

                case 2:
                    face.css({
                        transform: "translateZ(" + (-(options.cubit.width/2)) + "px) rotateY(180deg)"
                    })
                    break;

                case 3:
                    face.css({
                        left: -(options.cubit.width/2) + "px",
                        transform: "rotateY(-90deg)"
                    })
                    break;

                case 4:
                    face.css({
                        top: -(options.cubit.width/2) + "px",
                        transform: "rotateX(90deg)"
                    })
                    break;

                case 5:
                    face.css({
                        top: (options.cubit.width/2) + "px",
                        transform: "rotateX(90deg) rotateY(180deg)"
                    })
                    break;

            }

			//face.text(_cube.length);
		}

		cubit.data("pos", point);
		//cubit.css({transition: "all " + options.animation.delay});

		_cube.push(cubit);

		return cubit;
	}

    //method for painting the cube faces
	function paintFaces(){
		for(var i=0; i<_cube.length; i++){
			var cubit = _cube[i];

			for(var j=0; j<6; j++){
				cubit.find(".f" + (j+1)).css("background-color", options.color[j]);
			}
		}
	}

    //method for creating the cube
	function createCube(){

		options.cubit = {
			width: options.size.width/3,
			height: options.size.height/3
		};

		for(var z=-options.cubit.width; z<options.cubit.width*2; z+=options.cubit.width){

			for(var i=0; i<9; i++){

				var point = {
					x: 0,
					y: 0,
					z: z,
					ox: 0,
					oy: 0,
					oz: 0
				};

				switch(i){
					case 0:
						point.x -= options.cubit.width;
						point.y -= options.cubit.height;
						break;

					case 1:
						point.y -= options.cubit.height;
						break;

					case 2:
						point.x += options.cubit.width;
						point.y -= options.cubit.height;
						break;

					case 3:
						point.x -= options.cubit.width;
						break;

					case 4:
						break;

					case 5:
						point.x += options.cubit.width;
						break;

					case 6:
						point.x -= options.cubit.width;
						point.y += options.cubit.height;
						break;

					case 7:
						point.y += options.cubit.height;
						break;

					case 8:
						point.x += options.cubit.width;
						point.y += options.cubit.height;
						break;
				}

				createCubit(point);
			}
		}

        //set initial cubit positions
        positionCubits(_ref.find(".cubit"), false);

        //color cubit faces
		paintFaces();
	}

	createCube();

    _ref.data("_cube", _ref);

	return _ref;

}