import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { DialogFormSchema } from "./ui/form/SpreadsheetDialog"; // Import your DialogFormSchema type
import { getColorMap, parseSpreadsheet } from "@/lib/utils";

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
      if (fileMetadata.colorBy) {
        colorMap = getColorMap(data, fileMetadata.colorBy);
      }
      const trace: Partial<Plotly.Data> = {
        x: data.map((row) => row[fileMetadata.x]),
        y: data.map((row) => row[fileMetadata.y]),
        z: data.map((row) => row[fileMetadata.z]),
        mode: "text+markers",
        type: "scatter3d",
        marker: {
          size: 12,
          opacity: 1,
          // Conditionally apply color if fileMetadata.colorBy is defined
          ...(fileMetadata.colorBy
            ? {
                color: data.map((row) => colorMap[row[fileMetadata.colorBy ?? '']]),
              }
            : { color: "Greens" }),
        },
        text: data.map((row) => row[fileMetadata.pointNames]), // Use pointNames as hover text
        hovertext: fileMetadata.pointDescriptions
        ? data.map(row => row[fileMetadata.pointDescriptions ?? ''] ?? '') // Safely access the descriptions
        : data.map(row => row[fileMetadata.pointNames]),
      
        textinfo: "text+value",
      };
      setPlotData([trace]);
    });
  }, [spreadsheet, fileMetadata]);

  return (
    <div
      style={{ width: fileMetadata.width, height: fileMetadata.height }}
      className="flex justify-center items-center"
    >
      <Plot
        data={plotData}
        layout={{ title: fileMetadata.title, autosize: true }}
      />
    </div>
  );
}
