// src/pages/Actions.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllActions } from '../services/api';

export default function Actions() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllActions()
      .then((data) => {
        setActions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading actions...</p>;

  return (
    <div>
      <h1>All Actions</h1>
      {actions.length === 0 && <p>No actions found.</p>}

      <ul>
        {actions.map((action) => (
          <li key={action._id}>
            <Link to={`/actions/${action.action_id}`}>
              {action.action_id} - {action.task}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
