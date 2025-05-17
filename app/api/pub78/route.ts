import { NextRequest } from "next/server";
export const runtime = "edge";

const BASE = "https://www.irs.gov/pub/irs-soi";

const HEADERS_LIST = [
  "EIN","NAME","ICO","STREET","CITY","STATE","ZIP","GROUP","SUBSECTION",
  "AFFILIATION","CLASSIFICATION","RULING","DEDUCTIBILITY","FOUNDATION",
  "ACTIVITY","ORGANIZATION","STATUS","TAX_PERIOD","ASSET_CD","INCOME_CD",
  "FILING_REQ_CD","PF_FILING_REQ_CD","ACCT_PD","ASSET_AMT","INCOME_AMT",
  "REVENUE_AMT","NTEE_CD","SORT_NAME"
];

function escapeXml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function createSvg(label: string) {
  const fontSize = 12;
  const iconSize = 36;
  const padding = 4;
  const svgWidth = 480;
  const svgHeight = 64;
return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="100%" height="${svgHeight}"
     viewBox="0 0 ${svgWidth} ${svgHeight}"
     preserveAspectRatio="xMinYMin meet">
  <desc>${escapeXml(label)}</desc>
  <foreignObject x="0" y="0" width="${svgWidth}" height="${svgHeight}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      display: flex;
      font-size: ${fontSize}px;
      font-family: sans-serif;
      line-height: 1.15;
      color: #777;
    ">
      <div style="
        flex: 0 0 ${iconSize}px;
        width: ${iconSize}px;
        height: ${iconSize}px;
        margin-right: ${padding}px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg"
             width="${iconSize}" height="${iconSize}"
             viewBox="0 0 64 64">     
            <path stroke="black" fill="#777" fill-opacity="1" stroke-opacity="1" d="M54.388 11.002c-.6-1-6.7-3.9-15.6-5.7-3.6 4-3.6 5.6-3.7 6.2-.1.6 1.2 2.3 2.5 4 2.4 3.2 3.1 3.8 3.5 4.8.7 1.7-.5 5.9-1.3 9.6 0-.1-2.2-8.1-3.1-13.2-.1-.5 0-.7 0-.7-5.4-.5-9.1-.7-9.7 2.1-2.5 0-3.7.7-4 1.2-.6 1.1.1 3.3.6 4.4.4-.9 2.5-.7 3.2-.7.4.1.4.2.5.5v10.7h-6.5l-5.5 15.1c2.5 1.2 5.3 2.2 7 2.2 1.7 0 5.9-2.2 6.5-2.2.5 0 4.7 2.2 6.4 2.2 1.7 0 4.4-.9 7-2.2l-5.5-15.1h-6.5v-10.3c-.1-.6-.4-.9-.6-.9l3.2-.1c-.5-1.8-1.1-3.2-2-3.3.2-.4.5-.6.8-.9h-2.5c.2-1.3 3.5-.9 4.9-.7 1.4 7.2 4.2 17 4.3 17.1.1.1 2.4 1 2.6 1.1 1.3-2.9 3.4-11.5 3.5-13.6 1.7.6 1.1 2.8.7 5.1-1.9 11.7-3.5 15.3-3.8 17.5 1.7-.4 2.6-.7 2.9-.9.2-.4 1-2.3 1.7-4.5 1-3.2 2.5-11.2 2.5-14.4 0-.7-.7-1.6-1.8-2.1 0 0 .6-1 .8-1.7.4-.7.7-2.2.7-2.2.7.2 1.2.5 1.3 1.2.4 3.1.2 3.3-.2 9 0 1.7-.7 5.4-1.3 9.2-1.2 6.8-2.4 9.8-2.4 10.9 1.8-.6 3.2-1.1 3.4-1.3.1-.2 1.4-3.5 2.4-8.6.4-2.2.6-4.3 1-6.5.5-2.9.6-6 .6-8.4 0-3.7.5-3.7-2.3-5.1 1.1-2.9.8-4.9.6-5.5-.5-1-1-1-3.4-.9.8.9.6 2.4.4 3.4-.5-.4-.2-1.1-2.8-1-.4-4.2-1.2-4.6-1.2-4.8-.4-.5-2.5-.2-3.1 0 .5.4 1.4 3.5 1 4.9-.2-.4-3.8-4.5-3.6-5.3.2-.5.5-1 1.7-2.4 4.2.9 11.3 3.5 11.8 4.3.4 1 .8 2.1 1.1 3.7.4 2.4 1.1 8.1.7 16.7-.4 9-1.6 14-1.4 13.8 1.3-.4 3.4-2.4 3.6-2.9.6-1.5.8-6.7 1-11.5-.1-4.7-.6-10.7-.8-13-.7-5.6-1.1-7.1-1.8-8.3zm-32.2 37.4c-1.3 0-3.2-.2-3.2-.2l3.2-9.5 3 9.5c0-.1-1.8.2-3 .2zm16.1-.3s-1.9.2-3.2.2c-1.1 0-3-.2-3-.2l3-9.5zm-8.3-7.3v-3.7h2.8l-4.2 11.8-4.2-11.7h2.8v2.6s0 .2.1.2c.4.2.5.2.5.2zm.3-19.3h-4.8c-.4-1.2 0-1.5 1.1-1.6 1.9-.1 3.6-.1 3.7 1.6zm13.7-5.2c1.7-.2 1 2.9.5 4.2-.7-1.5-1.2-2.4-2.3-3.8.6-.3 1.1-.3 1.8-.4z"/>
            <path stroke="black" fill="#777" fill-opacity="1" stroke-opacity="1" d="M12.688 42.702c.8-1 3.8-4 4.3-5.7.5-2 1-6.8 1-7.9 0 0-3 2.1-4.5 3.7-.7.7-1.6 2-1.6 2-.4-1.7.1-3.7.8-4.8 1-1.7 4.6-4.8 5.1-6.1.8-2.1.7-3.9 1.3-6.1-2.4.9-5.4 2.7-6.9 4.3-.1-2.4.6-4.2 2.2-5.4 2.3-1.8 5.4-2.8 7.3-3.4 1.7-.5 4.5-1 5.8-1.7 2.5-1.2 4.9-4.8 5.5-6.6-.8 0-3.8-.1-6.7 1-1.1.5-1.6 1.5-2 2.3-.5.7-1 1.5-1.4 2.1-1.2 1.8-2.6 2.7-4.4 3.2 0-.1 1.2-.9 2-2.7.7-1.6 1.6-4.6 1.6-4.9-1.6.2-2.5.7-4.2 1.3-1.7.7-2.3 1.5-2.6 2.2-1.2 1.8-.8 7-3.2 8.9.1-2.7.7-5.6-.2-8.9-4.8 2-5.8 3.7-5.4 5.7.5 2.8 3.5 4 4.8 6.4.5.7.6 1.7.6 1.7.1 0-1 1.3-.6 4 0 0-1-2-1.9-3.2-1.4-1.8-4.2-4.8-4.2-4.8-.6 7.5.4 9 .7 9.6 1 1.6 4.4 4 5.2 5.6.4.7.5 1 .5 1 .1.2-.7 1.2-.6 2.6.1.5.2 1 .4 1.7 0 0-1.1-1.6-2.5-3.2-1.2-1.5-3.7-3.3-3.8-3.3-.1.9.4 5 .5 5.7.2 2.1.4 4 2.2 5.9 1.4 1.5 6.3 3.5 7.3 3.9 0 0-.2-1-.7-2.3-.9-1.5-1.7-3.8-1.7-3.8z"/>
         </svg>
      </div>
      <div style="flex: 1; color: #777;">
        ${escapeXml(label)}
      </div>
    </div>
  </foreignObject>
</svg>`;
}
const EMPTY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>`;

export async function GET(r: NextRequest) {
  const p = new URL(r.url).searchParams;
  const entries = Array.from(p.values());

  const ein = entries[0]?.replace(/\D/g, "");
  const location = entries[1]?.toLowerCase();

  if (!ein || !location || ein.length !== 9 || !/^\d{9}$/.test(ein) || !/^[a-z]{2}$/.test(location)) {
    return new Response(EMPTY_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, immutable"
      }
    });
  }

  try {
    for (const path of [`eo_${location}.csv`, `eo4.csv`]) {
      const res = await fetch(`${BASE}/${path}`, { cache: "no-store" });
      const text = await res.text();

      const lines = text.split("\n").map(line => line.replace(/"/g, '').trim());
      const match = lines.find(l => l.startsWith(ein + ","));

      if (match) {
        const values = match.split(",");
        const data: Record<string, string> = {};
        for (let i = 0; i < Math.min(values.length, HEADERS_LIST.length); i++) {
          data[HEADERS_LIST[i]] = values[i];
        }
        const formattedEIN = `${data["EIN"].slice(0, 2)}-${data["EIN"].slice(2)}`;
        const organizationName = (data["NAME"] || "")
          .replace(/%/g, '')
          .toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())
          .trim();
        const subsection = `Section 501(c)(${parseInt(data["SUBSECTION"], 10)})`;
        const label = `The U.S. Internal Revenue Service recognizes ${organizationName} under EIN ${formattedEIN} as a registered ${subsection} nonprofit organization verified by official Publication 78 data. Donating to this cause is generally tax deductible and should be considered safe. © A Stage Reborn™ CC-BY-SA.`;

        return new Response(createSvg(label), {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=86400, immutable"
          }
        });
      }
    }
  } catch {}

  return new Response(EMPTY_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable"
    }
  });
}