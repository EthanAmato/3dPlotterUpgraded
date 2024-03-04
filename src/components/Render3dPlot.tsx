"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { DialogFormSchema } from "./ui/form/SpreadsheetDialog"; // Import your DialogFormSchema type
import { getColorMap, parseSpreadsheet } from "@/lib/utils";
import PlotDownloader from "./PlotDownloader";
import { Layout, SceneAxis } from "plotly.js";
import { Data } from "plotly.js";
interface SpreadsheetRow {
  [key: string]: string | number | boolean | null; // Adjust based on your actual data structure
}

export default function Render3dPlot({
  fileMetadata,
  spreadsheet,
}: {
  fileMetadata: DialogFormSchema;
  spreadsheet: File;
}) {
  const [plotData, setPlotData] = useState<Partial<Plotly.Data>[]>([]);
  let colorMap: Record<string, string> = {};
  useEffect(() => {
    parseSpreadsheet(spreadsheet).then((data) => {
      const updatedPlotData: Partial<Data>[] = [];

      // Define a function to format hover text
      const formatHoverText = (row: SpreadsheetRow) => {
        const xText = `${fileMetadata.x}: ${row[fileMetadata.x]}`;
        const yText = `${fileMetadata.y}: ${row[fileMetadata.y]}`;
        const zText = `${fileMetadata.z}: ${row[fileMetadata.z]}`;
        const nameText = `Name: ${row[fileMetadata.pointNames]}`;
        const descriptionText = fileMetadata.pointDescriptions
          ? `Description: ${String(row[fileMetadata.pointDescriptions ?? ""])}`
          : "";

        // Combine the text pieces, filtering out any empty strings
        return [xText, yText, zText, nameText, descriptionText]
          .filter((text) => text)
          .join("<br>");
      };

      if (fileMetadata.colorBy) {
        colorMap = getColorMap(data, fileMetadata.colorBy);
        const groupedData = data.reduce((acc, row) => {
          const key = row[fileMetadata.colorBy ?? ""] ?? "Unknown";
          if (!acc[key]) acc[key] = [];
          acc[key].push(row);
          return acc;
        }, {});

        Object.entries(groupedData).forEach(([key, group]) => {
          const trace: Partial<Data> = {
            x: group.map((row: SpreadsheetRow) => row[fileMetadata.x]),
            y: group.map((row: SpreadsheetRow) => row[fileMetadata.y]),
            z: group.map((row: SpreadsheetRow) => row[fileMetadata.z]),
            mode: "text+markers",
            text: data.map((row) => row[fileMetadata.pointNames]),
            textfont: {
              size: 12,
            },
            type: "scatter3d",
            name: key,
            marker: {
              size: 12,
              opacity: 1,
              color: colorMap[key],
            },
            hovertext: group.map((row: SpreadsheetRow) => formatHoverText(row)),
            hoverinfo: "text", // Specify to use only custom hover text
          };
          updatedPlotData.push(trace);
        });
      } else {
        const trace: Partial<Data> = {
          x: data.map((row) => row[fileMetadata.x]),
          y: data.map((row) => row[fileMetadata.y]),
          z: data.map((row) => row[fileMetadata.z]),
          mode: "text+markers",
          type: "scatter3d",
          text: data.map((row) => row[fileMetadata.pointNames]),
          marker: { size: 12, opacity: 1, color: "Greens" },
          hovertext: data.map((row) => formatHoverText(row)),
          hoverinfo: "text", // Specify to use only custom hover text
        };
        updatedPlotData.push(trace);
      }

      setPlotData(updatedPlotData);
    });
  }, [spreadsheet, fileMetadata]);

  const layout: Partial<Layout> = {
    title: fileMetadata.title,
    autosize: true,
    width: fileMetadata.width,
    height: fileMetadata.height,
    scene: {
      xaxis: { title: fileMetadata.x },
      yaxis: { title: fileMetadata.y },
      zaxis: { title: fileMetadata.z },
    },
    legend: {
      title: { text: fileMetadata.colorBy },
      orientation: "h",
    },
  };

  return (
    <>
      <div
        style={{ width: fileMetadata.width, height: fileMetadata.height }}
        className="flex justify-center items-center"
      >
        <Plot data={plotData} layout={layout} />
      </div>
      <PlotDownloader data={plotData} layout={layout} />
    </>
  );
}
