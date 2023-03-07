// definisce un padding per il grafico
const padding = 80

// seleziona l'elemento SVG con id 'chart' tramite d3
const svg = d3.select('#chart')
const otherSvg = d3.select('#otherChart')

// definisce i colori per il grafico
const textColor = '#194d30'

// seleziona l'elemento SVG dalla pagina web con id 'chart'
const svgDOM = document.querySelector('#chart')
const otherSvgDOM = document.querySelector('#otherChart')

// ottiene le dimensioni dell'elemento SVG
let svgWidth = svgDOM.getAttribute('width') 
let svgHeight = svgDOM.getAttribute('height')

let otherSvgWidth = otherSvgDOM.getAttribute('width') 
let otherSvgHeight = otherSvgDOM.getAttribute('height')

// definisce un padding per il grafico
const vizPadding = 150

// utilizzando la funzione d3.csvParse per analizzare i dati del dataset e mapparli ad un oggetto
const data = d3.csvParse(dataset, d => {
	return {
		food_product : d["Food product"],
		
		land_use : d["Land use change"],
		animal_feed : d["Animal Feed"],
		farm : d["Farm"],
		processing : d["Processing"],
		transport : d["Transport"],
		packaging : d["Packging"],
		retail : d["Retail"],
		total_emission : d["Total_emissions"],
		
		emission_kcal : d["Eutrophying emissions per 1000kcal (gPO₄eq per 1000kcal)"],
		emission_kg : d["Eutrophying emissions per kilogram (gPO₄eq per kilogram)"],
		emission_prot : d["Eutrophying emissions per 100g protein (gPO₄eq per 100 grams protein)"],
		
		freshwat_kcal : d["Freshwater withdrawals per 1000kcal (liters per 1000kcal)"],
		freshwat_prot : d["Freshwater withdrawals per 100g protein (liters per 100g protein)"],
		freshwat_kg : d["Freshwater withdrawals per kilogram (liters per kilogram)"],
		
		green_emission_kcal : d["Greenhouse gas emissions per 1000kcal (kgCO₂eq per 1000kcal)"],
		green_emission_prot : d["Greenhouse gas emissions per 100g protein (kgCO₂eq per 100g protein)"],
		
		land_use_kcal : d["Land use per 1000kcal (m² per 1000kcal)"],
		land_use_kg : d["Land use per kilogram (m² per kilogram)"],
		land_use_prot : d["Land use per 100g protein (m² per 100g protein)"],
		
		scarcity_kg : d["Scarcity-weighted water use per kilogram (liters per kilogram)"],
		scarcity_prot : d["Scarcity-weighted water use per 100g protein (liters per 100g protein)"],
		scarcity_kcal : d["Scarcity-weighted water use per 1000kcal (liters per 1000 kilocalories)"]
	}
})

let ordered_data = data

ordered_data.sort(function(a, b) { return b.total_emission - a.total_emission; })



let data_2 = []
data_2.push(ordered_data[0])
data_2.push(ordered_data[1])
data_2.push(ordered_data[2])
data_2.push(ordered_data[3])
data_2.push(ordered_data[4])

//console.log(ordered_data)

let land_use_color = "#F06532"
let animal_feed_color = "#C634FA"
let farm_color = "#3B97E3"
let processing_color = "#1FD8FF"
let transport_color = "#EFD642"
let packaging_color = "#74E61F"
let retail_color = "#7052F4"


// definisce la scala per l'asse x utilizzando d3.scaleLog
const xScale = 	d3.scaleLinear()
	.domain([0, 5]) // the number of records in the dataset (the bars)
	.range([vizPadding, svgWidth-vizPadding]) // the output range (the size of the svg except the padding)

// definisce la scala per l'asse y utilizzando d3.scaleLog
const yScale = d3.scaleLinear()
	.domain([0, 100]) // the dataset values' range (from 0 to its max)
	.range([svgHeight - vizPadding, vizPadding]) 	

	// etichetta generale asse y
	svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", vizPadding / 4)
			.attr("x",- (svgHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Total emission (Kg of CO2 for every Kg of the product)");
	
	// etichetta generale asse x
	svg.append("text")
			.attr("x", svgWidth / 2 )
			.attr("y",  svgHeight - vizPadding/2)
			.style("text-anchor", "middle")
			.text("product name");
	
	
	// titolo del grafico
	svg.append("text")
			.attr("x", svgWidth / 2 )
			.attr("y", vizPadding/2)
			.style("text-anchor", "middle")
			.text("total emission for every product (Kg of CO2 for every Kg of the product)");
	
	
	// assegnazione del colore ai ticks
	svg
		.selectAll('.tick line')
		.style('stroke-width', 0)
		//.style('stroke', '#D3D3D3')


// create the x-axis group
const xAxisGroup = svg.append('g')
  .attr('transform', `translate(0, ${svgHeight - vizPadding})`)
  .call(d3.axisBottom(xScale)
  .ticks(data_2.length)
  .tickSize(10)
  )

  xAxisGroup
  .append('line')
  .attr('x1', xScale.range()[0])
  .attr('y1', 0)
  .attr('x2', xScale.range()[1])
  .attr('y2', 0)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)

// create the y-axis group
const yAxisGroup = svg.append('g')
  .attr('transform', `translate(${vizPadding}, 0)`)
  .call(d3.axisLeft(yScale)
  )

  yAxisGroup
  .append('line')
  .attr('x1', 0)
  .attr('y1', yScale.range()[0])
  .attr('x2', 0)
  .attr('y2', yScale.range()[1])
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('marker-end','url(#arrow)')


// assegnazione del colore al testo dei ticks
svg
	.selectAll('.tick text')
	.style('color', textColor)

// nascondere le linee verticali dei ticks
svg
	.selectAll('path.domain')
	.style('stroke-width', 0)


const barPadding = 2	
let barWidth = xScale(1) - xScale(0) - (barPadding * 2) // the width of a bar is the difference btw 2 discrete intervals of the xscale



//valori CO2
const texts = svg.selectAll(".myTexts")
    .data(data_2)
    .enter()
    .append("text")
	.attr("x", (d, i) => xScale(i) + vizPadding - 15)
    .attr("y", d => yScale(100))
    .attr("dy", "-.35em")
    .text(d => Number(d.total_emission).toFixed(2));

//nomi prodotti
const product_names = svg.selectAll(".myNames")
.data(data_2)
.enter()
.append("text")
.attr("x", (d, i) => xScale(i) + 40)
.attr("y", d => yScale(0) + 20)
.attr("dy", "-.35em")
.text(d => d.food_product);

const land_use_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('rect') // if there is any rect, update it with the new data
.data(data_2)
.enter() // create new elements as needed
.append('rect') // create the actual rects
.attr("id", (d)=> d.food_product)
	.attr('x', (d, i) => barPadding + xScale(i))
	.attr('y', d => yScale(d.land_use/d.total_emission*100))
	.attr('width', barWidth)
	.attr('height', d => (svgHeight - vizPadding) - yScale(d.land_use/d.total_emission*100))
	.attr('fill', land_use_color)
	.style('opacity', 0.8);

const farm_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
	.on("click", function(d, i) {
		createPoint(i);})
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.farm/d.total_emission*100))
		.attr('fill', farm_color)
		.style('opacity', 0.8);

const animal_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100 - d.farm/d.total_emission*100))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.animal_feed/d.total_emission*100))
		.attr('fill', animal_feed_color)
		.style('opacity', 0.8);

const packaging_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
	.on("click", function(d, i) {
		createPoint(i);})
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100 - d.farm/d.total_emission*100 - d.animal_feed/d.total_emission*100))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.packaging/d.total_emission*100))
		.attr('fill', packaging_color)
		.style('opacity', 0.8);

const transport_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
	.on("click", function(d, i) {
		createPoint(i);})
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100 - d.farm/d.total_emission*100 - d.animal_feed/d.total_emission*100 - d.packaging/d.total_emission*100 ))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.transport/d.total_emission*100))
		.attr('fill', transport_color)
		.style('opacity', 0.8);	
const processing_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100 - d.farm/d.total_emission*100 - d.animal_feed/d.total_emission*100 - d.packaging/d.total_emission*100 - d.transport/d.total_emission*100))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.processing/d.total_emission*100))
		.attr('fill', processing_color)
		.style('opacity', 0.8);		
const retail_bars =  svg// adding the dataviz to the correct element in the DOM
.selectAll('bar') // if there is any rect, update it with the new data
	.data(data_2)
	.enter() // create new elements as needed
	.append('rect') // create the actual rects
	.attr("id", (d)=> d.food_product)
		.attr('x', (d, i) => barPadding + xScale(i))
		.attr('y', d => yScale(100 - d.farm/d.total_emission*100 - d.animal_feed/d.total_emission*100 - d.packaging/d.total_emission*100 - d.transport/d.total_emission*100 - d.processing/d.total_emission*100))
		.attr('width', barWidth)
		.attr('height', d => (svgHeight - vizPadding) - yScale(d.retail/d.total_emission*100))
		.attr('fill', retail_color)
		.style('opacity', 0.8);			
		

/* Legenda ScatterPlot */
svg.append("circle").attr("cx",70).attr("cy",20).attr("r", 4).style("fill", land_use_color)
svg.append("circle").attr("cx",70).attr("cy",40).attr("r", 4).style("fill", animal_feed_color)
svg.append("circle").attr("cx",70).attr("cy",60).attr("r", 4).style("fill", farm_color)
svg.append("circle").attr("cx",70).attr("cy",80).attr("r", 4).style("fill", processing_color)
svg.append("circle").attr("cx",70).attr("cy",100).attr("r", 4).style("fill", transport_color)
svg.append("circle").attr("cx",70).attr("cy",120).attr("r", 4).style("fill", packaging_color)
svg.append("circle").attr("cx",70).attr("cy",140).attr("r", 4).style("fill", retail_color)



svg.append("text").attr("x", 80).attr("y", 21).text("land_use").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 40).text("animal_feed").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 60).text("farm").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 80).text("processing").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 100).text("tranport").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 120).text("packaging").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 80).attr("y", 140).text("retail").style("font-size", "11px").attr("alignment-baseline","middle")




function createPoint(i){
	
	otherSvg.selectAll("*").remove()
	
	console.log(i)
	const dat = i
	// definisce la scala per l'asse x utilizzando d3.scaleLog
	const xScale = 	d3.scaleLinear()
	.domain([0, 6]) // the number of records in the dataset (the bars)
	.range([vizPadding, otherSvgWidth-vizPadding]) // the output range (the size of the svg except the padding)

	// definisce la scala per l'asse y utilizzando d3.scaleLog
	const yScale = d3.scaleLinear()
	.domain([0, 100]) // the dataset values' range (from 0 to its max)
	.range([otherSvgHeight - vizPadding, vizPadding]) 	

	// etichetta generale asse y
	otherSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", vizPadding / 4)
			.attr("x",- (otherSvgHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Total emission (Kg of CO2 for every Kg of the product)");

	// etichetta generale asse x
	otherSvg.append("text")
			.attr("x", otherSvgWidth / 2 )
			.attr("y",  otherSvgHeight - vizPadding/2)
			.style("text-anchor", "middle")
			.text("product name");


	// titolo del grafico
	otherSvg.append("text")
			.attr("x", otherSvgWidth / 2 )
			.attr("y", vizPadding/2)
			.style("text-anchor", "middle")
			.text("total emission for every product (Kg of CO2 for every Kg of the product)");


	// assegnazione del colore ai ticks
	otherSvg.selectAll('.tick line')
		.style('stroke-width', 0)
		//.style('stroke', '#D3D3D3')


	// create the x-axis group
	const xAxisGroup = otherSvg.append('g')
	.attr('transform', `translate(0, ${otherSvgHeight - vizPadding})`)
	.call(d3.axisBottom(xScale)
	.ticks(5)
	.tickSize(10)
	)

	xAxisGroup
	.append('line')
	.attr('x1', xScale.range()[0])
	.attr('y1', 0)
	.attr('x2', xScale.range()[1])
	.attr('y2', 0)
	.attr('stroke', 'black')
	.attr('stroke-width', 2)

	// create the y-axis group
	const yAxisGroup = otherSvg.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(d3.axisLeft(yScale)
	)

	yAxisGroup
	.append('line')
	.attr('x1', 0)
	.attr('y1', yScale.range()[0])
	.attr('x2', 0)
	.attr('y2', yScale.range()[1])
	.attr('stroke', 'black')
	.attr('stroke-width', 2)
	.attr('marker-end','url(#arrow)')


	// assegnazione del colore al testo dei ticks
	otherSvg
	.selectAll('.tick text')
	.style('color', textColor)

	// nascondere le linee verticali dei ticks
	otherSvg
	.selectAll('path.domain')
	.style('stroke-width', 0)
	
	const clear_water =  otherSvg
	.selectAll('rect') // if there is any rect, update it with the new data
	.append('rect') // create the actual rects
		.attr('x', barPadding + xScale(1))
		.attr('y', yScale(dat.freshwat_kg))
		.attr('width', barWidth)
		.attr('height', (otherSvgHeight - vizPadding) - yScale(dat.freshwat_kg))
		.attr('fill', land_use_color)
		.style('opacity', 0.8);
}


/*END*/
