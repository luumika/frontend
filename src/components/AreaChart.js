import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Select, MenuItem, FormControl, InputLabel, Tooltip } from "@mui/material";

const StackedAreaChartWithBrush = ({ data }) => {
  const svgRef = useRef();
  const pieRef = useRef();
  const tooltipRef = useRef(null); 
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedRange, setSelectedRange] = useState(null);
  const [deviceConsumption, setDeviceConsumption] = useState({});
  const [totalConsumption, setTotalConsumption] = useState(0);
  
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });


  const width = 600;
  const height = 250;
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const scenario = data[selectedScenarioIndex];
    if (!scenario || !scenario.raw_data) return;

    const { time, devices_usage } = scenario.raw_data;
    const deviceNames = Object.keys(devices_usage);

    const stack = d3.stack().keys(deviceNames);
    const stackedData = stack(time.map((_, i) => {
      let entry = { time: time[i] };
      deviceNames.forEach(device => {
        entry[device] = devices_usage[device][i] || 0;
      });
      return entry;
    }));

    const xScale = d3.scaleLinear().domain(d3.extent(time)).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData.flat(2))])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(deviceNames);

    const area = d3.area()
      .x(d => xScale(d.data.time))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Zeit");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 35)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Energieverbrauch (kWh)");

    svg.selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("fill", d => color(d.key))
      .attr("opacity", 0.8)
      .attr("d", area);

  
    const brush = d3.brushX()
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("end", (event) => {
        const selection = event.selection;
        if (!selection) {
          setSelectedRange(null);
          return;
        }

        const [x0, x1] = selection.map(xScale.invert);
        setSelectedRange([x0, x1]);

        
        const filteredTimeIndices = time.map((t, i) => (t >= x0 && t <= x1 ? i : null)).filter(i => i !== null);
        
        let newDeviceConsumption = {};
        let total = 0;
        deviceNames.forEach(device => {
          const sum = filteredTimeIndices.reduce((acc, i) => acc + (devices_usage[device][i] || 0), 0);
          newDeviceConsumption[device] = sum;
          total += sum;
        });

        setDeviceConsumption(newDeviceConsumption);
        setTotalConsumption(total);
      });

    svg.append("g").attr("class", "brush").call(brush);

   
    svg.on("dblclick", () => {
      setSelectedRange(null);
      calculateTotalConsumption(); 
    });

   
    function calculateTotalConsumption() {
      let newDeviceConsumption = {};
      let total = 0;
      deviceNames.forEach(device => {
        const sum = time.reduce((acc, _, i) => acc + (devices_usage[device][i] || 0), 0);
        newDeviceConsumption[device] = sum;
        total += sum;
      });

      setDeviceConsumption(newDeviceConsumption);
      setTotalConsumption(total);
    }

    if (!selectedRange) calculateTotalConsumption();
  }, [data, selectedScenarioIndex]);

  useEffect(() => {
    if (!Object.keys(deviceConsumption).length) return;

    const pieData = Object.entries(deviceConsumption).map(([device, value]) => ({ device, value }));
    const radius = 80;
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svgPie = d3.select(pieRef.current);
    svgPie.selectAll("*").remove();

    const g = svgPie.append("g")
      .attr("transform", `translate(${radius},${radius})`);

    g.selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.device))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseenter", (event, d) => {
        const [x, y] = arc.centroid(d); 
        const transform = d3.select(pieRef.current).node().getBoundingClientRect(); 
        setTooltipContent(`${d.data.device}: ${d.data.value.toFixed(2)} kWh`);
        setTooltipPosition({ x: transform.x + x + radius, y: transform.y + y + radius }); 
        setTooltipOpen(true);
      })
      .on("mouseleave", () => {
        setTooltipOpen(false);
      });
  }, [deviceConsumption]);

  return (
    <div>
      <Tooltip
        title={tooltipContent}
        open={tooltipOpen}
        placement="top"
        PopperProps={{
          anchorEl: {
            getBoundingClientRect: () => ({
              top: tooltipPosition.y,
              left: tooltipPosition.x,
              right: tooltipPosition.x,
              bottom: tooltipPosition.y,
              width: 0,
              height: 0
            })
          }
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div>
                <FormControl size="small"  style={{ marginBottom: "20px", minWidth: "150px" }}>
                <InputLabel id="scenario-select-label">Szenario auswählen</InputLabel>
                    <Select
                        labelId="scenario-select-label"
                        value={selectedScenarioIndex}
                        onChange={(event) => setSelectedScenarioIndex(event.target.value)}
                        label="Szenario auswählen"
                    >
                        {data.map((scenario, index) => (
                        <MenuItem key={index} value={index}>
                            {scenario.scenario_name}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div>
                <svg ref={svgRef} width={600} height={250}></svg>
            </div>
            <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#D9A0A0",
            }}>
              Verbrauch: {totalConsumption.toFixed(2)} kWh
            </p>
              <svg ref={pieRef} width={180} height={180}></svg>
            </div>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default StackedAreaChartWithBrush;
