// definisce un padding per il grafico
const padding = 80

// seleziona l'elemento SVG con id 'chart' tramite d3
const svg = d3.select('#chart')

// definisce i colori per il grafico
const textColor = '#194d30'

// seleziona l'elemento SVG dalla pagina web con id 'chart'
const svgDOM = document.querySelector('#chart')

// ottiene le dimensioni dell'elemento SVG
let svgWidth = svgDOM.getAttribute('width') 
let svgHeight = svgDOM.getAttribute('height')

// definisce un padding per il grafico
const vizPadding = 70


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

// crea le etichette per l'asse y
const yAxis = d3.axisLeft(yScale)
	.ticks(Math.E * 1.5)
	.tickSize(- (svgWidth - (vizPadding * 2)))
	.tickFormat(function(d){return parseInt(d);});
const yTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(yAxis)

// etichetta generale asse y
svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", vizPadding / 4)
        .attr("x",- (svgHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Deaths");

// crea le etichette per l'asse x
const xAxis = d3.axisBottom(xScale)
	.ticks(Math.E * 2)
	.tickSize((svgHeight - (vizPadding * 2)))
	.tickFormat(function(d){return parseInt(d);});

const xTicks = svg
	.append('g')
	.attr('transform', `translate(0, ${vizPadding})`)
	.call(xAxis)

// etichetta generale asse x
svg.append("text")
		.attr("x", svgWidth / 2 )
        .attr("y",  svgHeight - vizPadding/2)
        .style("text-anchor", "middle")
        .text("Cases");

// assegnazione del colore ai ticks
svg
	.selectAll('.tick line')
	.style('stroke-width', 0)
	//.style('stroke', '#D3D3D3')

	
svg
	.select('.tick line')
	.style('stroke-width', 1)
	.style('stroke', '#D3D3D3')

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
      .attr("r", 3)
      .style('fill', d => {
		//variabile che ritorna il continente del primo dato trovato nei dati generali con la nazione corrispondente
		var temp = data.filter(item => item.country == d[0] )[0].continent
		if (temp == "Asia") {
		  return '#0000cf';
		} 
		else if (temp == "Europe") {
		  return '#b5006f';
		}
		else if (temp == "Africa") {
			return '#c95e00';
		} else if (temp == "America") {
			return '#6b6600';
		}
		else if (temp == "Oceania") {
			return '#00a130';
		} else if (temp == "Other") {
			return 'black';
		}
		else{
			console.log(temp)
			return('yellow')
		}
	  })

/* Legenda ScatterPlot */
	
	svg.append("circle").attr("cx",163).attr("cy",20).attr("r", 4).style("fill", "#0000cf")
	svg.append("circle").attr("cx",163).attr("cy",40).attr("r", 4).style("fill", "#b5006f")
	svg.append("circle").attr("cx",163).attr("cy",60).attr("r", 4).style("fill", "#c95e00")
	svg.append("circle").attr("cx",163).attr("cy",80).attr("r", 4).style("fill", "#6b6600")
	svg.append("circle").attr("cx",163).attr("cy",100).attr("r", 4).style("fill", "#00a130")
	svg.append("circle").attr("cx",163).attr("cy",120).attr("r", 4).style("fill", "black")

	
	svg.append("text").attr("x", 120).attr("y", 21).text("Asia").style("font-size", "11px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 120).attr("y", 40).text("Europe").style("font-size", "11px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 120).attr("y", 60).text("Africa").style("font-size", "11px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 117).attr("y", 80).text("America").style("font-size", "11px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 117).attr("y", 100).text("Oceania").style("font-size", "11px").attr("alignment-baseline","middle")
	svg.append("text").attr("x", 120).attr("y", 120).text("Other").style("font-size", "11px").attr("alignment-baseline","middle")


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
/*END*/
