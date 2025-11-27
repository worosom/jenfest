import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Custom marker component that will render different icons based on type
export const createCustomIcon = (type, color = '#a0522d') => {
  let iconHtml;
  
  switch (type) {
    case 'user':
      // Camp/Tent icon - using clay color
      iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 3px solid #e8d5bb;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8d5bb" style="transform: rotate(45deg);">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
      `;
      break;
      
    case 'post':
      // Pin/Location icon - using sunset orange color
      iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #d97746;
          border: 3px solid #e8d5bb;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8d5bb" style="transform: rotate(45deg);">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;
      break;
      
    case 'activity':
      // Calendar/Event icon - using sunset red color
      iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #c14a3a;
          border: 3px solid #e8d5bb;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8d5bb" style="transform: rotate(45deg);">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
      `;
      break;
      
    default:
      // Default marker - using dirt color
      iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #6b5444;
          border: 3px solid #e8d5bb;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default createCustomIcon;