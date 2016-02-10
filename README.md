jquery.cube.js
==============


An implementation of a Rubik's Cube using jQuery, CSS and plain HTML with the ability to read old and new cube notation for executing moves.

## Compatibility

| Browser | Compatibility |
| ------- | ----- |
| Chrome | Perfect |
| Firefox | Working though Mozilla CSS3 flickers backface visibility |
| Opera | Perfect |
| Safari | Perfect |

## Usage

(Requires jQuery) Include the jquery.cube.js or jquery.cube.min.js file and the jquery.cube.css or the jquery.cube.min.css file.
Create an HTML container for the cube, implement a script block, initialize the cube plugin and send commands to the plugin by use of the execute() method.

## Quick Start

Create an HTML container for the cube.

	<div class="cube"></div>

In JavaScript, initialize the plugin and execute some commands.

	var cube = $(".cube").cube();
	cube.execute("x (R' U R') D2 (R U' R') D2 (R U R') D2 (R U' R') D2 (R U R') D2 (R U' R') D2 R2 x'");

## Options

The following table specifies the options available to be used in conjunction with the plugin.

| Name | Description |
| ---- | ----------- |
| size.width | Controls the cube width in pixels. (default 150) |
| size.height | Controls the cube height in pixels. (default 150) |
| color | Array specifying edge colors. [ front, right, rear, left, top, bottom ] (default [ "red", "green", "orange", "blue", "yellow", "white" ] |
| animation.delay | Specifies the animation delay in milliseconds. (default 250) |

    var cube = $(".cube").cube({
        animation: {
            delay: 500 //half a second per turn animation
        },
        colors: ["red", "blue", "orange", "green", "white", "yellow"] //original rubik colors
    });

## Community

Keep track of development and community news.

* Follow [@Collaboradev on Twitter](https://twitter.com/collaboradev).
* Follow the [Collaboradev Blog](http://www.collaboradev.com).

## License

jquery.cube.js is released under [GPL, version 2.0](http://www.gnu.org/licenses/gpl-2.0.html)
