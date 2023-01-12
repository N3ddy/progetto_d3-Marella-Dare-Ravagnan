const svgEl = document.getElementById('chart')
const width = svgEl.getAttribute('width')
const height = svgEl.getAttribute('height')
const padding = 80
const svg = d3.select('#chart')
const color1 = '#87CEFA'
const color2 = '#90EE90'
const textColor = '#194d30'
const pieRadius = 20

const controlledcolor = "orange"
const notcontrollercolor = "lightblue"
const svgDOM = document.querySelector('#chart')
// getting the svg element size
let svgWidth = svgDOM.getAttribute('width') 
let svgHeight = svgDOM.getAttribute('height')

const vizPadding = 70


const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

const describeArc = (x, y, radius, startAngle, endAngle) => {

	var start = polarToCartesian(x, y, radius, endAngle)
	var end = polarToCartesian(x, y, radius, startAngle)

	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

	var d = [
	    "M", start.x, start.y, 
	    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(" ")

	return d + `L ${x} ${y} Z`       
}

// when you need to make the slice of the pie chart : 
// describeArc(pieRadius/2, pieRadius/2, pieRadius, 0, (360*percentage))

const data = d3.csvParse(dataset, d => {
	return {
		companyType : d.companyType,
		nCompanies : +d.nCompanies,
		percControlled : +d.percControlled,
		evasion : +d.evasion
	}
})

var company_size = ["Small  Company","Medium  Company","Large  Company", ""];
var formatCompany = function(d) {
    return company_size[d % 4];      
}


// Set up the scales (mapping the dataset's values to the size of the svg)
const xScale = d3.scaleLinear()
	.domain([0, data.length]) // the number of records in the dataset (the bars)
	.range([vizPadding, svgWidth-vizPadding]) // the output range (the size of the svg except the padding)

const yScale = d3.scaleLinear()
	.domain([0, d3.max(data)["evasion"]]) // the dataset values' range (from 0 to its max)
	.range([svgHeight - vizPadding, vizPadding]) 


let radius = (xScale(1) - xScale(0))/4


const yAxis = d3.axisLeft(yScale)
	.ticks(10)
	.tickSize(- (svgWidth - (vizPadding * 2)))

const yTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(yAxis)

//asse x
const xAxis = d3.axisBottom(xScale)
	.ticks(3)
	.tickSize((svgHeight - (vizPadding)))
	.tickFormat(formatCompany);

const xTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(xAxis)




// colouring the ticks
svg
	.selectAll('.tick line')
	.style('stroke', '#D3D3D3')

// colouring the ticks' text
svg
	.selectAll('.tick text')
	.style('color', textColor)

// hiding the vertical ticks' line
svg
	.selectAll('path.domain')
	.style('stroke-width', 0)

//cerchi
const circles = svg
  .selectAll('circle') // if there is any rect, update it with the new data
  .data(data)
  .enter() // create new elements as needed
  .append('circle')
  .attr('cx',  (d, i) => xScale(i) + vizPadding)
  .attr('cy',  d => yScale(d.evasion))
  .attr('r', radius)
  .style('fill', 'lightblue');

//archi
const arcs = svg
  .selectAll("path")
  .data(data, (d,i) => {return d + i}) //bug risolto da Carlo
  .enter()
  .append("path")
  .attr("d", (d, i) => describeArc((xScale(i) + vizPadding), (yScale(d.evasion)), radius, 0, (d.percControlled*360)))
  .style('fill', 'orange');

//percentuali
const texts = svg.selectAll(".myTexts")
    .data(data)
    .enter()
    .append("text")
	.attr("x", (d, i) => xScale(i) + vizPadding - 15)
    .attr("y", d => yScale(d.evasion) - radius - 10)
    .attr("dy", "-.35em")
    .text(d => d.percControlled);


	//legenda	
	svg.append("circle").attr("cx",570).attr("cy",20).attr("r", 6).style("fill", controlledcolor)
	svg.append("circle").attr("cx",570).attr("cy",60).attr("r", 6).style("fill", notcontrollercolor)

	svg.append("text").attr("x", 400).attr("y", 20).text("controlled company").style("font-size", "15px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 400).attr("y", 60).text("not controlled company").style("font-size", "15px").attr("alignment-baseline","middle")
	
	/*
	const labels = svg // adding the dataviz to the correct element in the DOM
	.selectAll('text.labels') // if there is any rect, update it with the new data
	.data(data)
	.enter() // create new elements as needed
	.append('text') // create the actual rects
	.attr('x', (d, i) => xScale(i) + barWidth / 2)
		.attr('y', d => svgHeight - vizPadding + 16) // positioning the text at the middle of the bar
		.text(d => d.companyType)
		.attr('text-anchor', 'middle') // centring the text
		.attr('class', 'labels')
		.attr('fill', textColor)*/



/*END*/