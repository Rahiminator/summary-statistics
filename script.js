const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    // Redraw chart to update line colours
    if (window.currentData) {
        drawBoxPlot(window.currentData.data, window.currentData.summary);
    }
});

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", e => {
    handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const data = parseCSV(e.target.result);
        const summary = calculateFiveNumberSummary(data);
        window.currentData = { data, summary };
        displayResults(summary);
        drawBoxPlot(data, summary);
    };
    reader.readAsText(file);
}

function parseCSV(csv) {
    return csv
        .split(/\r?\n/)
        .flatMap(row => row.split(","))
        .map(v => Number(v))
        .filter(v => !isNaN(v));
}

function calculateFiveNumberSummary(data) {
    data.sort((a, b) => a - b);
    const mid = Math.floor(data.length / 2);
    return {
        min: data[0],
        q1: median(data.slice(0, mid)),
        median: median(data),
        q3: median(data.slice(Math.ceil(data.length / 2))),
        max: data[data.length - 1]
    };
}

function median(arr) {
    const m = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
}

function displayResults(s) {
    document.getElementById("results").innerHTML = `
        <h3>Five Number Summary</h3>
        <p><strong>Min:</strong> ${s.min}</p>
        <p><strong>Q1:</strong> ${s.q1}</p>
        <p><strong>Median:</strong> ${s.median}</p>
        <p><strong>Q3:</strong> ${s.q3}</p>
        <p><strong>Max:</strong> ${s.max}</p>
    `;
}

function drawBoxPlot(data, s) {
    d3.select("#plot").html("");

    const isDark = document.body.classList.contains("dark");
    const lineColor = isDark ? "#ffffff" : "#000000";

    const margin = { top: 20, right: 30, bottom: 40, left: 30 };
    const width = 600;
    const height = 220;

    const svg = d3.select("#plot")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain([s.min, s.max])
        .range([0, innerWidth]);

    const center = innerHeight / 2;
    const boxHeight = 40;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    const showTip = (e, label, value) => {
        tooltip
            .style("opacity", 1)
            .html(`<strong>${label}</strong>: ${value}`)
            .style("left", e.pageX + 10 + "px")
            .style("top", e.pageY - 20 + "px");
    };

    const hideTip = () => tooltip.style("opacity", 0);

    g.append("line")
        .attr("x1", x(s.min))
        .attr("x2", x(s.max))
        .attr("y1", center)
        .attr("y2", center)
        .attr("stroke", lineColor);

    g.append("rect")
        .attr("x", x(s.q1))
        .attr("y", center - boxHeight / 2)
        .attr("width", x(s.q3) - x(s.q1))
        .attr("height", boxHeight)
        .attr("fill", "#4f46e5")
        .attr("opacity", 0.7)
        .on("mousemove", e => {
            const iqrValue = s.q3 - s.q1;  // compute Q3 - Q1
            showTip(e, "IQR", `${s.q3} – ${s.q1} = ${iqrValue}`);
        })
        .on("mouseout", hideTip);

    const markers = [
        { label: "Min", value: s.min },
        { label: "Q1", value: s.q1 },
        { label: "Median", value: s.median },
        { label: "Q3", value: s.q3 },
        { label: "Max", value: s.max }
    ];

    g.selectAll(".marker")
        .data(markers)
        .enter()
        .append("line")
        .attr("x1", d => x(d.value))
        .attr("x2", d => x(d.value))
        .attr("y1", center - boxHeight / 2)
        .attr("y2", center + boxHeight / 2)
        .attr("stroke", lineColor)
        .on("mousemove", (e, d) => showTip(e, d.label, d.value))
        .on("mouseout", hideTip);
}