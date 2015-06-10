jquery.cube.js
==============


An implemention of a Rubik's Cube using jQuery, CSS and plain HTML with the ability to read old and new cube notation for executing moves.

## Usage

(Requires jQuery) Include the jquery.cube.js or jquery.cube.min.js file and the jquery.cube.css or the jquery.cube.min.css file.
Create an HTML container for the cube, implement a script block, initialize the cube plugin and send commands to the plugin by use of the execute() method.

## Quick Start

Create an HTML container for the cube.

	<div class="cube"></div>

Create a script block, initialize the plugin and execute some commands.

	<script language="javascript">
		var cube = $(".cube").cube();
		cube.execute("x (R' U R') D2 (R U' R') D2 (R U R') D2 (R U' R') D2 (R U R') D2 (R U' R') D2 R2 x'");
	</script>

## Community

Keep track of development and community news.

* Follow [@Collaboradev on Twitter](https://twitter.com/collaboradev).
* Follow the [Collaboradev Blog](http://www.collaboradev.com).

## License

jquery.cube.js is released under [GPL, version 2.0](http://www.gnu.org/licenses/gpl-2.0.html)
