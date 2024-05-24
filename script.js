// Fetch the data
d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
).then((data) => {
  createTreeMap(data);
});

function createTreeMap(data) {
  const width = 1000;
  const height = 800;

  // Create a color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Create the SVG container
  const svg = d3
    .select("#treemap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create the treemap layout
  const treemap = d3.treemap().size([width, height]).paddingInner(1);

  const root = d3
    .hierarchy(data)
    .eachBefore(function (d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(sumBySize)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  // Add the rectangles (tiles)
  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

  cell
    .append("rect")
    .attr("id", (d) => d.data.id)
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.data.category))
    .on("mouseover", function (d) {
      d3.select("#tooltip")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .style("display", "inline-block")
        .attr("data-value", d.data.value)
        .html(d.data.name + "<br>" + d.data.category + "<br>" + d.data.value);
    })
    .on("mouseout", function (d) {
      d3.select("#tooltip").style("display", "none");
    });

  // Add text to the rectangles
  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 5)
    .attr("y", (d, i) => 15 + i * 10)
    .text((d) => d);

  // Add a legend
  const categories = Array.from(
    new Set(root.leaves().map((d) => d.data.category))
  );
  const legend = d3.select("#treemap").append("svg").attr("id", "legend");
  const legendItemSize = 20;
  const legendSpacing = 10;

  const legendItem = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      const height = legendItemSize + legendSpacing;
      const offset = (height * color.domain().length) / 2;
      const horz = (i % 3) * (height * 3);
      const vert = Math.floor(i / 3) * height - offset;
      return "translate(" + horz + "," + vert + ")";
    });

  legendItem
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", color);

  legendItem
    .append("text")
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", legendItemSize - legendSpacing)
    .text((d) => d);

  function sumBySize(d) {
    return d.value;
  }
}
