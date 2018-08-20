// Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/freeCodeCamp/full/bgpXyK.
// Fulfill the below user stories and get all of the tests to pass. Give it your own personal style.
// You can use HTML, JavaScript, CSS, and the D3 svg-based visualization library. The tests require
// axes to be generated using the D3 axis property, which automatically generates ticks along the
// axis. These ticks are required for passing the D3 tests because their positions are used to
// determine alignment of graphed elements. You will find information about generating axes at
// https://github.com/d3/d3/blob/master/API.md#axes-d3-axis. Required (non-virtual) DOM elements
// are queried on the moment of each test. If you use a frontend framework (like Vue for example),
// the test results may be inaccurate for dynamic content. We hope to accommodate them eventually,
// but these frameworks are not currently supported for D3 projects.
// User Story #1: I can see a title element that has a corresponding id="title".
// User Story #2: I can see an x-axis that has a corresponding id="x-axis".
// User Story #3: I can see a y-axis that has a corresponding id="y-axis".
// User Story #4: I can see dots, that each have a class of dot, which represent the data being plotted.
// User Story #5: Each dot should have the properties data-xvalue and data-y
// 				value containing their corresponding x and y values.
// User Story #6: The data-xvalue and data-yvalue of each dot should be within the range of the actual
// 				data and in the correct data format. For data-xvalue, integers (full years) or Date objects are
// 				acceptable for test evaluation. For data-yvalue (minutes), use Date objects.
// User Story #7: The data-xvalue and its corresponding dot should align with the corresponding point/value on the x-axis.
// User Story #8: The data-yvalue and its corresponding dot should align with the corresponding point/value on the y-axis.
// User Story #9: I can see multiple tick labels on the y-axis with %M:%S time format.
// User Story #10: I can see multiple tick labels on the x-axis that show the year.
// User Story #11: I can see that the range of the x-axis labels are within the range of the actual x-axis data.
// User Story #12: I can see that the range of the y-axis labels are within the range of the actual y-axis data.
// User Story #13: I can see a legend containing descriptive text that has id="legend".
// User Story #14: I can mouse over an area and see a tooltip with a corresponding id="tooltip"
// 				which displays more information about the area.
// User Story #15: My tooltip should have a data-year property that corresponds to the data-xvalue of the active area.
// Here is the dataset you will need to complete this project: https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json
// You can build your project by forking this CodePen pen. Or you can use this CDN link to run the tests
// in any environment you like: https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js
// Once you're done, submit the URL to your working project with all its tests passing.
// Remember to use the Read-Search-Ask method if you get stuck.

document.addEventListener("DOMContentLoaded", function() {
	const req = new XMLHttpRequest();
	req.open(
		"GET",
		"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
		true
	);
	req.send();
	req.onload = function() {
		const json = JSON.parse(req.responseText);
		/*----------------D3 Code here-----------------*/
		const d3 = require("d3");
		const mg = { top: 50, bottom: 50, right: 30, left: 70 };
		/*-----------------Attributes------------------*/
		const diaAt = {
			height: 500,
			width: 700
		};
		const svgAt = {
			height: mg.top + diaAt.height + mg.bottom,
			width: mg.left + diaAt.width + mg.right,
			id: "svg-canvas"
		};

		const parseMinSec = d3.timeParse("%M:%S");
		const parseYear = d3.timeParse("%Y");
		let minMax = json
			.map((obj) => +obj.Time.substring(0, 2))
			.sort((a, b) => a - b);
		/*Domains are widened so that the dots dont end up overlaying axis*/
		const x = d3
			.scaleTime()
			.domain([
				d3.min(json, (d) => parseYear(d.Year - 1)),
				d3.max(json, (d) => parseYear(d.Year + 1))
			])
			.range([0, diaAt.width]);
		const y = d3
			.scaleTime()
			.domain([
				parseMinSec(`${minMax[0]}:00`),
				parseMinSec(`${minMax[minMax.length - 1] + 1}:00`)
			])
			.range([0, diaAt.height]);

		//Axis
		const yAxis = d3.axisLeft(y).tickFormat(d3.timeFormat("%M:%S"));
		const xAxis = d3.axisBottom(x);

		const svg = d3
			.select("main")
			.append("svg")
			.attr("id", svgAt.id)
			.attr("height", svgAt.height)
			.attr("width", svgAt.width);

		const diag = svg
			.append("g")
			.attr("height", diaAt.height)
			.attr("width", diaAt.width)
			.attr("transform", `translate(${mg.left},${mg.top})`);

		let tooltipDiv = d3
			.select("body")
			.append("div")
			.attr("id", "tooltip")
			.attr("class", "mytooltip")
			.style("opacity", 0);

		const title = svg
			.append("text")
			.attr("id", "title")
			.text("Doping in Professional Bicycle Racing");

		/*---Centering title in data and top margin---*/
		title
			.attr(
				"x",
				mg.left +
					diaAt.width / 2 -
					title.node().getBoundingClientRect().width / 2
			)
			.attr("y", (mg.top + title.node().getBoundingClientRect().height) / 2);
		/*---------Generating axis`s-----------*/
		const myYaxs = diag
			.append("g")
			.call(yAxis)
			.attr("id", "y-axis");
		diag
			.append("g")
			.call(xAxis)
			.attr("id", "x-axis")
			.attr("transform", `translate(0,${diaAt.height})`);
		/*Label for y-axis*/
		const yLabel = diag
			.append("text")
			.attr("id", "label")
			.attr("transform", "rotate(-90)")
			.text("Time in minutes");
		const yLbWid = myYaxs.node().getBoundingClientRect().width;
		yLabel
			.attr(
				"x",
				-(yLabel.node().getBoundingClientRect().height + diaAt.height) / 2
			)
			.attr("y", -yLbWid - (mg.left - yLbWid) / 4);
		/*Circles*/
		const color = d3.scaleOrdinal(d3.schemeCategory10).domain([0, false, true]);

		const tooltipParse = (obj) =>
			`${obj.Name} (${obj.Nationality})</br>${obj.Year} Place ${obj.Place} in ${
				obj.Time
			} min</br>${obj.Doping}`;
		diag
			.selectAll("rect")
			.data(json)
			.enter()
			.append("circle")
			.attr("data-xvalue", (d) => parseYear(d.Year))
			.attr("data-yvalue", (d) => parseMinSec(d.Time))
			.attr("class", "dot")
			.attr("fill", (d) => color(d.Doping === ""))
			.style("stroke", "black")
			.attr("cx", (d) => x(parseYear(d.Year)))
			.attr("cy", (d) => y(parseMinSec(d.Time)))
			.attr("r", (d) => (d.Doping ? 4 : 8))
			.on("mouseover", (d) => {
				tooltipDiv
					.attr("data-year", parseYear(d.Year))
					.transition()
					.duration(100)
					.style("opacity", 0.9);
				tooltipDiv
					.html(tooltipParse(d))
					.style("left", d3.event.pageX + mg.right / 2 + "px")
					.style("top", d3.event.pageY - mg.bottom + "px");
			})
			.on("mouseout", () => {
				tooltipDiv
					.transition()
					.duration(300)
					.style("opacity", 0);
			});
		/*Legend*/
		const lmg = { t: 2, b: 2, r: 2, l: 2 };
		const lrec = { h: 15, w: 15 };
		const legend = diag.append("svg").attr("id", "legend");
		const legItems = legend
			.selectAll(".legend-item")
			.data(color.domain().slice(1))
			.enter()
			.append("g")
			.attr("class", "legend-item")
			.attr(
				"transform",
				(d, i) => `translate(0,${(lmg.t + lrec.h + lmg.b) * i})`
			);

		legItems
			.append("rect")
			.attr("width", lrec.w)
			.attr("height", lrec.h)
			.style("fill", color)
			.style("stroke", "black");

		legItems
			.append("text")
			.text(
				(d) => (d ? "No doping allegations" : "Riders with doping allegations")
			)
			.attr("x", lrec.w + lmg.r)
			.attr("y", lrec.h - 3);
		const legDim = {
			h: legItems.node().getBoundingClientRect().height,
			w: legItems.node().getBoundingClientRect().width
		};
		legend.attr(
			"transform",
			`translate(${(diaAt.width - legDim.w) / 2},${lmg.t})`
		);
	};
});
