import React, { useRef } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

// Accept className and style so parent can fully control style
const PlacesSearch = ({ onPlaceSelected, placeholder, className = "", style = {} }) => {
  const searchBoxRef = useRef(null);

  const handleLoad = (searchBox) => {
    searchBoxRef.current = searchBox;
  };

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      onPlaceSelected(places[0]);
    }
  };

  return (
    <StandaloneSearchBox
      onLoad={handleLoad}
      onPlacesChanged={handlePlacesChanged}
    >
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
    </StandaloneSearchBox>
  );
};

export default PlacesSearch;