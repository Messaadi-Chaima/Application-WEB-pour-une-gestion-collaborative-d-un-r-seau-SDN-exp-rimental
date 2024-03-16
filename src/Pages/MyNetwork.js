import React, { useState } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";


export const MyNetwork = () => {
  const [network, setNetwork] = useState(null);

  const data = {
    nodes: new DataSet(Array(31).fill(null).map((_, i) => ({ id: i + 1, label: `${i + 1}` }))),
    edges: new DataSet([
      { from: 1, to: 2, label: "1 → 2" },
      { from: 1, to: 3, label: "1 → 3" },
      { from: 2, to: 4, label: "2 → 4" },
      { from: 2, to: 5, label: "2 → 5" },
      { from: 3, to: 6, label: "3 → 6" },
      { from: 3, to: 7, label: "3 → 7" },
      { from: 4, to: 8, label: "4 → 8" },
      { from: 4, to: 9, label: "4 → 9" },
      { from: 5, to: 10, label: "5 → 10" },
      { from: 5, to: 11, label: "5 → 11" },
      { from: 6, to: 12, label: "6 → 12" },
      { from: 6, to: 13, label: "6 → 13" },
      { from: 7, to: 14, label: "7 → 14" },
      { from: 7, to: 15, label: "7 → 15" },
      { from: 8, to: 16, label: "8 → 16" },
      { from: 8, to: 17, label: "8 → 17" },
      { from: 9, to: 18, label: "9 → 18" },
      { from: 9, to: 19, label: "9 → 19" },
      { from: 10, to: 20, label: "10 → 20" },
      { from: 10, to: 21, label: "10 → 21" },
      { from: 11, to: 22, label: "11 → 22" },
      { from: 11, to: 23, label: "11 → 23" },
      { from: 12, to: 24, label: "12 → 24" },
      { from: 12, to: 25, label: "12 → 25" },
      { from: 13, to: 26, label: "13 → 26" },
      { from: 13, to: 27, label: "13 → 27" },
      { from: 14, to: 28, label: "14 → 28" },
      { from: 14, to: 29, label: "14 → 29" },
      { from: 15, to: 30, label: "15 → 30" },
      { from: 15, to: 31, label: "15 → 31" },
    ]),
  };

  const options = {
    manipulation: {
      editEdge: {
        editWithoutDrag: function (data, callback) {
          console.info(data);
          alert("The callback data has been logged to the console.");
          // you can do something with the data here
          callback(data);
        },
      },
    },
  };

  const handleRef = (ref) => {
    if (ref && !network) {
      setNetwork(new Network(ref, data, options));
    }
  };

  return (
    <div>
      <div id="text"></div>
      <div id="mynetwork" ref={handleRef}></div>
    </div>
  );
};

export default MyNetwork;