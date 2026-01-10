"use client";

import { useState } from "react";
import WaferMapCanvas from "@/components/WaferMapCanvas";

export default function ComparePage() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  async function compare() {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/compare", {
      method: "POST",
      body: formData
    });

    setData(await res.json());
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Compare Wafers</h1>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={compare}>Compare</button>

      {data?.results?.map(w => (
        <div key={w.waferId} style={{ marginTop: 40 }}>
          <h2>
            Wafer {w.waferId} — 
            <span style={{
              color:
                w.alert === "GREEN" ? "green" :
                w.alert === "YELLOW" ? "orange" : "red"
            }}>
              {" "}{w.alert}
            </span>
          </h2>

          <p>Similarity Score: {w.similarity.score}</p>

          <WaferMapCanvas defects={w.defects} />
        </div>
      ))}
    </div>
  );
}
