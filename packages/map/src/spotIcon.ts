import L from 'leaflet';

export function buildSpotDivIcon(kuerzel: string): L.DivIcon {
  const html = `<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);text-align:center;pointer-events:auto">
    <div style="background:#CC2B2B;color:#fff;border-radius:8px;padding:4px 10px;font-size:13px;font-weight:900;letter-spacing:0.3px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);position:relative;margin-bottom:6px">
      ${kuerzel}
      <div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #CC2B2B"></div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;margin:0 auto;width:fit-content">
      <div style="width:2px;height:12px;background:#CC2B2B"></div>
      <div style="width:8px;height:8px;background:#CC2B2B;border-radius:50%;border:2px solid #fff"></div>
    </div>
  </div>`;
  return L.divIcon({
    className: '',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export const finishFlagIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🏁</div>',
  iconAnchor: [4, 20],
});
