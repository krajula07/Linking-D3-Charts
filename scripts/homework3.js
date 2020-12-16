
var mapSvg;
var mapWidth;
var mapHeight;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
var mapMargin={top: 20, right: 40, bottom: 30, left: 40};
var mapData;
var timeData;
var year = "2000";
var barHeight = 20;
var height = 200;
var color_selected=d3.interpolateRdYlGn;
var color_s="interpolateRdYlGn";
var selectedCountry;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;
console.log("lw:"+lineWidth+"lh:"+lineHeight+"lineInnerWidth:"+lineInnerWidth+"lineInnerHeight:"+lineInnerHeight);
  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){

    mapData = values[0];
    timeData = values[1];
//d3.select('#linechart').selectAll('*').remove();
    drawMap();
  //  drawLegend();

  })

});
document.addEventListener('input', function() {
console.log(document.getElementById("year-input").value) ;
year=document.getElementById("year-input").value;
console.log(document.getElementById("color-scale-select").value);
if(document.getElementById("color-scale-select").value=='interpolateRdYlGn'){
  console.log("matched");
  color_s="interpolateRdYlGn";
  color_selected=d3.interpolateRdYlGn;
}
if(document.getElementById("color-scale-select").value=='interpolateViridis'){
  console.log("matched");
  color_s="interpolateViridis";
  color_selected=d3.interpolateViridis;
}
if(document.getElementById("color-scale-select").value=='interpolateBrBG'){
  console.log("matched");
  color_s="interpolateViridis";
  color_selected=d3.interpolateBrBG;
}
if(document.getElementById("color-scale-select").value=='interpolateTurbo'){
  console.log("matched");
  color_s="interpolateViridis";
  color_selected=d3.interpolateTurbo;
}
if(document.getElementById("color-scale-select").value=='interpolateCividis'){
  console.log("matched");
  color_s="interpolateViridis";
  color_selected=d3.interpolateCividis;
}
d3.select("defs").remove();
d3.selectAll("g").remove();

d3.select('#linechart').selectAll('*').remove();
drawMap();
drawLineChart(selectedCountry);
//drawLegend();
});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year')
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {

  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
        .style("opacity", 0);

  mapSvg = d3.select('#map');

  mapWidth = +mapSvg.style('width').replace('px','');
  mapHeight = +mapSvg.style('height').replace('px','');


  transform_v=mapHeight - mapMargin.bottom - 60;
  transform_v2=mapMargin.left;



  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value


  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year == year)[0];

  // get the min/max GDP values for the selected year
var  extent = getExtentsForYear(yearData);
console.log(extent);
  // get the selected color scale based on the dropdown value
  var colorScale = d3.scaleSequential(color_selected)
                     .domain(extent);


                     console.log("minimum and max:"+extent[0]+extent[1]);
                       axisScale = d3.scaleLinear()
                         .domain(colorScale.domain())
                         .range([transform_v2, 240]);

                     translate_aB=transform_v+barHeight;

                         axisBottom = g => g
                         .attr("class", `x-axis`)
                         .attr("transform","translate(" + 0 + "," +translate_aB  + ")" )

                         .call(d3.axisBottom(axisScale)
                           .ticks(extent[1] / 1000)
                           .tickSize(-barHeight));


                           const defs = mapSvg.append("defs");

//console.log("colorScale:"+color_s);
console.log(colorScale.ticks()+":lol");
console.log("kavya");
console.log("outside linear",colorScale(0));
                           const linearGradient = defs
                           .append("linearGradient")
                               .attr("id", "linear-gradient");
                               linearGradient.selectAll("stop")
                                   .data(colorScale.ticks().map((t, i, n) => {
                                     console.log("inside linear:",colorScale(t));
                                     return {offset: `${100 * i / n.length}%`, color: colorScale(t)}

                                     //{ offset: `${100 * i / n.length}%`, color: colorScale(0)}
                                   }
                                 )
                               )
                                   .enter().append("stop")
                                   .attr("offset", d => d.offset)
                                   .attr("stop-color", d =>{ return d.color});


                                   mapSvg.append('g')
                                     .attr("transform", "translate(" + 0 + "," +transform_v  + ")")
                                     .append("rect")
                                     .attr('transform', "translate(" + transform_v2 + "," +0 + ")")
                                 	.attr("width",  200)
                                 	.attr("height", barHeight)
                                 	.style("fill", "url(#linear-gradient)");


                                   mapSvg.append('g')
                                       .call(axisBottom);
                                    //   d3.selectAll("defs").exit().remove();



  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];

      if(isNaN(val))
        return 'white';

      return colorScale(val);
    })
    .on('mouseover', function (d, i) {
            let gdp = yearData[d.properties.name]
            if (isNaN(gdp) || gdp === "") {
                gdp = "0";
            }
            d3.select(this)
                .style('stroke', 'cyan')
                .style('stroke-width', '4px')
                // .style('class', ".tooltip")

            tooltip.style('class', '.tooltip')
                .text(function () {
                    return "Country: " + d.properties.name + "\nGDP: " + gdp;
                })
                .style('opacity', 1)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 35) + "px")

        })
        .on('mousemove', function (d, i) {
            d3.select(this)
                .style('border-width', '50px')
            // console.log('mousemove on ' + d.properties.name);
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
            tooltip.style('opacity', 0)
        })
    .on('click', function(d,i) {
      d3.select('#linechart').selectAll('*').remove();
      selectedCountry=d.properties.name;
      //d3.selectAll("").remove();
      drawLineChart(d.properties.name);
      console.log('clicked on ' + d.properties.name);
    })  ;

}


//function drawLegend(){


//}
// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {
console.log("in line chart");
  if(!country)
    return;


//d3.select('#linechart').selectAll('g').remove();

lineSvg.attr("width", lineInnerWidth + lineMargin.left + lineMargin.right)
       .attr("height", lineInnerHeight + lineMargin.top + lineMargin.bottom);

console.log(timeData);

const xScale = d3.scaleLinear()
               .range([lineMargin.left, lineInnerWidth+lineMargin.left]);
const yScale = d3.scaleLinear()
                .range([lineInnerHeight, lineMargin.top]);

xScale.domain(d3.extent(timeData, function(d) { return +d.Year; }));
// yScale.domain(d3.extent(timeData, function(d) { return +d[country]; }))
yScale.domain([0,d3.max(timeData.map(val=>+val[country]))]);


lineSvg.append("g")
       .attr("transform", `translate(${lineMargin.left},0)`)
       .call(d3.axisRight(yScale)
       .ticks(lineWidth / 80)
       .tickSize(lineWidth - lineMargin.left - lineMargin.right))
       .call(g => g.select(".domain")
                   .remove())
       .call(g => g.selectAll(".tick line")
           .attr("stroke-opacity", 0.5)
           .attr("stroke-dasharray", "5,10"))
       .call(g => g.selectAll(".tick text")
           .attr("stroke","grey")
           .attr("font-size", "12px")
           .attr("x", -lineMargin.left/3)
           .attr("dy", 4));

const xAxis = d3.axisBottom(xScale);
lineSvg.append("g")
       .call(xAxis.ticks(10,"d"))
       .attr("stroke","grey")
       .attr("font-size", "12px")
       .attr("transform", `translate(0,${lineInnerHeight})`);
//var data=timeData.map((data)=>({"year":+data.Year, [country]:+data[country]}));
lineSvg.append("path")
       .datum(timeData.map((data)=>({"year":+data.Year, [country]:+data[country]})))
       .attr("fill", "none")
       .attr("stroke", "black")
       .attr("stroke-width", 2)
       .attr("d", d3.line()
        .x(function(d) { return xScale(+d.year) })
        .y(function(d) { return yScale(+d[country])})
       );


// X-axis Label
lineSvg.append("text")
    .attr("x", (lineInnerWidth+lineMargin.left)/2)
    .attr("y", lineHeight-(lineMargin.bottom/2))
    .attr("font-size", "16px")
    .attr("stroke","grey")
    .attr("text-anchor", "middle")
    .text("Year");


// Y-axis Label
lineSvg.append("text")
    .attr("x", -lineHeight/2)
    .attr("y", lineMargin.left/2)
    .attr("transform", "rotate(-90)")
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .attr("stroke","grey")
    .text(`GDP for ${country} (based on current USD)`);


    let bisect = d3.bisector(function(d) { return d.Year; }).left;


       let g = lineSvg.append('g')
           .attr("transform", "translate(" + 1 + "," + lineMargin.top-10 +")" )

       let focus = g.append('g')
           .append('circle')
           .style("fill", "none")
           .attr("stroke", "black")
           .attr('r', 10)
           .style("opacity", 0)

       let focusText = d3.select("body")
           .append("div")
             .attr('id', 'linetip')
           .attr("class", "tooltip")
           .style("opacity", 0);
          // Create a rect on top of the svg area: this rectangle recovers mouse position
  lineSvg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', lineWidth)
    .attr('height', lineHeight)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1)
      focusText.style("opacity",1)
    }

    function mousemove() {
        // let x0 = xScale.invert(d3.mouse(this)[0]);
        let x0 = xScale.invert(d3.mouse(this)[0]);
        let i = bisect(timeData, x0, 1);
        let selectedData = timeData[i]
        if (typeof selectedData != "undefined") {
            focus
                .attr("cx", xScale(selectedData.Year))
                .attr("cy", yScale(selectedData[country]))

                focusText
                .text(function () {
                    return "Year: " + selectedData.Year + "\nGDP: " + selectedData[country];
                })
                .style('opacity', 1)
                .style("left", (d3.event.pageX +10) + "px")
                .style("top", (d3.event.pageY -55) + "px")
        }
    }
    function mouseout() {
      focus.style("opacity", 0)
      focusText.style("opacity", 0)
    }



}
