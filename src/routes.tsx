import { Navigate } from 'react-router-dom';
import { Dashboard, Chart } from './containers';

const routes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      { path: '/chart', element: <Chart {...{ location: { search: '?pair=EUR/USD&time=30min' } }} /> }
    ]
  }
];

export default routes;
