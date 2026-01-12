"use client";

import { useMemo } from "react";

// Element analysis rules
const ELEMENT_ANALYSIS = {
  "C+O": {
    name: "Carbon + Oxygen",
    type: "Organic/Polymer",
    sources: ["Photoresist residue", "Pump backstreaming", "O-ring outgassing", "Incomplete chamber clean"],
    severity: "medium",
    color: "yellow"
  },
  "Si+O": {
    name: "Silicon + Oxygen",
    type: "Oxide Particles",
    sources: ["Chamber wall flaking", "Showerhead erosion", "Focus ring wear", "Re-deposited SiO₂"],
    severity: "medium",
    color: "orange"
  },
  "Ti": {
    name: "Titanium",
    type: "Hardware Erosion",
    sources: ["TiN coated parts", "Clamp rings", "Shields", "PM hardware erosion"],
    severity: "high",
    color: "red",
    critical: true
  },
  "Ni": {
    name: "Nickel",
    type: "Mechanical Wear",
    sources: ["Stainless steel fasteners", "Lift pins", "Shield clips", "Edge ring abrasion"],
    severity: "high",
    color: "red"
  },
  "Al": {
    name: "Aluminum",
    type: "Mechanical Wear",
    sources: ["Hardware components", "Shield clips", "Fasteners"],
    severity: "high",
    color: "red"
  },
  "Ge": {
    name: "Germanium",
    type: "Cross-Contamination",
    sources: ["Previous process cross-contamination", "Shared hardware", "Chamber memory effect"],
    severity: "critical",
    color: "red",
    critical: true
  },
  "Cd": {
    name: "Cadmium",
    type: "Cross-Contamination",
    sources: ["Previous process cross-contamination", "Shared hardware"],
    severity: "critical",
    color: "red",
    critical: true
  },
  "Te": {
    name: "Tellurium",
    type: "Cross-Contamination",
    sources: ["Previous process cross-contamination", "Shared hardware"],
    severity: "critical",
    color: "red",
    critical: true
  }
};

export default function DefectDiagnostics({ defects, chamber, waferType = "CU" }) {
  const diagnostics = useMemo(() => {
    if (!defects || defects.length === 0) return null;

    // Analyze EDX categories
    const edxCounts = {};
    const elementPresence = new Set();
    let totalSize = 0;
    let largeDefects = 0;

    defects.forEach((d) => {
      edxCounts[d.edxCategory] = (edxCounts[d.edxCategory] || 0) + 1;
      
      // Extract elements
      const elements = d.edxCategory.split("+").map(e => e.trim());
      elements.forEach(e => elementPresence.add(e));
      
      totalSize += d.defectSize || 0;
      if (d.defectSize > 150) largeDefects++;
    });

    const avgSize = totalSize / defects.length;

    // Determine contamination type
    const hasCarbon = elementPresence.has("C");
    const hasOxygen = elementPresence.has("O");
    const hasTitanium = elementPresence.has("Ti");
    const hasMetals = elementPresence.has("Ni") || elementPresence.has("Al");
    const hasCrossContam = elementPresence.has("Ge") || elementPresence.has("Cd") || elementPresence.has("Te");

    // Calculate severity score
    let severityScore = 0;
    if (hasCarbon && hasOxygen) severityScore += 2;
    if (hasTitanium) severityScore += 4;
    if (hasMetals) severityScore += 3;
    if (hasCrossContam) severityScore += 5;
    if (avgSize > 200) severityScore += 2;
    if (largeDefects > defects.length * 0.3) severityScore += 3;

    const severity = severityScore >= 10 ? "critical" : severityScore >= 6 ? "high" : severityScore >= 3 ? "medium" : "low";

    // Determine root cause
    let rootCause = "Unknown";
    let confidence = "low";
    const indicators = [];

    if (hasCarbon && hasOxygen && hasTitanium) {
      rootCause = "Polymer contamination trapping metal + oxide particles from hardware erosion";
      confidence = "high";
      indicators.push("C+O+Ti signature detected");
    } else if (hasTitanium && hasOxygen) {
      rootCause = "Ti-coated shield erosion with oxide redeposition";
      confidence = "high";
      indicators.push("Ti+O signature detected");
    } else if (hasCarbon && hasOxygen) {
      rootCause = "Organic/polymer contamination from incomplete chamber clean";
      confidence = "medium";
      indicators.push("C+O signature detected");
    } else if (hasMetals) {
      rootCause = "Mechanical wear from chamber hardware";
      confidence = "medium";
      indicators.push("Metal elements detected");
    }

    if (hasCrossContam) {
      rootCause = "Cross-process contamination from shared hardware or chamber memory effect";
      confidence = "high";
      indicators.push("Ge/Cd/Te detected - NOT normal background");
    }

    if (largeDefects > defects.length * 0.3) {
      indicators.push(`${((largeDefects / defects.length) * 100).toFixed(0)}% defects >150nm`);
    }

    // Determine if systemic
    const isSystemic = defects.length > 5 && chamber;

    return {
      edxCounts,
      elementPresence: Array.from(elementPresence),
      avgSize: avgSize.toFixed(1),
      largeDefects,
      severity,
      severityScore,
      rootCause,
      confidence,
      indicators,
      isSystemic,
      hasCarbon,
      hasOxygen,
      hasTitanium,
      hasMetals,
      hasCrossContam
    };
  }, [defects, chamber]);

  if (!diagnostics) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "high": return "text-green-700";
      case "medium": return "text-yellow-700";
      default: return "text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Severity Alert */}
      <div className={`border-2 rounded-xl p-6 ${getSeverityColor(diagnostics.severity)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {diagnostics.severity === "critical" && "🚨"}
              {diagnostics.severity === "high" && "⚠️"}
              {diagnostics.severity === "medium" && "⚡"}
              {diagnostics.severity === "low" && "✅"}
              Contamination Analysis
            </h3>
            <p className="text-sm mt-1 opacity-90">
              Severity: <span className="font-bold uppercase">{diagnostics.severity}</span> 
              {" "}(Score: {diagnostics.severityScore}/15)
            </p>
          </div>
          {diagnostics.isSystemic && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              SYSTEMIC
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-semibold">Root Cause:</span>
            <p className="mt-1">{diagnostics.rootCause}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Confidence:</span>
            <span className={`uppercase font-bold ${getConfidenceColor(diagnostics.confidence)}`}>
              {diagnostics.confidence}
            </span>
          </div>
        </div>

        {diagnostics.indicators.length > 0 && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <p className="font-semibold text-sm mb-2">Key Indicators:</p>
            <ul className="space-y-1">
              {diagnostics.indicators.map((indicator, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Element Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">🔬 Element Analysis</h3>
        
        <div className="space-y-4">
          {diagnostics.elementPresence.map((element) => {
            // Check for element combinations
            const analysis = ELEMENT_ANALYSIS[element] || 
                           (element.includes("Ti") ? ELEMENT_ANALYSIS["Ti"] : null) ||
                           (element.includes("C") && element.includes("O") ? ELEMENT_ANALYSIS["C+O"] : null) ||
                           (element.includes("Si") && element.includes("O") ? ELEMENT_ANALYSIS["Si+O"] : null);

            if (!analysis) return null;

            const isCritical = analysis.critical;

            return (
              <div key={element} className={`border-l-4 pl-4 py-2 ${
                isCritical ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
              } rounded-r-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{analysis.name}</span>
                      {isCritical && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{analysis.type}</p>
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold">Likely sources:</span>
                      <ul className="mt-1 ml-4 space-y-0.5">
                        {analysis.sources.map((source, i) => (
                          <li key={i}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-blue-900">🔧 Recommended Actions</h3>
        
        <div className="space-y-6">
          {/* Immediate Actions */}
          {(diagnostics.severity === "critical" || diagnostics.severity === "high") && (
            <div>
              <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Immediate (High Priority)
              </h4>
              <ul className="space-y-1.5 ml-8 text-sm">
                {chamber && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">▸</span>
                    <span>Take <span className="font-mono font-bold">{chamber}</span> offline for inspection</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-red-600">▸</span>
                  <span>Inspect shields, focus rings, clamp rings, and showerhead</span>
                </li>
                {diagnostics.hasTitanium && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">▸</span>
                    <span>Look for Ti coating wear and flaking</span>
                  </li>
                )}
                {(diagnostics.hasCarbon && diagnostics.hasOxygen) && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">▸</span>
                    <span>Check for dark polymer film buildup</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Chamber Clean */}
          {(diagnostics.hasCarbon || diagnostics.hasOxygen) && (
            <div>
              <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Chamber Clean Protocol
              </h4>
              <ul className="space-y-1.5 ml-8 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">▸</span>
                  <span>Run extended O₂ plasma clean</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">▸</span>
                  <span>Increase O₂ ratio temporarily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">▸</span>
                  <span>Reduce polymer-forming gases if etch process</span>
                </li>
              </ul>
            </div>
          )}

          {/* Hardware Replacement */}
          {(diagnostics.hasTitanium || diagnostics.hasMetals) && (
            <div>
              <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Hardware Replacement
              </h4>
              <ul className="space-y-1.5 ml-8 text-sm">
                {diagnostics.hasTitanium && (
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">▸</span>
                    <span>Replace worn Ti-coated parts (shields, clamp rings)</span>
                  </li>
                )}
                {diagnostics.hasMetals && (
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">▸</span>
                    <span>Replace any exposed stainless steel components</span>
                  </li>
                )}
                {diagnostics.hasCrossContam && (
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">▸</span>
                    <span className="font-bold text-red-700">Verify no mixed-process hardware reuse</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Process Control */}
          <div>
            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
              Process Control & Verification
            </h4>
            <ul className="space-y-1.5 ml-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">▸</span>
                <span>Add post-clean seasoning wafers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">▸</span>
                <span>Monitor C/Si ratio and Ti atomic % in EDX</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">▸</span>
                <span>Re-run EDX after clean and hardware changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">▸</span>
                <span>Expected results: Carbon ↓, Ti ↓, Metals disappear</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="text-sm text-gray-600">Avg Defect Size</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{diagnostics.avgSize} nm</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="text-sm text-gray-600">Large Defects (&gt;150nm)</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {diagnostics.largeDefects}
            <span className="text-sm text-gray-600 ml-2">
              ({((diagnostics.largeDefects / defects.length) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="text-sm text-gray-600">Elements Detected</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{diagnostics.elementPresence.length}</div>
        </div>
      </div>
    </div>
  );
}