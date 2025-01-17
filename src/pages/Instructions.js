// src/pages/Instructions.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllInstructions } from '../services/api';

export default function Instructions() {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllInstructions()
      .then((data) => {
        setInstructions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading instructions...</p>;

  return (
    <div>
      <h1>All Instructions</h1>
      {instructions.length === 0 && <p>No instructions found.</p>}

      <ul>
        {instructions.map((instr) => (
          <li key={instr._id}>
            <Link to={`/instructions/${instr.instruction_id}`}>
              {instr.instruction_id} - {instr.instruction}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
