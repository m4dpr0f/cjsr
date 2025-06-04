// Simulated race backgrounds represented as SVGs

// Dirt racetrack background
const dirtTrackSvg = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#a67c52" />
  <rect width="800" height="400" fill="url(#dirtPattern)" />
  <defs>
    <pattern id="dirtPattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="10" height="10" fill="#8b6a44" />
      <rect x="10" y="10" width="10" height="10" fill="#8b6a44" />
    </pattern>
  </defs>
</svg>
`;

// Grass racetrack background
const grassTrackSvg = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#4b8a3a" />
  <rect width="800" height="400" fill="url(#grassPattern)" />
  <defs>
    <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="10" height="10" fill="#3e7230" />
      <rect x="10" y="10" width="10" height="10" fill="#3e7230" />
    </pattern>
  </defs>
</svg>
`;

// Snow racetrack background
const snowTrackSvg = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#e8f0ff" />
  <rect width="800" height="400" fill="url(#snowPattern)" />
  <defs>
    <pattern id="snowPattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="10" height="10" fill="#d8e0f0" />
      <rect x="10" y="10" width="10" height="10" fill="#d8e0f0" />
    </pattern>
  </defs>
</svg>
`;

// Nether racetrack background
const netherTrackSvg = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#7c2c2a" />
  <rect width="800" height="400" fill="url(#netherPattern)" />
  <defs>
    <pattern id="netherPattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="10" height="10" fill="#5c1c1a" />
      <rect x="10" y="10" width="10" height="10" fill="#5c1c1a" />
    </pattern>
  </defs>
</svg>
`;

// Convert SVG strings to data URLs
const svgToDataURL = (svg: string): string => {
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
};

// Map of background types to their URLs
const raceBackgrounds: Record<string, string> = {
  dirt: svgToDataURL(dirtTrackSvg),
  grass: svgToDataURL(grassTrackSvg),
  snow: svgToDataURL(snowTrackSvg),
  nether: svgToDataURL(netherTrackSvg),
};

// Function to get background URL by type
export function getRaceBackground(backgroundType: string): string {
  return raceBackgrounds[backgroundType] || raceBackgrounds.dirt;
}
