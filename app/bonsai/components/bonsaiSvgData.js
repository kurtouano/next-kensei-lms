/**
 * SVG path data for bonsai eyes and mouth customization
 * Contains all the SVG definitions for different eye and mouth types
 */

export const eyeSvgMap = {
  default_eyes: `<ellipse cx="5.89758" cy="8.25661" rx="5.89758" ry="8.25661" fill="black"/>
                 <ellipse cx="68.4119" cy="8.25661" rx="5.89758" ry="8.25661" fill="black"/>`,
  
  cry_eyes: `<svg width="87" height="29" viewBox="0 0 87 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M71 28V3H79V28H71Z" fill="#95D2E8" stroke="#95D2E8" stroke-linecap="round"/>
            <line x1="62" y1="2.5" x2="87" y2="2.5" stroke="black" stroke-width="5"/>
            <path d="M9 28V3H17V28H9Z" fill="#95D2E8" stroke="#95D2E8" stroke-linecap="round"/>
            <line x1="0.0199991" y1="2.50008" x2="25.02" y2="2.70008" stroke="black" stroke-width="5"/>
            </svg>`,

  happy_eyes: `<svg width="77" height="15" viewBox="0 0 77 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L12.4734 6.23452C13.1825 6.52123 13.1996 7.51904 12.5007 7.82988L2 12.5" stroke="black" stroke-width="4" stroke-linecap="round"/>
              <path d="M74.3667 12.5L63.8933 8.26548C63.1842 7.97877 63.1671 6.98096 63.866 6.67012L74.3667 2" stroke="black" stroke-width="4" stroke-linecap="round"/>
              </svg>`,

  flat_eyes: `<line x1="61" y1="2.5" x2="86" y2="2.5" stroke="black" stroke-width="5"/>
              <line y1="2.5" x2="25" y2="2.5" stroke="black" stroke-width="5"/>`,

  wink_eyes: `<svg width="75" height="17" viewBox="0 0 75 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="68.8976" cy="8.25661" rx="5.89758" ry="8.25661" fill="black"/>
              <path d="M2 4L12.4734 8.23452C13.1825 8.52123 13.1996 9.51904 12.5007 9.82988L2 14.5" stroke="black" stroke-width="4" stroke-linecap="round"/>
              </svg>`,

  puppy_eyes: `<ellipse cx="6.84051" cy="9.39304" rx="8.84051" ry="9.39304" fill="black"/>
               <path d="M13.2608 7.3933C13.2608 8.98711 11.1581 11.0898 8.56426 11.0898C5.97044 11.0898 3.86774 8.98711 3.86774 6.3933C3.86774 3.79948 5.97044 1.69678 8.56426 1.69678C11.1581 1.69678 13.2608 3.79948 13.2608 6.3933Z" fill="#D9D9D9"/>
               <ellipse cx="5.1557" cy="13.6291" rx="2.21013" ry="1.47342" fill="#D9D9D9"/>
               <ellipse cx="66.8405" cy="9.39304" rx="8.84051" ry="9.39304" fill="black"/>
               <path d="M69.2607 6.3933C69.2607 8.98711 67.158 11.0898 64.5642 11.0898C61.9704 11.0898 59.8677 8.98711 59.8677 6.3933C59.8677 3.79948 61.9704 1.69678 64.5642 1.69678C67.158 1.69678 69.2607 3.79948 69.2607 6.3933Z" fill="#D9D9D9"/>
               <ellipse cx="68.1557" cy="13.6291" rx="2.21013" ry="1.47342" fill="#D9D9D9"/>`,

  female_eyes: `<svg width="87" height="22" viewBox="0 0 87 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.1264 7.90066C21.1264 12.2641 18.5998 15.8013 15.4831 15.8013C12.3664 15.8013 9.83976 12.2641 9.83976 7.90066C9.83976 3.53725 -14.5 0 15.4831 0C18.5998 0 21.1264 3.53725 21.1264 7.90066Z" fill="black"/>
                <path d="M77.2867 7.90066C77.2867 12.2641 74.7601 15.8013 71.6433 15.8013C68.5266 15.8013 66 12.2641 66 7.90066C66 3.53725 68.5266 0 71.6433 0C101 0 77.2867 3.53725 77.2867 7.90066Z" fill="black"/>
                <ellipse cx="74.2358" cy="18.1179" rx="6.23582" ry="3.11791" fill="#FFCECF"/>
                <ellipse cx="13.2358" cy="18.1179" rx="6.23582" ry="3.11791" fill="#FFCECF"/>
                </svg>`
  };

export const mouthSvgMap = {
  default_mouth: `<path d="M2 2C3.13522 5.78405 7.13424 8.85215 9.59463 3.75399C9.75341 3.42497 10.2607 3.41745 10.4289 3.74177C12.9299 8.56494 17.2452 6.52866 18 2" stroke="black" stroke-width="3" stroke-linecap="round"/>`,
  
  smile_mouth: `<path d="M2 2V2C3.76305 9.45519 14.4903 9.51059 16 2V2" stroke="black" stroke-width="4" stroke-linecap="round"/>`,
  
  kiss_mouth: `<path d="M2 2.19736C4.77021 1.27396 12.6565 4.87195 4.79366 6.37134C3.93428 6.53522 3.7488 7.385 4.5499 7.73663C7.71308 9.12506 12.1003 11.1016 2 13.1974" stroke="black" stroke-width="3" stroke-linecap="round"/>`,
  
  surprised_mouth: `<path d="M7.86452 1H3C1.89543 1 1 1.89543 1 3V19H15V3C15 1.89543 14.1046 1 13 1H7.86452Z" fill="#010101" stroke="black" stroke-width="2"/>
                    <ellipse cx="6" cy="16" rx="6" ry="3" fill="#FF0000"/>`,
  
  bone_mouth: `<path d="M4.77551 4.625H16.2245M4.77551 4.625L2 2M4.77551 4.625L2 8M16.2245 4.625L19 2M16.2245 4.625L19 8" stroke="black" stroke-width="3" stroke-linecap="round"/>`
};

export const getEyeSvg = (selectedEyes) => {
  return eyeSvgMap[selectedEyes] || eyeSvgMap['default_eyes'];
};

export const getMouthSvg = (selectedMouth) => {
  return mouthSvgMap[selectedMouth] || mouthSvgMap['default_mouth'];
};