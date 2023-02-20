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
		day : d.day,
		month : +d.month,
		year : +d.year,
		cases: +d.cases,
		deaths: +d.deaths,
		country: d.country,
		pop2019: +d.pop2019,
		continent: d.continent,
		cum14daysCasesPer100000: +d.cum14daysCasesPer100000
	}
})

// raggruppamento dei dati per paese e filtraggio dei dati con morti maggiori di 0
country_group = d3.rollups(data, v => {
	return {
	"cases" : d3.sum(v, d => d.cases),
    "deaths": d3.sum(v, d => d.deaths)}
	},  d => d.country);

const data_group = d3.filter(country_group, function(d) { return d[1].deaths > 0 })

//casi massimi e morti massime
const maxCases = d3.max(data_group, d => d[1].cases);
const maxDeaths = d3.max(data_group, d => d[1].deaths);

//dominio e codominio
const xDomain = d3.extent(data_group, d => d[1].cases);
const yDomain = d3.extent(data_group, d => d[1].deaths);

// definisce la scala per l'asse x utilizzando d3.scaleLog
const xScale = 	d3.scaleLog()
	.domain(xDomain) // the number of records in the dataset (the bars)
	.range([vizPadding, svgWidth-vizPadding]) // the output range (the size of the svg except the padding)

// definisce la scala per l'asse y utilizzando d3.scaleLog
const yScale = d3.scaleLog()
	.domain(yDomain) // the dataset values' range (from 0 to its max)
	.range([svgHeight - vizPadding, vizPadding]) 	

// etichetta generale asse y
svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", vizPadding / 4)
        .attr("x",- (svgHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Morti");

// etichetta generale asse x
svg.append("text")
		.attr("x", svgWidth / 2 )
        .attr("y",  svgHeight - vizPadding/2)
        .style("text-anchor", "middle")
        .text("Casi di positivita");


// titolo del grafico
svg.append("text")
		.attr("x", svgWidth / 2 )
        .attr("y", vizPadding/2)
        .style("text-anchor", "middle")
        .text("rapporto casi/morti per nazione");


// assegnazione del colore ai ticks
svg
	.selectAll('.tick line')
	.style('stroke-width', 0)
	//.style('stroke', '#D3D3D3')


// create the x-axis group
const xAxisGroup = svg.append('g')
  .attr('transform', `translate(0, ${svgHeight - vizPadding})`)
  .call(d3.axisBottom(xScale)
  .ticks(Math.E * 1.5)
  .tickSize(-5)
  .tickFormat(function(d){return parseInt(d);})
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

// create the y-axis group
const yAxisGroup = svg.append('g')
  .attr('transform', `translate(${vizPadding}, 0)`)
  .call(d3.axisLeft(yScale)
  .ticks(Math.E * 1.5)
  .tickSize(-5)
  .tickFormat(function(d){return parseInt(d);})
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

// assegnazione del colore al testo dei ticks
svg
	.selectAll('.tick text')
	.style('color', textColor)

// nascondere le linee verticali dei ticks
svg
	.selectAll('path.domain')
	.style('stroke-width', 0)

// creazione dei cerchi e posizionamento sulla base dei dati filtrati
svg.append('g')
    .selectAll("dot")
    .data(data_group)
    .enter()
    .append("circle")
	.attr("id", (d) => d[0])
      .attr("cx", (d) =>  xScale(d[1].cases))  
      .attr("cy", (d) => yScale(d[1].deaths))
      .attr("r", 5)
	  .on("click", function(d, i) {
		createPoint(i);})
      .style('fill', d => {
		//variabile che ritorna il continente del primo dato trovato nei dati generali con la nazione corrispondente
		var temp = data.filter(item => item.country == d[0] )[0].continent
		if (temp == "Asia") {
		  return '#0000cf';
		} 
		else if (temp == "Europe") {
		  return '#B05CB8';
		}
		else if (temp == "Africa") {
			return '#c95e00';
		} else if (temp == "America") {
			return '#00A11B';
		}
		else if (temp == "Oceania") {
			return '#E8BF09';
		} else if (temp == "Other") {
			return 'black';
		}
		else{
			console.log(temp)
			return('yellow')
		}
	  })




/* Legenda ScatterPlot */

svg.append("circle").attr("cx",120).attr("cy",20).attr("r", 4).style("fill", "#0000cf")
svg.append("circle").attr("cx",120).attr("cy",40).attr("r", 4).style("fill", "#B05CB8")
svg.append("circle").attr("cx",120).attr("cy",60).attr("r", 4).style("fill", "#c95e00")
svg.append("circle").attr("cx",120).attr("cy",80).attr("r", 4).style("fill", "#00A11B")
svg.append("circle").attr("cx",120).attr("cy",100).attr("r", 4).style("fill", "#E8BF09")
svg.append("circle").attr("cx",120).attr("cy",120).attr("r", 4).style("fill", "black")


svg.append("text").attr("x", 130).attr("y", 21).text("Asia").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 130).attr("y", 40).text("Europe").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 130).attr("y", 60).text("Africa").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 130).attr("y", 80).text("America").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 130).attr("y", 100).text("Oceania").style("font-size", "11px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 130).attr("y", 120).text("Altri").style("font-size", "11px").attr("alignment-baseline","middle")

/*
//aggiunta di una linea 25%
svg.append('line')
    .style("stroke", "black")
    //.style("stroke-width", 1)
	.style("stroke-dasharray", ("10, 3"))
    .attr("x1", xScale(maxCases/4))
    .attr("y1", yScale(1))
    .attr("x2", xScale(maxCases+maxCases/4))
    .attr("y2", yScale(maxDeaths)); 

//aggiunta di una linea 50%
svg.append('line')
    .style("stroke", "black")
    //.style("stroke-width", 1)
	.style("stroke-dasharray", ("10, 3"))
    .attr("x1", xScale(maxCases/2))
    .attr("y1", yScale(1))
    .attr("x2", xScale(maxCases+maxCases/2))
    .attr("y2", yScale(maxDeaths)); 

//aggiunta di una linea 75%
svg.append('line')
    .style("stroke", "black")
    //.style("stroke-width", 1)
	.style("stroke-dasharray", ("10, 3"))
    .attr("x1", xScale(maxCases/2 + maxCases/4))
    .attr("y1", yScale(1))
    .attr("x2", xScale(maxCases+maxCases/2 + maxCases/4))
    .attr("y2", yScale(maxDeaths)); 
*/

function createPoint(i){
	
	otherSvg.selectAll("*").remove()
	// ottengo ogni valore della nazione selezionata
	const current_nation = d3.filter(data, function(d) { return d.country == i[0] })
	
	const total_population = current_nation[0].pop2019

	//raggruppo ogni valore per mese e ottengo la somma dei casi/morti
	const month_group = d3.rollups(current_nation, v => {
		return {
		"cases" : d3.sum(v, d => d.cases),
		"deaths": d3.sum(v, d => d.deaths),
		"percCases": d3.sum(v, d => d.cases)/total_population*100,
		"percDeaths": d3.sum(v, d => d.deaths)/total_population*100,	
		}
		},  d => d.month);


	
	month_group.sort((a, b) => d3.ascending(a[0], b[0]));
	
	//se la lista non ha 12 valori aggiungo i mesi mancanti
	if(month_group.length != 12){		
		let list_empty = [];
		for(let i = 0;i < month_group.length; i++){
			list_empty.push(month_group[i][0]);
		}

		for(let i = 1; i < 12; i++){
			if((list_empty.includes(i)) == false){
				month_group.push(
					{0 : i,
					 1 : {
						"cases" : 0,
						"deaths": 0,
						"percCases": 0,
						"percDeaths": 0,	
					}});
			}
		}
		month_group.sort((a, b) => d3.ascending(a[0], b[0]));
	}
	
	
	

	
	//casi massimi e morti massime	
	const maxCases = d3.max(month_group, d => d[1].cases);
	const maxDeaths = d3.max(month_group, d => d[1].deaths);

	//creo dominio secondo grafico
	const xOtherDomain = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
	 "settembre", "ottobre", "novembre", "dicembre"]
	

	// definisce la scala per l'asse x utilizzando d3.scaleLog
	const xScale = 	d3.scaleLinear()
	.domain([0, xOtherDomain.length]) // the number of records in the dataset (the bars)
	.range([vizPadding, otherSvgWidth-vizPadding]) // the output range (the size of the svg except the padding)


	// definisce la scala per l'asse y utilizzando d3.scaleLog
	const yScale = d3.scaleLinear()
	.domain([0, maxCases]) // the dataset values' range (from 0 to its max)
	.range([otherSvgHeight - vizPadding, vizPadding])


	const yDeathScale = d3.scaleLinear()
	.domain([0, maxDeaths]) // the dataset values' range (from 0 to its max)
	.range([otherSvgHeight - vizPadding, vizPadding])


	//aggiungo i tick all asse x
	const xAxisGroup = otherSvg.append('g')
	.attr('transform', `translate(0, ${otherSvgHeight - vizPadding})`)
	.call(d3.axisBottom(xScale)
	.ticks(12)
	.tickSize(-5)
	.tickFormat(function(d){return xOtherDomain[d];})
	)
	
	xAxisGroup
	.append('line')
	.attr('x1', xScale.range()[0])
	.attr('y1', 0)
	.attr('x2', xScale.range()[1])
	.attr('y2', 0)
	.attr('stroke', 'black')
	.attr('stroke-width', 2)
	
	
	//aggiungo i tick all asse y dei casi
	const yAxisGroup = otherSvg.append('g')
		.attr('transform', `translate(${vizPadding}, 0)`)
		.call(d3.axisLeft(yScale)
		.ticks(10)
		.tickSize(-5)
		.tickFormat(function(d){return parseInt(d);})
		)

	yAxisGroup
		.append('line')
		.attr('x1', 0)
		.attr('y1', yScale.range()[0])
		.attr('x2', 0)
		.attr('y2', yScale.range()[1])
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 2)
		.attr('marker-end','url(#arrow)')
	
		
	//aggiungo i tick all asse y dei morti
	const otherYAxisGroup = otherSvg.append('g')
		.attr('transform', `translate(${otherSvgWidth - vizPadding}, 0)`)
		.call(d3.axisRight(yDeathScale)
		.ticks(10)
		.tickSize(-5)
		.tickFormat(function(d){return parseInt(d);})
		)

	otherYAxisGroup
		.append('line')
		.attr('x1', 0)
		.attr('y1', yScale.range()[0])
		.attr('x2', 0)
		.attr('y2', yScale.range()[1])
		.attr('stroke', '#E61800')
		.attr('stroke-width', 2)
		.attr('marker-end','url(#arrow)')
		

	// titolo del plot
	otherSvg.append("text")
		.attr("x", otherSvgWidth / 2 )
		.attr("y", vizPadding/2)
		.style("text-anchor", "middle")
		.text("plot dei dati della nazione " + `${i[0]}`);


	// etichetta generale asse x
	otherSvg.append("text")
		.attr("x", otherSvgWidth / 2 )
		.attr("y",  otherSvgHeight - vizPadding/2)
		.style("text-anchor", "middle")
		.text("Mesi");

	// etichetta generale asse y sx
	otherSvg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", vizPadding / 4)
		.attr("x",- (otherSvgHeight / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Casi di positivita");

	// etichetta generale asse y dx
	otherSvg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", (otherSvgWidth-vizPadding) + vizPadding / 4 )
		.attr("x",- (otherSvgHeight / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Morti");

	

	// assegnazione del colore al testo dei ticks
	otherSvg
	.selectAll('.tick text')
	.style('color', "black")

	// nascondere le linee verticali dei ticks
	otherSvg
	.selectAll('path.domain')
	.style('stroke-width', 0)

	
	otherSvg.append("path")
      .datum(month_group)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x((d, i) =>  xScale(i))
        .y(d => yScale(d[1].cases))
        )

	otherSvg.append("path")
		.datum(month_group)
		.attr("fill", "none")
		.attr("stroke", "#E61800")
		.attr("stroke-width", 2)
		.attr("d", d3.line()
		  .x((d, i) =>  xScale(i))
		  .y(d => yDeathScale(d[1].deaths))
		  )

	//legenda secondo plot
	otherSvg.append("circle").attr("cx",120).attr("cy",20).attr("r", 4).style("fill", "#0000cf")
	otherSvg.append("circle").attr("cx",120).attr("cy",40).attr("r", 4).style("fill", "#E61800")
	otherSvg.append("text").attr("x", 130).attr("y", 21).text("Casi di positivita").style("font-size", "11px").attr("alignment-baseline","middle")
	otherSvg.append("text").attr("x", 130).attr("y", 40).text("Morti").style("font-size", "11px").attr("alignment-baseline","middle")

		
}


/*END*/
