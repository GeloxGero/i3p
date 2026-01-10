import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";

ChartJS.register(ArcElement, Tooltip, Legend);

export const pieChartData = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export function PieChart(){
    return (
    <Card className="py-4">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Distribution</p>
          <p className="text-small text-default-500">Live Analytics</p>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody className="overflow-visible py-2">
        <Pie data={pieChartData} options={{ responsive: true }} />
      </CardBody>
    </Card>
  );
    
}


export function BarGraph(){

}

export default {PieChart}