// CHART START
// 1. aquí hay que poner el código que genera la gráfica
//definir constantes
let years;
let winners;
let originalData;


const width = 800;
const height = 400;
const margin = {
    top: 10,
    bottom: 40,
    right: 10,
    left: 40
};
//declarar svg 
const svg = d3.select("div#chart").append("svg").attr("width", width).attr("height", height);
const elementGroup = svg.append("g").attr("class", "elementGroup").attr("transform", `translate(${margin.left}, ${margin.top})`);
const axisGroup = svg.append("g").attr("class", "axisGroup");
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`);
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`);

//definir escala
const x = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(0.1);
const y = d3.scaleLinear().range([height - margin.bottom - margin.top, 0]);

//definir ejes
const xAxis = d3.axisBottom().scale(x);
const yAxis = d3.axisLeft().scale(y);

//data call
d3.csv("WorldCup.csv").then(data => {
    originalData = data;
    data.forEach(d => {
        d.Year = +d.Year;
    });

    years = data.map(d => d.Year);

    //Agrupar por ganador

    const wins_total = d3.nest().key(d => d.Winner).entries(data.filter(d => d.Winner !== ''));

    //dominio

    x.domain(data.filter(d => d.Winner !== '').map(d => d.Winner));
    y.domain([0, d3.max(wins_total.map(d => d.values.length))]);

    //llamo a los ejes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    update(years[years.length - 1]); // Cargar la visualización inicial con el último año
    slider();

});

// update:
function update(year) {
    const chartData = filterDataByYear(year);
    const max_wins = d3.max(chartData.map(d => d.values.length));

    // Actualizar dominio y ejes
    x.domain(chartData.map(d => d.key));
    y.domain([0, max_wins]);
    yAxis.ticks(max_wins);

    // Actualizar ejes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // enlazar las actualizaciones y borrar si hay uno anterior
    const bars = elementGroup.selectAll("rect").data(chartData);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("class", d => d.values.length < max_wins ? 'no_max' : 'max')
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.values.length)) 
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - margin.top - y(d.values.length)); 

    bars.exit().remove(); // Elimina elementos antiguos si los hay
}
// treat data:
function filterDataByYear(year) {
    const filteredData = originalData.filter(d => +d.Year <= year && d.Winner !== '');
    const winfilter = d3.nest().key(d => d.Winner).entries(filteredData);
    return winfilter;
}

// slider:
function slider() {
    // esta función genera un slider:
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))
        .max(d3.max(years))
        .step(4)
        .width(550) //lo modifico porque con 580 no se veía el 2022 por problema de anchura
        .ticks(years.length)
        .default(years[years.length - 1])
        .on('onchange', val => {
            d3.select('#value-time').text(val);
            update(val);
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 600)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(sliderTime.value());
}