import React from "react";
import { Button } from "./ui/button";
import { Data, Layout } from "plotly.js";

export default function PlotDownloader({
  data,
  layout,
}: {
  data: Partial<Data>[];
  layout: Partial<Layout>;
}) {
  function handleClick() {
    async function getPlotlyScript() {
      // fetch
      const plotlyRes = await fetch("https://cdn.plot.ly/plotly-latest.js");
      // get response as text
      return await plotlyRes.text();
    }
    async function getHtml() {
      const plotlyModuleText = await getPlotlyScript();

      return `
                <head>
                  <meta charset="utf-8" />
                </head>
          
                <script type="text/javascript">
                  ${plotlyModuleText}
                <\/script>
              
                <div id="plotly-output"></div>
                
                <script type="text/javascript">
                  Plotly.newPlot(
                    'plotly-output', 
                    ${JSON.stringify(data)},
                    ${JSON.stringify(layout)}
                  )
              <\/script>
            `;
    }
    async function exportToHtml() {
      // Create URL
      const blob = new Blob([await getHtml()], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Determine the download filename based on layout.title
      let filename = "export.html"; // Default filename
      if (
        typeof layout.title === "object" &&
        layout.title !== null &&
        "text" in layout.title
      ) {
        // If layout.title is an object and has a 'text' property, use it for the filename
        filename = `${layout.title.text}.html`;
      } else if (typeof layout.title === "string") {
        // If layout.title is a string, use it directly for the filename
        filename = `${layout.title}.html`;
      }

      // Create downloader
      const downloader = document.createElement("a");
      downloader.href = url;
      downloader.download = filename;

      // Trigger click
      downloader.click();

      // Clean up
      URL.revokeObjectURL(url);
    }
    exportToHtml()
  }

  return (
    <>
      <Button onClick={handleClick}>Download As HTML</Button>
    </>
  );
}
