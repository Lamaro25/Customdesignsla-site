import React from "react";
import PropTypes from "prop-types";

const RingPreview = ({ entry }) => {
  const data = entry.getIn(["data"]).toJS();
  if (!data) return <div>Loading...</div>;

  const result = window.calculateRingPrice
    ? window.calculateRingPrice(data)
    : { total: 0, breakdown: [] };

  return (
    <div>
      <h2>{data.title}</h2>
      <h3>Price Breakdown</h3>
      <ul>
        {result.breakdown.map((item, i) => (
          <li key={i}>{item.label}: {item.value}</li>
        ))}
      </ul>
      <strong>Total: ${result.total}</strong>
    </div>
  );
};

RingPreview.propTypes = { entry: PropTypes.object.isRequired };

export default RingPreview;
