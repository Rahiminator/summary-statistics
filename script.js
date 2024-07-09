document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            const data = parseCSV(contents);
            const summary = calculateFiveNumberSummary(data);
            displayResults(summary);
            drawBoxPlot(data, summary);
        };
        reader.readAsText(file);
    }
}

function parseCSV(csv) {
    const rows = csv.split('\n');
    const data = [];
    rows.forEach(row => {
        const values = row.split(',').map(Number).filter(n => !isNaN(n));
        data.push(...values);
    });
    return data;
}

function calculateFiveNumberSummary(data) {
    data.sort((a, b) => a - b);
    const min = data[0];
    const max = data[data.length - 1];
    const median = calculateMedian(data);
    const q1 = calculateMedian(data.slice(0, Math.floor(data.length / 2)));
    const q3 = calculateMedian(data.slice(Math.ceil(data.length / 2)));
    return { min, q1, median, q3, max };
}

function calculateMedian(data) {
    const mid = Math.floor(data.length / 2);
    return data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];
}

function displayResults(summary) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Five Number Summary</h2>
        <p>Min: ${summary.min}</p>
        <p>Q1: ${summary.q1}</p>
        <p>Median: ${summary.median}</p>
        <p>Q3: ${summary.q3}</p>
        <p>Max: ${summary.max}</p>
    `;
}

function drawBoxPlot(data, summary) {
    const margin = { top: 10, right: 30, bottom: 40, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    d3.select("#plot").html("");

    const svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
        .domain([summary.min, summary.max])
        .range([0, width]);

    const y = d3.scaleBand()
        .range([height / 2, height / 2])
        .padding(0.5);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

    const center = height / 2;
    const boxHeight = 30;

    svg.append("line")
        .attr("x1", x(summary.min))
        .attr("x2", x(summary.max))
        .attr("y1", center)
        .attr("y2", center)
        .attr("stroke", "black");

    svg.append("rect")
        .attr("x", x(summary.q1))
        .attr("y", center - boxHeight / 2)
        .attr("height", boxHeight)
        .attr("width", x(summary.q3) - x(summary.q1))
        .attr("stroke", "black")
        .style("fill", "#69b3a2");

    svg.selectAll("toto")
        .data([summary.min, summary.median, summary.max])
        .enter()
        .append("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", center - boxHeight / 2)
        .attr("y2", center + boxHeight / 2)
        .attr("stroke", "black");
}