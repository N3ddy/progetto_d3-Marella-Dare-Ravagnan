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

const vizPadding = 115


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

var company_size = ["Piccola", "Media","Grande"];
var formatCompany = function(d) {
    return company_size[d];      
}


// Set up the scales (mapping the dataset's values to the size of the svg)
const xScale = d3.scaleLinear()
	.domain([0, data.length]) // the number of records in the dataset (the bars)
	.range([vizPadding, svgWidth-vizPadding]) // the output range (the size of the svg except the padding)

const yScale = d3.scaleLinear()
	.domain([0, d3.max(data)["evasion"]]) // the dataset values' range (from 0 to its max)
	.range([svgHeight - vizPadding, vizPadding]) 


let radius = (xScale(1) - xScale(0))/6

/*
const yAxis = d3.axisLeft(yScale)
	.ticks(10)
	.tickSize(- (svgWidth - (vizPadding * 2)))

const yTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(yAxis)
*/

//asse x
const xAxis = d3.axisBottom(xScale)
	.ticks(3)
	.tickSize((svgHeight - (vizPadding*2)))
	.tickFormat(formatCompany);

const xTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, ${vizPadding})`)
	.call(xAxis)

// creo il gruppo per l'asse x
const xAxisGroup = svg.append('g')
  .attr('transform', `translate(0, ${svgHeight - vizPadding})`)
  .attr("fill", "none")
  .call(d3.axisBottom(xScale)
  .ticks(0)
  )

  xAxisGroup
  .append('line')
  .attr('x1', xScale.range()[0])
  .attr('y1', 0)
  .attr('x2', xScale.range()[1])
  .attr('y2', 0)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('marker-end','url(#arrow)')

xAxisGroup
  .append("defs")
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 5)
  .attr("refY", 0)
  .attr("markerWidth", 4)
  .attr("markerHeight", 4)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M0,-5L10,0L0,5")
  .style("fill", "black");

// creo il gruppo per l'asse y
const yAxisGroup = svg.append('g')
  .attr('transform', `translate(${vizPadding}, 0)`)
  .call(d3.axisLeft(yScale)
  .ticks(10)
  .tickSize(- (svgWidth - (vizPadding * 2)))
  )

const yAxisGroup2 = svg.append('g')
  .attr('transform', `translate(${vizPadding}, 0)`)
  .attr("class", "valueLine")
  .call(d3.axisLeft(yScale)
  .ticks(3)
  .tickSize(- (svgWidth - (vizPadding * 2)))
  .tickValues([8900000000 , 3600000000, 2400000000])
  
  )

  yAxisGroup2
  .selectAll('.tick line')
  .each(function (d) {
      // d is the tick's value (in this case, a number)
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-dasharray",  "5 5")

  })
  



  yAxisGroup
  .append('line')
  .attr('x1', 0)
  .attr('y1', yScale.range()[0])
  .attr('x2', 0)
  .attr('y2', yScale.range()[1])
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('marker-end','url(#arrow)')

yAxisGroup
  .append("defs")
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 0)
  .attr("refY", -5)
  .attr("markerWidth", 4)
  .attr("markerHeight", 4)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M-5,0L0,-10L5,0")
  .style("fill", "black");


// colouring the ticks
  svg
	.selectAll('.tick line')
	.style('stroke', '#D3D3D3')


  svg
	.selectAll('.valueLine .tick line')
	.style('stroke', 'black')


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
  .data(data, (d,i) => {return d + i})
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
    .attr("y", d => yScale(d.evasion) - radius - 5)
    .attr("dy", "-.35em")
    .text(d => d.percControlled);


	//legenda e titolo
	//titolo del grafico
	svg.append("text")
	.attr("x", svgWidth/2)
	.attr("y", 20)
	.attr("text-anchor", "middle")
	.text("Grafici a torta che mostra l'evasione (asse y), il tipo di azienda (asse x) e la percentuale di aziende controllate.")
	.style("font-size", "20px")
	.attr("alignment-baseline","middle")


  // etichetta generale asse x
  svg.append("text")
	.attr("x", svgWidth/2)
	.attr("y", 860)
	.attr("text-anchor", "middle")
	.text("tipo di azienda")
	.style("font-size", "15px")
	.attr("alignment-baseline","middle")


  // etichetta generale asse y
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 20)
  .attr("x",- (svgHeight / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "15px")
  .text("capitale evaso [€]");

	svg.append("circle").attr("cx",1000).attr("cy",50).attr("r", 6).style("fill", controlledcolor)
	svg.append("circle").attr("cx",1000).attr("cy",90).attr("r", 6).style("fill", notcontrollercolor)

	svg.append("text").attr("x", 1010).attr("y", 55).text("controllata").style("font-size", "15px").attr("alignment-baseline","left")
	svg.append("text").attr("x", 1010).attr("y", 95).text("non controllata").style("font-size", "15px").attr("alignment-baseline","left")
	
/*END*/