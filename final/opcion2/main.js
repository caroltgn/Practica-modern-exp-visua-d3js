const diCaprioBirthYear = 1974;
const age = function(year) { return year - diCaprioBirthYear }
const today = new Date().getFullYear(); // Obtener el año actual
const ageToday = age(today);

// ----------------------------------------------------------

const width = 800;
const height = 600;
const margin = {
    top: 50,
    right: 10,
    left: 40,
    bottom: 40
};

// Crear el lienzo SVG y grupos
const svg = d3.select("div#chart").append("svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("class", "elementGroup").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append("g").attr("class", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
// Definir escalas y ejes
const x = d3.scaleLinear().range([0, width - margin.left - margin.right])
const y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

// Cargar datos
d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year
        d.age = +d.age
});

    // Crear conjuntos de datos
    const diCaprioData = data.map(d => ({ year: d.year, age: age(d.year) }))
    const exData = data.map(d => ({ year: d.year, age: ageToday - age(d.year) }))

    // Definir el dominio de las escalas
    x.domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
    y.domain([0, d3.max(diCaprioData, d => d.age)]);

    // llamar ejes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Crear la línea
    const line = d3.line().x(d => x(d.year)).y(d => y(d.age))

    // Agregar la línea de DiCaprio al gráfico
    elementGroup.append("path")
        .datum(diCaprioData)
        .attr("class", "line")
        .attr("d", line);

    // barras para las ex parejas
    const exdicaprio = x(data[1].year) - x(data[0].year)
    console.log("data[1].year:", data[1].year)
    console.log("data[0].year:", data[0].year)
    console.log("exdicaprio:", exdicaprio)
    console.log(exdicaprio)

    // Agregar barras al gráfico
    elementGroup.selectAll(".bar")
        .data(exData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year)) 
        .attr("y", d => y(d.age)) 
        .attr("width", exdicaprio)
        .attr("height", d => height - margin.top - margin.bottom - y(d.age));
});