import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
  
    console.log("Empfangene Daten:", data); // Debugging
  
    if (!data[0]?.raw_data?.time || !data[0]?.raw_data?.devices_usage) {
      console.error("Ungültige Szenariodaten", data);
      return;
    }
  
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data[0].raw_data.time))
      .range([margin.left, width - margin.right]);
  
    const yScale = d3.scaleLinear()
      .domain([
        0,
        d3.max(data.flatMap(scenario =>
          Object.values(scenario.raw_data.devices_usage || {}).flat()
        ))
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);
  
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");
  
    svg.selectAll("*").remove();
  
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  
    const line = d3.line()
      .x((d, i) => xScale(data[0].raw_data.time[i]))
      .y(d => yScale(d));
  
    data.forEach(scenario => {
      if (!scenario.raw_data?.devices_usage) return;
  
      Object.entries(scenario.raw_data.devices_usage).forEach(([device, usage]) => {
        svg.append("path")
          .datum(usage)
          .attr("fill", "none")
          .attr("stroke", d3.schemeCategory10[Math.floor(Math.random() * 10)])
          .attr("stroke-width", 2)
          .attr("d", line);
      });
    });
  
  }, [data]);
  
  

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
