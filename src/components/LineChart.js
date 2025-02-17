import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { brushX } from "d3";

const LineChart = ({ data }) => {
  const svgRef = useRef();
  const [transformedData, setTransformedData] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const processData = data.map(scenario => {
      if (!scenario.raw_data?.time || !scenario.raw_data?.devices_usage) {
        console.error("Invalid scenario data", scenario);
        return null;
      }

      const summedUsage = scenario.raw_data.time.map((time, index) => {
        return Object.values(scenario.raw_data.devices_usage).reduce((sum, deviceUsages) => {
          return sum + (deviceUsages[index] || 0);
        }, 0);
      });

      return {
        name: scenario.scenario_name,
        usage: summedUsage
      };
    }).filter(scenario => scenario !== null);

    setTransformedData(processData);
  }, [data]);

  useEffect(() => {
    if (transformedData.length === 0) return;

    const width = 1150;
    const height = 250;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    const clip = svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height)
      .attr("x", margin.left)
      .attr("y", 0);

    const xScale = d3.scaleLinear()
      .domain(selectedDomain || [0, d3.max(transformedData[0].usage.map((_, i) => i))])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(transformedData.flatMap(scenario => scenario.usage))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 6)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Zeit");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Energieverbrauch (kWh)");


    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

    transformedData.forEach((scenario, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 20})`);

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d3.schemeCategory10[index % 10]);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(scenario.name);
    });

    //

    const line = d3.line()
      .x((_, i) => xScale(i))
      .y(d => yScale(d));

    transformedData.forEach((scenario, index) => {
      svg.append("path")
        .attr("clip-path", "url(#clip)")
        .datum(scenario.usage)
        .transition()
        .duration(500)
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[index % 10])
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    const brush = brushX()
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("end", (event) => {
        const selection = event.selection;
        if (selection) {
          const newDomain = [xScale.invert(selection[0]), xScale.invert(selection[1])];
          setSelectedDomain(newDomain);
        }
      });

      
    svg.append("g")
      .attr("class", "brush")
      .call(brush);

    svg.on("dblclick", () => {
        setSelectedDomain(null); 
      });

  }, [transformedData, selectedDomain]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
